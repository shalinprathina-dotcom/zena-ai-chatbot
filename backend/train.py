"""Train ZeNA intent classification model using TF-IDF + Logistic Regression."""

import json
import pickle
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR.parent / "dataset" / "intents.json"
MODELS_DIR = BASE_DIR / "models"


def load_training_data():
    with open(DATASET_PATH, "r", encoding="utf-8") as file:
        data = json.load(file)

    sentences = []
    labels = []

    for intent in data["intents"]:
        for pattern in intent["patterns"]:
            sentences.append(pattern.lower().strip())
            labels.append(intent["tag"])

    return sentences, labels


def train():
    sentences, labels = load_training_data()

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)),
        ("clf", LogisticRegression(max_iter=2000, C=10)),
    ])

    pipeline.fit(sentences, labels)

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    with open(MODELS_DIR / "chatbot_model.pkl", "wb") as file:
        pickle.dump(pipeline, file)

    print(f"ZeNA model trained on {len(sentences)} patterns across {len(set(labels))} intents.")
    print(f"Model saved to {MODELS_DIR / 'chatbot_model.pkl'}")


if __name__ == "__main__":
    train()
