# 🚀 Nyaya AI — Live Deployment & Production Guide

This guide describes how to configure, run, and deploy the entire **Nyaya AI** stack (Next.js Frontend, FastAPI Python Backend, PostgreSQL database, and Gemini/Groq LLMs) directly from VS Code.

---

## 📂 Project Architecture

Your workspace is structured into two main applications:
1. **Frontend (Next.js)**: Runs in the root folder.
2. **Backend (FastAPI)**: Runs inside the `/backend` folder.

---

## ⚙️ 1. Environment Configuration

You must set up environment files in both folders before deployment.

### A. Frontend Configuration (Root `.env` file)
Create a `.env` file in the root folder of the project:
```env
# Database connection string (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

# Production Secrets
JWT_SECRET="nyaya_ai_super_secret_jwt_key_2026_production"
ENCRYPTION_KEY="nyaya_ai_super_secret_jwt_key_2026_production"

# Config settings
NEXT_PUBLIC_APP_NAME="Nyaya AI"
NODE_ENV="production"
NEXT_PUBLIC_API_URL="/api/v1"
```

### B. Backend Configuration (Inside `/backend/.env`)
Create a `.env` file inside the `backend` folder:
```env
# Database connection for Python
DATABASE_URL=sqlite:///./nyaya_ai.db

# LLM API credentials from Google AI Studio & Groq
GEMINI_API_KEY="your_gemini_api_key"
GROQ_API_KEY="your_groq_api_key"
```

---

## 🏗️ 2. Database Setup & Migrations

### Frontend PostgreSQL (Prisma)
To initialize the Supabase database and run migrations:
```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations to Supabase
npx prisma db push
```

### Backend SQLite
The Python backend uses an SQLite database `nyaya_ai.db` in production to keep response speeds fast. It is pre-seeded with all Indian legal data, landmarks, and academy lessons.

---

## 🚢 3. Live Deployment Blueprints

Here is how to deploy each part to production.

### Blueprint A: Deploying the Frontend (Vercel)
Vercel is the recommended platform for Next.js App Router projects.

1. Install the Vercel CLI or link your Git repository (GitHub/GitLab) directly to Vercel.
2. Run this command in the root folder:
   ```bash
   vercel
   ```
3. Set these Environment Variables in your Vercel Dashboard:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `JWT_SECRET`
   - `ENCRYPTION_KEY`
   - `NEXT_PUBLIC_API_URL` (Set this to `/api/v1` to route through Next.js proxy)
   - `NEXT_PUBLIC_BACKEND_URL` (Set this to your live FastAPI backend URL, e.g., `https://nyaya-ai-backend.onrender.com`)
4. Vercel will build and deploy the Next.js app and output a live preview URL.

---

### Blueprint B: Deploying the Backend (Render / Railway / Render Docker)
FastAPI runs on a Python server. You can host it using Docker or standard Python buildpacks.

#### Option 1: Render (Standard Web Service)
1. Link your git repository to Render.
2. Create a new **Web Service**.
3. Set the Root Directory to `backend`.
4. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add these Environment Variables:
   - `DATABASE_URL` = `sqlite:///./nyaya_ai.db`
   - `GEMINI_API_KEY` = `[YOUR_KEY]`
   - `GROQ_API_KEY` = `[YOUR_KEY]`

#### Option 2: Docker Deploy (Render/GCP/AWS)
A `Dockerfile` is already provided in the `/backend` folder. To build and run:
```bash
cd backend
docker build -t nyaya-backend .
docker run -p 8000:8000 nyaya-backend
```

---

## 🛠️ 4. How to Run Locally in VS Code

For quick local testing and debugging inside VS Code:

### 🖥️ Run Terminal 1 (Python Backend)
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Documentation (Swagger Docs): `http://localhost:8000/docs`
- Health check: `http://localhost:8000/`

### 💻 Run Terminal 2 (Next.js Frontend)
```bash
npm run dev
```
- Frontend Preview: `http://localhost:3000`

---

## 🎯 5. Verification Checklist

Ensure the following before going live:
- [x] All Next.js pages compile cleanly (`npm run build` succeeds).
- [x] The `apiClient` correctly targets `process.env.NEXT_PUBLIC_API_URL` instead of hardcoded local hosts.
- [x] Saffron/green tricolor details align cleanly across dark/light toggles.
- [x] The main sidebar toggle behaves correctly on all devices (mobile drawer, desktop side-by-side).
