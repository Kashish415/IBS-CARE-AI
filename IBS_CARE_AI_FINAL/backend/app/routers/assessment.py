from flask import Blueprint, request, jsonify
import logging
from datetime import datetime
from ..schemas import AssessmentSubmission, AssessmentAnswer, IBSClassification, AssessmentResult
from ..auth_utils import require_auth
from ..firebase_init import db
from typing import List

logger = logging.getLogger(__name__)
bp = Blueprint('assessment', __name__)

# Predefined assessment questions
ASSESSMENT_QUESTIONS = [
    {
        "id": "bowel_frequency",
        "question": "How many bowel movements do you typically have per day?",
        "type": "multiple_choice",
        "options": ["Less than 1", "1-2", "3-4", "5+", "Varies significantly"],
        "required": True
    },
    {
        "id": "stool_consistency",
        "question": "What is the typical consistency of your stool?",
        "type": "multiple_choice",
        "options": ["Hard/lumpy", "Normal", "Soft/mushy", "Watery", "Mixed types"],
        "required": True
    },
    {
        "id": "abdominal_pain",
        "question": "How often do you experience abdominal pain or discomfort?",
        "type": "multiple_choice",
        "options": ["Never", "Rarely", "Sometimes", "Often", "Always"],
        "required": True
    },
    {
        "id": "pain_relief",
        "question": "Does bowel movement relieve your abdominal pain?",
        "type": "multiple_choice",
        "options": ["Always", "Usually", "Sometimes", "Rarely", "Never"],
        "required": True
    },
    {
        "id": "bloating",
        "question": "How often do you experience bloating?",
        "type": "multiple_choice",
        "options": ["Never", "Rarely", "Sometimes", "Often", "Always"],
        "required": True
    },
    {
        "id": "urgency",
        "question": "Do you experience sudden urgency to have a bowel movement?",
        "type": "multiple_choice",
        "options": ["Never", "Rarely", "Sometimes", "Often", "Always"],
        "required": True
    },
    {
        "id": "incomplete_evacuation",
        "question": "Do you feel like you haven't completely emptied your bowels?",
        "type": "multiple_choice",
        "options": ["Never", "Rarely", "Sometimes", "Often", "Always"],
        "required": True
    },
    {
        "id": "mucus",
        "question": "Do you notice mucus in your stool?",
        "type": "multiple_choice",
        "options": ["Never", "Rarely", "Sometimes", "Often", "Always"],
        "required": True
    },
    {
        "id": "stress_impact",
        "question": "How much does stress affect your symptoms?",
        "type": "scale",
        "options": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        "required": True
    },
    {
        "id": "diet_impact",
        "question": "How much does your diet affect your symptoms?",
        "type": "scale",
        "options": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        "required": True
    }
]

@bp.route('/questions', methods=['GET'])
@require_auth
def get_assessment_questions(user_uid: str, user_email: str):
    """Get assessment questions"""
    try:
        return jsonify(ASSESSMENT_QUESTIONS)
    except Exception as e:
        logger.error(f"Failed to get assessment questions: {e}")
        return jsonify({"error": "Failed to get assessment questions"}), 500

@bp.route('/submit', methods=['POST'])
@require_auth
def submit_assessment(user_uid: str, user_email: str):
    """Submit assessment and get IBS classification"""
    try:
        data = request.get_json()
        submission = AssessmentSubmission(
            user_id=user_uid,
            answers=data.get('answers', []),
            completed_at=datetime.now()
        )
        
        # Classify IBS type based on answers
        classification = classify_ibs_type(submission.answers)
        
        # Save assessment result
        result = AssessmentResult(
            classification=classification,
            completed_at=submission.completed_at,
            next_steps=get_next_steps(classification.ibs_type)
        )
        
        # Save to Firestore
        doc_ref = db.collection('users').document(user_uid).collection('assessments').document('latest')
        doc_ref.set({
            'classification': classification.dict(),
            'completed_at': submission.completed_at.isoformat(),
            'next_steps': result.next_steps,
            'answers': [answer.dict() for answer in submission.answers]
        })
        
        # Update user profile with IBS type
        user_ref = db.collection('users').document(user_uid)
        user_ref.update({
            'ibs_type': classification.ibs_type,
            'assessment_completed': True,
            'assessment_date': submission.completed_at.isoformat()
        })
        
        return jsonify(result.dict()), 201
        
    except Exception as e:
        logger.error(f"Failed to submit assessment: {e}")
        return jsonify({"error": "Failed to submit assessment"}), 500

@bp.route('/result', methods=['GET'])
@require_auth
def get_assessment_result(user_uid: str, user_email: str):
    """Get latest assessment result"""
    try:
        doc_ref = db.collection('users').document(user_uid).collection('assessments').document('latest')
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "No assessment found"}), 404
            
        data = doc.to_dict()
        return jsonify(data)
        
    except Exception as e:
        logger.error(f"Failed to get assessment result: {e}")
        return jsonify({"error": "Failed to get assessment result"}), 500

