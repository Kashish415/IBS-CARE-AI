import asyncio
from flask import Blueprint, request, jsonify
import logging
from datetime import datetime
import uuid
from ..schemas import ChatMessage, ChatResponse
from ..auth_utils import require_auth
from ..firebase_init import db
from ..enhanced_llm_adapter import enhanced_llm_adapter

logger = logging.getLogger(__name__)
bp = Blueprint('chat', __name__)

@bp.route('/chat', methods=['POST'])
@require_auth
def chat_endpoint(user_uid: str, user_email: str):
    """Handle chat messages with enhanced AI assistant using LangChain"""
    try:
        # Validate request
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Message is required"}), 400

        user_message = data['message'].strip()
        if not user_message:
            return jsonify({"error": "Message cannot be empty"}), 400

        # Get chat history for context
        chat_history = get_recent_chat_history(user_uid, limit=20)

        # Generate AI response using enhanced adapter
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            ai_response = loop.run_until_complete(
                enhanced_llm_adapter.generate_response(
                    user_uid=user_uid,
                    message=user_message,
                    chat_history=chat_history
                )
            )
        finally:
            loop.close()

        # Save conversation to Firestore
        save_chat_message(user_uid, "user", user_message)
        save_chat_message(user_uid, "assistant", ai_response.reply)

        return jsonify({
            "reply": ai_response.reply,
            "tokens_used": ai_response.tokens_used,
            "context_used": ai_response.context_used
        })

    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        return jsonify({
            "reply": "Hello! I'm your IBS care assistant. I'm here to help you manage your symptoms and provide personalized advice. How are you feeling today?",
            "tokens_used": 0,
            "context_used": False,
            "error": "Temporary service issue"
        }), 200  # Return 200 with fallback message

@bp.route('/chat/history', methods=['GET'])
@require_auth
def get_chat_history_endpoint(user_uid: str, user_email: str):
    """Get user's chat history"""
    try:
        limit = request.args.get('limit', 50, type=int)
        chat_history = get_recent_chat_history(user_uid, limit=limit)

        return jsonify({
            "messages": chat_history,
            "count": len(chat_history)
        })

    except Exception as e:
        logger.error(f"Failed to get chat history: {e}")
        return jsonify({"error": "Failed to retrieve chat history"}), 500

@bp.route('/chat/intro', methods=['GET'])
@require_auth
def get_intro_message(user_uid: str, user_email: str):
    """Get personalized intro message with suggestions"""
    try:
        # Get user context for personalization
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            health_context = loop.run_until_complete(
                enhanced_llm_adapter.get_health_context(user_uid)
            )
        finally:
            loop.close()

        # Generate intro message
        intro_message = "Hello! I'm your IBS care assistant. I'm here to help you manage your symptoms and provide personalized advice. How are you feeling today?"

        # Personalize based on context
        if health_context.recent_logs_count > 0:
            if health_context.avg_symptom_severity > 6:
                intro_message = f"Hello! I see you've been tracking your symptoms regularly. With your recent symptom levels, I'm here to help you find relief strategies. How are you feeling today?"
            elif health_context.avg_mood < 5:
                intro_message = f"Hello! I've noticed your mood has been a bit lower lately. Let's work together on some strategies to help you feel better. How are you doing today?"
            else:
                intro_message = f"Hello! Great to see you've been consistently tracking your health. Based on your {health_context.recent_logs_count} recent logs, let's continue optimizing your IBS management. How are you feeling today?"

        # Generate contextual suggestions
        suggestions = get_personalized_suggestions(health_context)

        return jsonify({
            "intro_message": intro_message,
            "suggestions": suggestions,
            "context_available": health_context.recent_logs_count > 0
        })

    except Exception as e:
        logger.error(f"Failed to get intro message: {e}")
        return jsonify({
            "intro_message": "Hello! I'm your IBS care assistant. I'm here to help you manage your symptoms and provide personalized advice. How are you feeling today?",
            "suggestions": [
                "How can I improve my digestive health?",
                "What foods should I avoid with IBS?",
                "Help me manage stress and anxiety",
                "Tell me about my symptom patterns"
            ],
            "context_available": False
        })

def get_recent_chat_history(user_uid: str, limit: int = 20) -> list:
    """Fetch recent chat messages from Firestore"""
    try:
        messages_ref = (
            db.collection('chat_history')
            .where('userId', '==', user_uid)
            .order_by('timestamp', direction='DESCENDING')
            .limit(limit)
        )

        messages = []
        for doc in messages_ref.stream():
            msg_data = doc.to_dict()
            # Convert to format expected by LangChain
            messages.append({
                "role": "user",
                "content": msg_data.get("message", "")
            })
            messages.append({
                "role": "assistant",
                "content": msg_data.get("response", "")
            })

        return list(reversed(messages))  # Return in chronological order

    except Exception as e:
        logger.error(f"Failed to fetch chat history: {e}")
        return []

def save_chat_message(user_uid: str, role: str, content: str):
    """Save a chat message to Firestore"""
    try:
        if role == "user":
            # Store user message temporarily, will be paired with assistant response
            return
        elif role == "assistant":
            # Save as complete conversation turn
            message_data = {
                "userId": user_uid,
                "message": "",  # Will be set by frontend
                "response": content,
                "timestamp": datetime.now().isoformat(),
                "context": {"model": "enhanced-langchain"}
            }

            db.collection('chat_history').add(message_data)

    except Exception as e:
        logger.error(f"Failed to save chat message: {e}")

def get_personalized_suggestions(health_context) -> list:
    """Generate personalized suggestions based on user's health context"""
    try:
        # Default suggestions
        default_suggestions = [
            "How can I improve my digestive health?",
            "What foods should I avoid with IBS?",
            "Help me manage stress and anxiety",
            "Tell me about my symptom patterns"
        ]

        if health_context.recent_logs_count == 0:
            return default_suggestions

        suggestions = []

        # Personalized suggestions based on context
        if health_context.avg_symptom_severity > 6:
            suggestions.append("Help me manage my current symptoms")
            suggestions.append("What can I do for severe symptom relief?")
        elif health_context.avg_symptom_severity > 3:
            suggestions.append("How can I reduce my symptom severity?")
            suggestions.append("What's causing my current symptoms?")
        else:
            suggestions.append("How can I prevent symptom flare-ups?")

        if health_context.avg_mood < 5:
            suggestions.append("Help me improve my mood and mental health")
        elif health_context.avg_energy < 5:
            suggestions.append("How can I boost my energy levels?")

        if health_context.common_triggers:
            suggestions.append(f"Tell me about my triggers: {', '.join(health_context.common_triggers[:2])}")

        if health_context.ibs_type:
            suggestions.append(f"Management tips for {health_context.ibs_type}")

        # Fill remaining slots with defaults
        while len(suggestions) < 4:
            for default in default_suggestions:
                if default not in suggestions:
                    suggestions.append(default)
                    break
            if len(suggestions) >= 4:
                break

        return suggestions[:4]

    except Exception as e:
        logger.error(f"Failed to generate personalized suggestions: {e}")
        return [
            "How can I improve my digestive health?",
            "What foods should I avoid with IBS?",
            "Help me manage stress and anxiety",
            "Tell me about my symptom patterns"
        ]
