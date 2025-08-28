# IBS Care AI - Complete Healthcare Management Platform

A comprehensive IBS management platform with AI-powered insights, symptom tracking, and personalized care recommendations.

## Project Structure

```
IBS_CARE_AI_FINAL/
├── frontend/          # React + TypeScript frontend
├── backend/           # Flask + Python backend
└── README.md         # This file
```

## Quick Start (Windows PowerShell)

### Prerequisites
- Node.js 20-22
- Python 3.11+
- Firebase Project with Firestore
- Gemini API Key

### 1. Clone and Setup
```powershell
git clone <repository-url>
cd IBS_CARE_AI_FINAL
```

### 2. Frontend Setup
```powershell
cd frontend
npm install
copy .env.local.example .env.local
# Edit .env.local with your Firebase config
npm run dev
```

### 3. Backend Setup
```powershell
cd ..\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# Place serviceAccount.json in backend/keys/
# Edit .env with your API keys
$env:GOOGLE_APPLICATION_CREDENTIALS="$PWD\keys\serviceAccount.json"
flask run --host=127.0.0.1 --port=8000
```

## Features

- 🔐 Firebase Authentication
- 📊 Health Analytics Dashboard  
- 💬 AI-Powered Chat Assistant
- 📝 Daily Symptom Logging
- 📈 Progress Tracking
- 🎯 Personalized Recommendations

## Technology Stack

**Frontend:** React 18, TypeScript, Vite 5, Tailwind CSS, Firebase SDK
**Backend:** Flask 2.2.x, Firebase Admin, Gemini AI, Firestore
**Database:** Cloud Firestore
**AI:** Google Gemini 1.5 Flash

## Deployment

See individual README files in `frontend/` and `backend/` directories for detailed setup and deployment instructions.