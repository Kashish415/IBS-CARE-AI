import logging
from flask import request
from firebase_admin import auth
from .config import Config

logger = logging.getLogger(__name__)

def verify_id_token(req=None):
    """
    Verify Firebase ID token from request headers
    Returns: (uid, email) or raises exception
    """
    req = req or request
    
    # Check for debug bypass (only in development)
    if Config.DEBUG:
        debug_uid = req.headers.get('X-Debug-UID')
        if debug_uid:
            logger.warning(f"DEBUG MODE: Using bypass UID: {debug_uid}")
            return debug_uid, f"{debug_uid}@debug.local"
    
    # Get authorization header
    auth_header = req.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise ValueError("Missing or invalid Authorization header")
    
    # Extract token
    id_token = auth_header.split('Bearer ')[1]
    
    try:
        # Verify token with Firebase
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        
        logger.info(f"Token verified for user: {uid}")
        return uid, email
        
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise ValueError(f"Invalid token: {e}")

def require_auth(f):
    """Decorator to require authentication for Flask routes"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            uid, email = verify_id_token()
            # Add user info to kwargs
            kwargs['user_uid'] = uid
            kwargs['user_email'] = email
            return f(*args, **kwargs)
        except ValueError as e:
            from flask import jsonify
            return jsonify({"error": str(e)}), 401
    
    return decorated_function