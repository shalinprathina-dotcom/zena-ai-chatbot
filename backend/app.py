"""Flask API for ZeNA – ZeAI Soft AI Chatbot."""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from chatbot import ZeNAChatbot

app = Flask(__name__)
CORS(app)

chatbot = ZeNAChatbot()


@app.route("/")
def home():
    return jsonify({
        "message": "ZeNA API Running Successfully"
    })


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "chatbot": chatbot.intents_data.get("chatbot_name", "ZeNA"),
        "company": chatbot.intents_data.get("company", "ZeAI Soft"),
    })


@app.route("/api/chat/start", methods=["POST"])
def start_chat():
    session_id = chatbot.create_session()
    response = chatbot.get_greeting(session_id)
    return jsonify(response)


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    session_id = data.get("session_id")

    if not message:
        return jsonify({"error": "Message is required."}), 400
    if not session_id:
        return jsonify({"error": "session_id is required."}), 400

    response = chatbot.chat(message, session_id)
    return jsonify(response)


@app.route("/api/chat/form", methods=["POST"])
def submit_form():
    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id")
    form_data = data.get("form_data") or {}

    if not session_id:
        return jsonify({"error": "session_id is required."}), 400
    if not form_data:
        return jsonify({"error": "form_data is required."}), 400

    response = chatbot.submit_form(session_id, form_data)
    return jsonify(response)


@app.route("/api/chat/history/<session_id>", methods=["GET"])
def get_history(session_id):
    history = chatbot.get_history(session_id)
    return jsonify({
        "session_id": session_id,
        "history": history
    })


if __name__ == "__main__":
    app.run(
    debug=os.getenv("FLASK_ENV") == "development",
    port=5000
)