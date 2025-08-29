from flask import Flask, send_from_directory
from flask_cors import CORS
from .config import Config
import os

def create_app():
app = Flask(name, static_folder='static', static_url_path='/')

app.config.from_object(Config)
CORS(app,
     origins=Config.ALLOWED_ORIGINS.split(',') if Config.ALLOWED_ORIGINS else ['*'],
     supports_credentials=True)

try:
    from . import firebase_init
except Exception as e:
    app.logger.warning(f"Firebase initialization warning: {e}")

try:
    from . import email_service
    email_service.init_email_service(app)
except Exception as e:
    app.logger.warning(f"Email service initialization warning: {e}")

from .routers import health, auth_verify, logs, chat, assessment, reminders
app.register_blueprint(health.bp)
app.register_blueprint(auth_verify.bp, url_prefix='/auth')
app.register_blueprint(logs.bp)
app.register_blueprint(chat.bp)
app.register_blueprint(assessment.bp, url_prefix='/assessment')
app.register_blueprint(reminders.bp, url_prefix='/reminders')

try:
    from .routers.reminders import start_reminder_service
    start_reminder_service()
except Exception as e:
    app.logger.warning(f"Reminder service start warning: {e}")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_spa(path):
    file_path = os.path.join(app.static_folder, path)
    if path and os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

return app
