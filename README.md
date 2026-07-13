# Nyaya AI (न्याय एआई) — Multilingual Legal Operating System

Nyaya AI is India's first multilingual AI Legal Operating System designed to help common citizens understand legal documents, notices, FIRs, contracts, and rights in simple, native languages.

This is the **Day 1 MVP Foundation** built using Agentic Engineering principles with Next.js, FastAPI, SQLite, and Google Gemini API.

---

## 🚀 Key Features (Day 1 MVP)

- **Empathetic Landing Page**: Modern glassmorphic interface with interactive feature overviews.
- **ChatGPT-Style Legal Chat**: Chat interface supporting rich legal formatting, citations, and steps.
- **Explain to My Mother Mode**: A toggle to translate dense legal terminology into simple, comforting, jargon-free explanations.
- **Multi-Agent Orchestration**: A 4-agent backend pipeline (Safety, Language, Memory, and Legal Chat Agents) powered by Google Gemini.
- **Hinglish + Hindi + English Support**: Seamless processing of mixed scripts and native regional dialects.
- **Persistent Local History**: SQLite-backed session tracking and memory summarization.
- **Double-Safe Disclaimer System**: Initial consent modal and pinned warnings to comply with Indian legal advisory regulations.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, Lucide Icons.
- **Backend**: FastAPI (Python 3.12), SQLAlchemy ORM, SQLite database.
- **AI Engine**: Google Generative AI (Gemini 1.5 Flash/Pro), Pydantic structured output validation.
- **Deployment**: Docker, ready for Google Cloud Run deployment.

---

## 📂 Project Structure

```
nyaya-ai/
├── backend/
│   ├── app/
│   │   ├── api/v1/chat.py      # FastAPI chat endpoints
│   │   ├── agents/             # Multi-agent implementations
│   │   │   ├── safety.py       # Safe input/output & disclaimers
│   │   │   ├── language.py     # Translation & Hinglish detection
│   │   │   ├── memory.py       # Case summary compression
│   │   │   ├── legal.py        # Statutory citation reasoning
│   │   │   └── orchestrator.py # Choreographs agent executions
│   │   ├── core/               # DB & config setups
│   │   ├── models/             # SQLAlchemy schemas
│   │   └── schemas/            # Pydantic schemas
│   ├── requirements.txt
│   └── Dockerfile
├── src/
│   ├── app/                    # Next.js app pages (Landing & Chat)
│   ├── components/             # Tailwind UI components
│   └── lib/                    # Language utilities & mocks
├── AGENTS.md                   # Multi-agent system documentation
├── README.md                   # This instruction manual
└── run_backend.bat             # Startup script for Windows users
```

---

## 🚦 How to Run the Project Locally

### 1. Prerequisite: Gemini API Key
Get your API key from [Google AI Studio](https://aistudio.google.com/) and define it in your shell environment:
- **Windows (CMD)**: `set GEMINI_API_KEY=your_api_key_here`
- **Windows (PowerShell)**: `$env:GEMINI_API_KEY="your_api_key_here"`
- **Linux/macOS**: `export GEMINI_API_KEY="your_api_key_here"`

*Note: If no API key is specified, Nyaya AI will run in an **Offline Mock Fallback** mode, allowing you to test landlord, arrest, and FIR scenarios locally without hitting any API rate limits.*

### 2. Start the Backend
Double-click `run_backend.bat` in the root folder, or run:
```bash
cd backend
pip install -r requirements.txt --user
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Verify the backend is active by visiting: `http://localhost:8000/` (should show status: `"healthy"`).

### 3. Start the Frontend
In a separate terminal shell:
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🛡️ Security & Compliance
- **Safety Agent Guardrails**: Automatically blocks requests seeking help for unlawful behavior or evading justice.
- **Local Persistence**: DB stores sessions locally; no third-party telemetry outside the Gemini processing pipelines.
- **Attorney-Client Limitation**: The interface makes it explicit that Nyaya AI is an informational tool, not a licensed practitioner.
