import os
import json
import logging
import firebase_admin
from firebase_admin import credentials, firestore
from .config import Config

logger = logging.getLogger(__name__)

# Initialize Firebase Admin
def initialize_firebase():
    try:
        if not firebase_admin._apps:
            # Try to get credentials from environment variable first (for deployment)
            firebase_creds_json = os.getenv('FIREBASE_CREDENTIALS')
            
            if firebase_creds_json:
                # Parse JSON from environment variable
                cred_dict = json.loads(firebase_creds_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase initialized with credentials from environment variable")
            elif os.path.exists(Config.GOOGLE_APPLICATION_CREDENTIALS):
                # Fallback to local file (for development)
                cred = credentials.Certificate(Config.GOOGLE_APPLICATION_CREDENTIALS)
                firebase_admin.initialize_app(cred)
                logger.info(f"Firebase initialized with service account file: {Config.GOOGLE_APPLICATION_CREDENTIALS}")
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


# """--------------------- DOCKER BUILD-----------------------------------"""
# import os
# import json
# import logging
# import firebase_admin
# from firebase_admin import credentials, firestore
# from .config import Config

# logger = logging.getLogger(__name__)

# def initialize_firebase():
#     """Initialize Firebase with proper environment variable support"""
#     try:
#         # Check if Firebase app is already initialized
#         try:
#             app = firebase_admin.get_app()
#             logger.info("Firebase app already initialized")
#         except ValueError:
#             # App not initialized, so initialize it
            
#             # First try to get credentials from environment variable (for deployment)
#             firebase_credentials = os.getenv('FIREBASE_CREDENTIALS')
#             if firebase_credentials:
#                 try:
#                     # Parse the JSON credentials from environment variable
#                     cred_dict = json.loads(firebase_credentials)
#                     cred = credentials.Certificate(cred_dict)
#                     app = firebase_admin.initialize_app(cred)
#                     logger.info("Firebase initialized with credentials from environment variable")
#                 except json.JSONDecodeError as e:
#                     logger.error(f"Invalid JSON in FIREBASE_CREDENTIALS: {e}")
#                     raise
#             else:
#                 # Fallback to file-based credentials for local development
#                 cred_path = Config.GOOGLE_APPLICATION_CREDENTIALS
                
#                 if os.path.exists(cred_path):
#                     cred = credentials.Certificate(cred_path)
#                     app = firebase_admin.initialize_app(cred)
#                     logger.info(f"Firebase initialized with credentials from {cred_path}")
#                 else:
#                     # Try default credentials (for some cloud environments)
#                     try:
#                         app = firebase_admin.initialize_app()
#                         logger.info("Firebase initialized with default credentials")
#                     except Exception as e:
#                         logger.error(f"No valid Firebase credentials found. Please set FIREBASE_CREDENTIALS environment variable with your service account JSON.")
#                         raise

#         # Initialize Firestore
#         db = firestore.client()
#         logger.info("Firestore client initialized successfully")
#         return db

#     except Exception as e:
#         logger.error(f"Failed to initialize Firebase: {e}")
#         raise

# # Initialize Firebase when module is imported
# db = initialize_firebase()





# # import os
# # import logging
# # import firebase_admin
# # from firebase_admin import credentials, firestore
# # import json

# # logger = logging.getLogger(__name__)

# # def initialize_firebase():
# #     """Initialize Firebase with proper error handling"""
# #     try:
# #         # Check if Firebase app is already initialized
# #         try:
# #             app = firebase_admin.get_app()
# #             logger.info("Firebase app already initialized")
# #         except ValueError:
# #             # App not initialized, so initialize it

# #             # Try to get credentials from environment variable (JSON string)
# #             firebase_credentials = os.getenv('FIREBASE_CREDENTIALS')
#             # if firebase_credentials:
#             #     try:
#             #         # Parse the JSON credentials
#             #         cred_dict = json.loads(firebase_credentials)
#             #         cred = credentials.Certificate(cred_dict)
#         #             app = firebase_admin.initialize_app(cred)
#         #             logger.info("Firebase initialized with credentials from environment variable")
#         #         except json.JSONDecodeError as e:
#         #             logger.error(f"Invalid JSON in FIREBASE_CREDENTIALS: {e}")
#         #             raise
#         #     else:
#         #         # Fallback to file-based credentials for local development
#         #         cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', './keys/serviceAccount.json')

#         #         if os.path.exists(cred_path):
#         #             cred = credentials.Certificate(cred_path)
#         #             app = firebase_admin.initialize_app(cred)
#         #             logger.info(f"Firebase initialized with credentials from {cred_path}")
#         #         else:
#         #             # Try default credentials (for some cloud environments)
#         #             try:
#         #                 app = firebase_admin.initialize_app()
#         #                 logger.info("Firebase initialized with default credentials")
#         #             except Exception as e:
#         #                 logger.error(f"No valid Firebase credentials found. Please set FIREBASE_CREDENTIALS environment variable with your service account JSON.")
#         #                 raise

#         # # Initialize Firestore
#         # db = firestore.client()
#         # logger.info("Firestore client initialized successfully")
#         # return db
# # from .config import Config

# # logger = logging.getLogger(__name__)

# # # Initialize Firebase Admin
# # def initialize_firebase():
# #     try:
# #         if not firebase_admin._apps:
# #             cred_path = Config.GOOGLE_APPLICATION_CREDENTIALS
            
# #             if os.path.exists(cred_path):
# #                 cred = credentials.Certificate(cred_path)
# #                 firebase_admin.initialize_app(cred)
# #                 logger.info(f"Firebase initialized with service account: {cred_path}")
# #             else:
# #                 # Try default credentials (for production environments)
# #                 firebase_admin.initialize_app()
# #                 logger.info("Firebase initialized with default credentials")
        
# #         # Get Firestore client
# #         db = firestore.client()
# #         return db
        
# #     except Exception as e:
# #         logger.error(f"Failed to initialize Firebase: {e}")
# #         raise

# # # Global Firestore client
# # db = initialize_firebase()
