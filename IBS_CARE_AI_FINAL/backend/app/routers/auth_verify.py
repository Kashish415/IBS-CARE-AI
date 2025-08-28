from flask import Blueprint, request, jsonify
import logging
from firebase_admin import auth
from ..schemas import TokenVerification, AuthResponse
from ..auth_utils import verify_id_token

logger = logging.getLogger(__name__)
bp = Blueprint('auth_verify', __name__)

@bp.route('/verify', methods=['POST'])
def verify_token():
    """Verify Firebase ID token"""
    try:
        # Validate request body
        data = request.get_json()
        token_data = TokenVerification(**data)
        
        # Verify token directly with Firebase Admin
        decoded_token = auth.verify_id_token(token_data.id_token)
        
        response = AuthResponse(
            uid=decoded_token['uid'],
            email=decoded_token.get('email', '')
        )
        
        return jsonify(response.dict())
        
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        return jsonify({"error": "Invalid token"}), 401