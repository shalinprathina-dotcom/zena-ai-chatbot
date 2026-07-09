# ZeNA – ZeAI Soft AI Chatbot

ZeNA is an NLP-powered chatbot for **ZeAI Soft** that uses intent classification (TF-IDF + Logistic Regression) to understand user messages and guide conversations through services, training programs, and enquiries.

## Project Structure

```
├── dataset/
│   └── intents.json          # Training data (patterns, responses, options)
├── backend/
│   ├── train.py              # Train TF-IDF + ML model
│   ├── chatbot.py            # Intent prediction & conversation engine
│   ├── app.py                # Flask REST API
│   ├── requirements.txt
│   └── models/               # Generated after training
└── frontend/
    └── src/                  # React chatbot UI
```

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python train.py
python app.py
```

The API runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI runs at `http://localhost:3000` and proxies API calls to the backend.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/chat/start` | Start a new conversation |
| POST | `/api/chat` | Send a message `{ message, session_id }` |
| POST | `/api/chat/form` | Submit contact form `{ session_id, form_data }` |
| GET | `/api/chat/history/<session_id>` | Get conversation history |

## How It Works

1. **Training** – `intents.json` patterns are vectorized with TF-IDF and classified using Logistic Regression.
2. **Prediction** – User input is matched against known patterns/options first, then classified by the ML model.
3. **Response** – The matched intent returns a response, quick-reply buttons, forms, or social links.
4. **Conversation flow** – Session state tracks history and supports multi-step navigation via option buttons.

## Tech Stack

- **Backend:** Python, Flask, scikit-learn, TF-IDF Vectorizer, Logistic Regression
- **Frontend:** React, Vite
