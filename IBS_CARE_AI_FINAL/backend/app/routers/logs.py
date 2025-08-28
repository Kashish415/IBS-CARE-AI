from flask import Blueprint, request, jsonify
import logging
from datetime import datetime
from ..schemas import LogCreate, LogResponse
from ..auth_utils import require_auth
from ..firebase_init import db

logger = logging.getLogger(__name__)
bp = Blueprint('logs', __name__)

@bp.route('/logs', methods=['POST'])
@require_auth
def create_log(user_uid: str, user_email: str):
    """Create or update a log entry"""
    try:
        # Validate request body
        data = request.get_json()
        log_data = LogCreate(**data)
        
        # Prepare document data
        doc_data = {
            **log_data.dict(),
            'createdAt': datetime.now().isoformat()
        }
        
        # Save to Firestore (merge to allow updates)
        doc_ref = db.collection('users').document(user_uid).collection('logs').document(log_data.dateISO)
        doc_ref.set(doc_data, merge=True)
        
        logger.info(f"Log created for user {user_uid} on {log_data.dateISO}")
        
        response = LogResponse(**doc_data)
        return jsonify(response.dict()), 201
        
    except Exception as e:
        logger.error(f"Failed to create log: {e}")
        return jsonify({"error": "Failed to save log entry"}), 500

@bp.route('/logs', methods=['GET'])
@require_auth
def get_logs(user_uid: str, user_email: str):
    """Get logs for a user within date range"""
    try:
        # Get query parameters
        from_date = request.args.get('from')
        to_date = request.args.get('to')
        
        # Build query
        logs_ref = db.collection('users').document(user_uid).collection('logs')
        
        if from_date:
            logs_ref = logs_ref.where('dateISO', '>=', from_date)
        if to_date:
            logs_ref = logs_ref.where('dateISO', '<=', to_date)
        
        # Execute query and sort by date
        docs = logs_ref.order_by('dateISO').stream()
        
        logs = []
        for doc in docs:
            log_data = doc.to_dict()
            logs.append(LogResponse(**log_data))
        
        return jsonify([log.dict() for log in logs])
        
    except Exception as e:
        logger.error(f"Failed to fetch logs: {e}")
        return jsonify({"error": "Failed to fetch logs"}), 500