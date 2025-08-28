from flask import Blueprint, jsonify
from ..schemas import HealthResponse

bp = Blueprint('health', __name__)

@bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    response = HealthResponse()
    return jsonify(response.dict())