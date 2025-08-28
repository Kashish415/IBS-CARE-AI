from flask import Flask
from flask_cors import CORS
from .config import Config

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(Config)
    
    # Configure CORS
    CORS(app, 
         origins=Config.ALLOWED_ORIGINS.split(',') if Config.ALLOWED_ORIGINS else ['*'],
         supports_credentials=True)
    
    # Initialize Firebase (this will be done when the module is imported)
    try:
        from . import firebase_init
        # Firebase is initialized when the module is imported
    except Exception as e:
        app.logger.warning(f"Firebase initialization warning: {e}")
    
    # Initialize Email Service
    try:
        from . import email_service
        email_service.init_email_service(app)
    except Exception as e:
        app.logger.warning(f"Email service initialization warning: {e}")
    
    # Register blueprints
    from .routers import health, auth_verify, logs, chat, assessment, reminders
    app.register_blueprint(health.bp)
    app.register_blueprint(auth_verify.bp, url_prefix='/auth')
    app.register_blueprint(logs.bp)
    app.register_blueprint(chat.bp)
    app.register_blueprint(assessment.bp, url_prefix='/assessment')
    app.register_blueprint(reminders.bp, url_prefix='/reminders')
    
    # Start reminder service
    try:
        from .routers.reminders import start_reminder_service
        start_reminder_service()
    except Exception as e:
        app.logger.warning(f"Reminder service start warning: {e}")
    
    return app