def classify_ibs_type(answers: List[AssessmentAnswer]) -> IBSClassification:
    """Classify IBS type based on assessment answers"""
    # Convert answers to a dictionary for easy access
    answers_dict = {answer.question_id: answer.answer for answer in answers}
    
    # Scoring system for different IBS types
    ibs_c_score = 0  # Constipation
    ibs_d_score = 0  # Diarrhea
    ibs_m_score = 0  # Mixed
    
    # Analyze bowel frequency
    frequency = answers_dict.get('bowel_frequency', '')
    if frequency in ['Less than 1', '1-2']:
        ibs_c_score += 3
    elif frequency in ['5+']:
        ibs_d_score += 3
    elif frequency == 'Varies significantly':
        ibs_m_score += 2
    
    # Analyze stool consistency
    consistency = answers_dict.get('stool_consistency', '')
    if consistency in ['Hard/lumpy']:
        ibs_c_score += 3
    elif consistency in ['Soft/mushy', 'Watery']:
        ibs_d_score += 3
    elif consistency == 'Mixed types':
        ibs_m_score += 3
    
    # Analyze pain relief
    pain_relief = answers_dict.get('pain_relief', '')
    if pain_relief in ['Always', 'Usually']:
        ibs_c_score += 2
        ibs_d_score += 1
    
    # Analyze urgency
    urgency = answers_dict.get('urgency', '')
    if urgency in ['Often', 'Always']:
        ibs_d_score += 2
    
    # Analyze incomplete evacuation
    incomplete = answers_dict.get('incomplete_evacuation', '')
    if incomplete in ['Often', 'Always']:
        ibs_c_score += 2
    
    # Determine IBS type based on scores
    max_score = max(ibs_c_score, ibs_d_score, ibs_m_score)
    
    if max_score == ibs_c_score:
        ibs_type = "IBS-C"
        confidence = min(0.9, (ibs_c_score / 10) + 0.3)
        reasoning = "Your symptoms suggest IBS with constipation (IBS-C). You experience infrequent bowel movements and hard stool consistency."
        recommendations = [
            "Increase fiber intake gradually",
            "Stay well hydrated",
            "Exercise regularly",
            "Consider probiotics",
            "Avoid processed foods"
        ]
    elif max_score == ibs_d_score:
        ibs_type = "IBS-D"
        confidence = min(0.9, (ibs_d_score / 10) + 0.3)
        reasoning = "Your symptoms suggest IBS with diarrhea (IBS-D). You experience frequent, loose stools and urgency."
        recommendations = [
            "Follow a low-FODMAP diet",
            "Avoid caffeine and alcohol",
            "Eat smaller, more frequent meals",
            "Consider anti-diarrheal medications",
            "Manage stress levels"
        ]
    elif max_score == ibs_m_score:
        ibs_type = "IBS-M"
        confidence = min(0.9, (ibs_m_score / 10) + 0.3)
        reasoning = "Your symptoms suggest IBS with mixed bowel habits (IBS-M). You experience both constipation and diarrhea."
        recommendations = [
            "Keep a detailed symptom diary",
            "Work with a dietitian",
            "Identify trigger foods",
            "Maintain regular meal times",
            "Consider stress management techniques"
        ]
    else:
        ibs_type = "IBS-U"
        confidence = 0.6
        reasoning = "Your symptoms don't clearly fit into a specific IBS subtype. This is classified as IBS-Unspecified (IBS-U)."
        recommendations = [
            "Continue monitoring symptoms",
            "Keep a detailed food diary",
            "Consult with a gastroenterologist",
            "Consider stress management",
            "Maintain regular exercise"
        ]
    
    return IBSClassification(
        ibs_type=ibs_type,
        confidence=confidence,
        reasoning=reasoning,
        recommendations=recommendations
    )

def get_next_steps(ibs_type: str) -> List[str]:
    """Get next steps based on IBS type"""
    base_steps = [
        "Schedule a follow-up with your healthcare provider",
        "Start tracking your daily symptoms",
        "Begin implementing dietary recommendations",
        "Set up daily reminder notifications"
    ]
    
    type_specific_steps = {
        "IBS-C": [
            "Gradually increase fiber intake",
            "Start a regular exercise routine",
            "Consider over-the-counter fiber supplements"
        ],
        "IBS-D": [
            "Begin a low-FODMAP elimination diet",
            "Identify and avoid trigger foods",
            "Consider anti-diarrheal medications"
        ],
        "IBS-M": [
            "Work with a registered dietitian",
            "Keep detailed symptom and food logs",
            "Develop a personalized management plan"
        ],
        "IBS-U": [
            "Continue comprehensive symptom tracking",
            "Consult with a gastroenterologist",
            "Consider additional diagnostic testing"
        ]
    }
    
    return base_steps + type_specific_steps.get(ibs_type, [])
