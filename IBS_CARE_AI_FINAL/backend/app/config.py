import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Firebase
    GOOGLE_APPLICATION_CREDENTIALS = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', './keys/serviceAccount.json')
    
    # AI Models
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
    MODEL_NAME = os.getenv('MODEL_NAME', 'gemini-1.5-flash')
    
    # Email Configuration
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', '587'))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'true').lower() in ('true', '1', 't')
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
    
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173,https://ibs-care-ai.vercel.app')
    
    # Debug
    DEBUG = os.getenv('DEBUG', '0').lower() in ('1', 'true', 'yes')
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
