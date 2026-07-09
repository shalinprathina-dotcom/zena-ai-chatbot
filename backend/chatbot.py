"""ZeNA chatbot engine: intent prediction, responses, and conversation flow."""

import json
import pickle
import random
import re
import uuid
from pathlib import Path

from database import supabase

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR.parent / "dataset" / "intents.json"
MODEL_PATH = BASE_DIR / "models" / "chatbot_model.pkl"
CONFIDENCE_THRESHOLD = 0.25

OPTION_INTENT_MAP = {
    "book session": "connect_with_team",
    "back to programs": "training_programs",
    "back to learning areas": "learning_areas",
    "back to hackathon details": "hackathon_2026",
    "back to training programs": "training_programs",
    "explore other services": "explore_services",
    "no": "back_to_main_menu",
}


class ZeNAChatbot:
    def __init__(self):
        self.intents_data = self._load_intents()
        self.intents_by_tag = {i["tag"]: i for i in self.intents_data["intents"]}
        self.pattern_map = self._build_pattern_map()
        self.model = self._load_model()
        self.sessions = {}

    def _load_intents(self):
        with open(DATASET_PATH, "r", encoding="utf-8") as file:
            return json.load(file)

    def _build_pattern_map(self):
        mapping = {}
        for intent in self.intents_data["intents"]:
            for pattern in intent["patterns"]:
                mapping[pattern.lower().strip()] = intent["tag"]

        for option, tag in OPTION_INTENT_MAP.items():
            mapping[option] = tag

        return mapping

    def _load_model(self):
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. Run 'python train.py' first."
            )

        with open(MODEL_PATH, "rb") as file:
            return pickle.load(file)

    def create_session(self):
        session_id = str(uuid.uuid4())

        self.sessions[session_id] = {
            "history": [],
            "last_intent": None,
            "pending_form": None,
        }

        return session_id

    def _get_session(self, session_id):
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "history": [],
                "last_intent": None,
                "pending_form": None,
            }

        return self.sessions[session_id]

    def _normalize(self, text):
        return re.sub(r"\s+", " ", text.lower().strip())

    def predict_intent(self, message):
        normalized = self._normalize(message)

        if normalized in self.pattern_map:
            return self.pattern_map[normalized], 1.0

        probabilities = self.model.predict_proba([normalized])[0]
        best_index = probabilities.argmax()
        confidence = float(probabilities[best_index])
        predicted_tag = self.model.classes_[best_index]

        if confidence < CONFIDENCE_THRESHOLD:
            return "fallback", confidence

        return predicted_tag, confidence

    def _build_response(self, tag):
        intent = self.intents_by_tag.get(tag, self.intents_by_tag["fallback"])
        response_text = random.choice(intent["responses"])

        payload = {
            "intent": intent["tag"],
            "message": response_text,
            "options": intent.get("options", []),
            "form_fields": intent.get("form_fields", []),
            "links": intent.get("links", {}),
        }

        return payload

    def get_greeting(self, session_id=None):
        if session_id:
            session = self._get_session(session_id)
        else:
            session_id = self.create_session()
            session = self.sessions[session_id]

        payload = self._build_response("greeting")

        session["last_intent"] = "greeting"
        session["history"].append({"role": "bot", **payload})

        payload["session_id"] = session_id

        return payload

    def chat(self, message, session_id):
        session = self._get_session(session_id)

        # Save user message in session
        session["history"].append({
            "role": "user",
            "content": message
        })

        # Save user message to Supabase
        supabase.table("chat_history").insert({
            "session_id": session_id,
            "sender": "user",
            "message": message
        }).execute()

        # Predict intent
        tag, confidence = self.predict_intent(message)

        payload = self._build_response(tag)
        payload["confidence"] = round(confidence, 3)

        if payload["form_fields"]:
            session["pending_form"] = tag

        session["last_intent"] = tag

        # Save bot response in session
        session["history"].append({
            "role": "bot",
            **payload
        })

        # Save bot response to Supabase
        supabase.table("chat_history").insert({
            "session_id": session_id,
            "sender": "bot",
            "message": payload["message"]
        }).execute()

        payload["session_id"] = session_id

        return payload

    def submit_form(self, session_id, form_data):
        session = self._get_session(session_id)

        try:
            supabase.table("contact_requests").insert({
                "name": form_data.get("Name"),
                "email": form_data.get("Email"),
                "phone": form_data.get("Phone Number"),
                "requirement": form_data.get("Requirement / Area of Interest")
            }).execute()

            session["history"].append({
                "role": "user",
                "content": "Form submitted",
                "form_data": form_data
            })

            payload = self._build_response("form_submitted")

        except Exception:
            payload = {
                "intent": "error",
                "message": "Sorry! Unable to save your details. Please try again.",
                "options": [],
                "form_fields": [],
                "links": {}
            }

        session["pending_form"] = None
        session["last_intent"] = "form_submitted"

        session["history"].append({
            "role": "bot",
            **payload
        })

        payload["session_id"] = session_id

        return payload

    def get_history(self, session_id):
        session = self._get_session(session_id)
        return session["history"]