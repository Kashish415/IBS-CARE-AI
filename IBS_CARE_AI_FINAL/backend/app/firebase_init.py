import os
import logging
import firebase_admin
from firebase_admin import credentials, firestore
from .config import Config

logger = logging.getLogger(__name__)

# Initialize Firebase Admin
def initialize_firebase():
    try:
        if not firebase_admin._apps:
            cred_path = Config.GOOGLE_APPLICATION_CREDENTIALS
            
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                logger.info(f"Firebase initialized with service account: {cred_path}")
            else:
                # Try default credentials (for production environments)
                firebase_admin.initialize_app()
                logger.info("Firebase initialized with default credentials")
        
        # Get Firestore client
        db = firestore.client()
        return db
        
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        raise

# Global Firestore client
db = initialize_firebase()