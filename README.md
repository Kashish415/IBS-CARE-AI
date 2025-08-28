# IBS Care AI

IBS Care AI is an empathetic AI-powered health companion designed to support individuals with Irritable Bowel Syndrome (IBS). The platform enables users to log their daily health
activities,take free assessments,track symptoms and receive personalized health insights. It combines healthcare tracking with intelligent suggestions, aiming to improve overall 
well-being.

## Features

* **Daily Health Log**: Track symptoms, mood, diet, and lifestyle factors.
* **AI-Powered Insights**: Personalized suggestions and severity assessment using AI models.
* **Health History**: View and analyze past logs for studying patterns.
* **Profile Dashboard**: Summarized health data in an easy-to-read format and chart visualizations.
* **User Authentication** – Firebase-based secure login & signup.
* **Free Assessment**: Get to know your IBS type, severity and personalised insights by taking our health assessment tests.

## Tech Stack

* **Frontend**: React, TypeScript, Tailwind CSS
* **Backend**: Flask 
* **Database**: Firebase
* **AI/ML**: LangChain + Pydantic, llm ( google gemini)

## Installation

### Prerequisites

* Python 3.10+
* Node.js 18+
* Firebase project setup with API keys

### Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/your-repo/ibs-care-ai.git
cd ibs-care-ai
```

2. **Setup backend (Flask)**

```bash
cd backend
pip install -r requirements.txt
```

3. **Setup frontend (React)**

```bash
cd frontend
npm install
npm run build
```

4. **Move frontend build to backend**

Copy the `frontend/build` folder into the Flask `static/` directory so Flask serves the React app.

5. **Configure environment**

Create a `.env` file inside `backend/` with:

```env
FIREBASE_API_KEY=your_firebase_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
GOOGLE_API_KEY=your_ai_api_key
```

6. **Run the app**

```bash
cd backend
python app.py
```

## File Structure

```
IBS-Care-AI/
│── IBS_CARE_AI_FINAL/
    ├── backend/
          ├── app.py
          └── requirements.txt
    ├── .gitignore
    └──  README.md
│── api/                     
│   ├── chat.py     
│   ├── health.py   
│   └── llm_adapter.py                
│── src/                     
│   ├── components/
    ├── lib/    
│   ├── pages/              
│   ├── App.tsx
    ├── index.tsx
    ├── main.tsx 
│   └── vite-env.d.ts
│── .gitignore
│── README.md
│── eslint.config.js
│── firestore.indexes.json
│── firestore.rules     
│── index.html
│── package-lock.json
│── package.json     
│── postcss.config.js 
│── requirements.txt
│── start_backend.py
│── tailwind.config.js 
│── tsconfig.app.json        
│── tsconfig.json         
│── tsconfig.node.json      
└── vite.config.ts                      

```

## Contributing

Contributions are welcome! Steps to follow:
1. Fork this repo
2. Create a new branch
3. Commit changes with proper messages
4. Submit a PR for review

