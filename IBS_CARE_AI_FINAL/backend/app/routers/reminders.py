from flask import Blueprint, request, jsonify
import logging
from datetime import datetime, timedelta
from ..schemas import EmailReminder
from ..auth_utils import require_auth
from ..firebase_init import db
from ..email_service import send_daily_reminder, send_weekly_summary
import threading
import time

logger = logging.getLogger(__name__)
bp = Blueprint('reminders', __name__)

@bp.route('/setup', methods=['POST'])
@require_auth
def setup_reminders(user_uid: str, user_email: str):
    """Setup email reminders for user"""
    try:
        data = request.get_json()
        reminder = EmailReminder(
            user_id=user_uid,
            email=user_email,
            reminder_type=data.get('reminder_type', 'daily'),
            enabled=data.get('enabled', True),
            time=data.get('time', '09:00'),
            timezone=data.get('timezone', 'UTC')
        )
        
        # Save reminder settings to Firestore
        doc_ref = db.collection('users').document(user_uid).collection('settings').document('reminders')
        doc_ref.set({
            'reminder_type': reminder.reminder_type,
            'enabled': reminder.enabled,
            'time': reminder.time,
            'timezone': reminder.timezone,
            'created_at': datetime.now().isoformat()
        })
        
        # Send welcome email
        user_doc = db.collection('users').document(user_uid).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        user_name = user_data.get('display_name', user_email.split('@')[0])
        
        send_welcome_email(user_email, user_name)
        
        return jsonify({
            "message": "Reminders setup successfully",
            "reminder": reminder.dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Failed to setup reminders: {e}")
        return jsonify({"error": "Failed to setup reminders"}), 500

@bp.route('/settings', methods=['GET'])
@require_auth
def get_reminder_settings(user_uid: str, user_email: str):
    """Get user's reminder settings"""
    try:
        doc_ref = db.collection('users').document(user_uid).collection('settings').document('reminders')
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({
                "enabled": False,
                "reminder_type": "daily",
                "time": "09:00",
                "timezone": "UTC"
            })
            
        return jsonify(doc.to_dict())
        
    except Exception as e:
        logger.error(f"Failed to get reminder settings: {e}")
        return jsonify({"error": "Failed to get reminder settings"}), 500

@bp.route('/settings', methods=['PUT'])
@require_auth
def update_reminder_settings(user_uid: str, user_email: str):
    """Update user's reminder settings"""
    try:
        data = request.get_json()
        
        doc_ref = db.collection('users').document(user_uid).collection('settings').document('reminders')
        doc_ref.update({
            'reminder_type': data.get('reminder_type'),
            'enabled': data.get('enabled'),
            'time': data.get('time'),
            'timezone': data.get('timezone'),
            'updated_at': datetime.now().isoformat()
        })
        
        return jsonify({"message": "Reminder settings updated successfully"})
        
    except Exception as e:
        logger.error(f"Failed to update reminder settings: {e}")
        return jsonify({"error": "Failed to update reminder settings"}), 500

@bp.route('/test', methods=['POST'])
@require_auth
def test_reminder(user_uid: str, user_email: str):
    """Send a test reminder email"""
    try:
        user_doc = db.collection('users').document(user_uid).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        user_name = user_data.get('display_name', user_email.split('@')[0])
        
        success = send_daily_reminder(user_email, user_name)
        
        if success:
            return jsonify({"message": "Test reminder sent successfully"})
        else:
            return jsonify({"error": "Failed to send test reminder"}), 500
            
    except Exception as e:
        logger.error(f"Failed to send test reminder: {e}")
        return jsonify({"error": "Failed to send test reminder"}), 500

@bp.route('/weekly-summary', methods=['POST'])
@require_auth
def send_weekly_summary_manual(user_uid: str, user_email: str):
    """Manually trigger weekly summary email"""
    try:
        # Get user's weekly data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        logs_ref = (
            db.collection('users')
            .document(user_uid)
            .collection('logs')
            .where('dateISO', '>=', start_date.strftime('%Y-%m-%d'))
            .where('dateISO', '<=', end_date.strftime('%Y-%m-%d'))
        )
        
        logs = []
        for doc in logs_ref.stream():
            logs.append(doc.to_dict())
        
        # Calculate summary data
        if logs:
            avg_mood = sum(log.get('mood', 5) for log in logs) / len(logs)
            avg_pain = sum(log.get('pain_level', 0) for log in logs) / len(logs)
            
            all_triggers = []
            for log in logs:
                all_triggers.extend(log.get('triggers', []))
            
            common_triggers = list(set(all_triggers))[:5]
            
            summary_data = {
                'days_logged': len(logs),
                'avg_mood': avg_mood,
                'avg_pain': avg_pain,
                'common_triggers': common_triggers
            }
        else:
            summary_data = {
                'days_logged': 0,
                'avg_mood': 0,
                'avg_pain': 0,
                'common_triggers': []
            }
        
        # Get user name
        user_doc = db.collection('users').document(user_uid).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        user_name = user_data.get('display_name', user_email.split('@')[0])
        
        success = send_weekly_summary(user_email, user_name, summary_data)
        
        if success:
            return jsonify({"message": "Weekly summary sent successfully"})
        else:
            return jsonify({"error": "Failed to send weekly summary"}), 500
            
    except Exception as e:
        logger.error(f"Failed to send weekly summary: {e}")
        return jsonify({"error": "Failed to send weekly summary"}), 500

# Background task for sending daily reminders
def send_daily_reminders_task():
    """Background task to send daily reminders"""
    while True:
        try:
            current_time = datetime.now()
            
            # Get all users with enabled daily reminders
            users_ref = db.collection('users')
            users = users_ref.stream()
            
            for user_doc in users:
                user_data = user_doc.to_dict()
                user_uid = user_doc.id
                
                # Check reminder settings
                reminder_doc = db.collection('users').document(user_uid).collection('settings').document('reminders')
                reminder_data = reminder_doc.get()
                
                if reminder_data.exists and reminder_data.to_dict().get('enabled', False):
                    reminder_time = reminder_data.to_dict().get('time', '09:00')
                    
                    # Check if it's time to send reminder
                    if current_time.hour == int(reminder_time.split(':')[0]) and current_time.minute == 0:
                        # Check if user already logged today
                        today = current_time.strftime('%Y-%m-%d')
                        log_doc = db.collection('users').document(user_uid).collection('logs').document(today)
                        
                        if not log_doc.get().exists:
                            # Send reminder
                            user_name = user_data.get('display_name', user_data.get('email', '').split('@')[0])
                            send_daily_reminder(user_data.get('email', ''), user_name)
                            
                            logger.info(f"Daily reminder sent to {user_data.get('email', '')}")
            
            # Sleep for 1 minute before next check
            time.sleep(60)
            
        except Exception as e:
            logger.error(f"Error in daily reminders task: {e}")
            time.sleep(60)

# Start background task in a separate thread
def start_reminder_service():
    """Start the background reminder service"""
    reminder_thread = threading.Thread(target=send_daily_reminders_task, daemon=True)
    reminder_thread.start()
    logger.info("Reminder service started")
