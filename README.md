## AI-Based Customer Query Analyzer (GenAI Full-Stack)

Production-ready, full-stack GenAI chatbot that:
- **Classifies** customer queries into support categories (Gemini via LangChain)
- **Runs sentiment analysis locally** (HuggingFace `distilbert-base-uncased-finetuned-sst-2-english`)
- **Generates contextual, empathetic replies** (Gemini + LangChain conversation memory)
- **Logs everything** to SQLite and exposes an **analytics dashboard** API

### Architecture (ASCII)

```
┌──────────────────────────┐        HTTP         ┌──────────────────────────────┐
│  React + Vite + Tailwind  │  /api/chat, /api/*  │     FastAPI (async REST)     │
│  Chat UI + Dashboard      │ ──────────────────▶ │  - /api/chat                 │
│  Recharts + FramerMotion  │                    │  - /api/analytics             │
└─────────────┬────────────┘                    │  - /health                   │
              │                                  └─────────────┬────────────────┘
              │                                                │
              │                                                │
              │                              ┌─────────────────┴─────────────────┐
              │                              │ Services                           │
              │                              │ - LangChain + Gemini classifier    │
              │                              │ - HF sentiment pipeline (local)    │
              │                              │ - Conversation memory (per session)│
              │                              │ - FAISS + HF embeddings (RAG-lite) │
              │                              └─────────────────┬─────────────────┘
              │                                                │
              ▼                                                ▼
                                           ┌──────────────────────────────┐
                                           │ SQLite (SQLAlchemy ORM)      │
                                           │ query_logs: msg, category,   │
                                           │ sentiment, response, time    │
                                           └──────────────────────────────┘
```

---

## Setup

### 1) Backend

From the repo root:

```bash
cd backend
python -m venv .venv
```

Activate venv:
- **Windows PowerShell**:

```bash
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env`:

```bash
copy .env.example .env
```

Edit `backend/.env` and set:
- `GOOGLE_API_KEY="YOUR_KEY_HERE"`

### 2) Get a free Gemini API key (Google AI Studio)

- Go to Google AI Studio: `https://aistudio.google.com/`
- Create an API key and paste it into `backend/.env` as `GOOGLE_API_KEY`.

### 3) Frontend

```bash
cd frontend
npm install
```

---

## Run

### Backend (FastAPI)

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Notes:
- On first run, the HuggingFace sentiment model will download and you’ll see a startup message in the terminal.
- If `GOOGLE_API_KEY` is not set, the app still works using a safe fallback classifier/responder.

### Frontend (Vite)

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

---

## API

- **Health**: `GET /health` → `{ "status": "ok" }`
- **Chat**: `POST /api/chat`

Request:
```json
{ "message": "string", "session_id": "string" }
```

Response:
```json
{
  "response": "string",
  "category": "string",
  "sentiment": { "label": "POSITIVE|NEGATIVE|NEUTRAL", "score": 0.0 },
  "session_id": "string",
  "timestamp": "2026-01-01T00:00:00",
  "generation_mode": "llm|fallback",
  "warning": "string|null"
}
```

- **Analytics**: `GET /api/analytics`

---

## Sample Queries (one per category)

- **Billing & Payments**: "I was charged twice for my subscription this month—can you fix it?"
- **Technical Support**: "The app crashes every time I try to upload a photo. What should I do?"
- **Returns & Refunds**: "I want a refund for the headphones I bought last week."
- **Shipping & Delivery**: "My tracking hasn’t updated in 5 days and the package is late."
- **Account Issues**: "I can’t log in—my password reset email never arrives."
- **Product Information**: "Is this laptop compatible with a 4K external monitor?"
- **Complaints**: "This is unacceptable—support keeps closing my ticket without helping."
- **General Inquiry**: "What are your customer support hours?"

---

## Screenshot Placeholders

- Chat UI: (add screenshot here)
- Analytics dashboard: (add screenshot here)

