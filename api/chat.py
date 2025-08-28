from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import asyncio
import logging
from datetime import datetime, timedelta
import uuid

app = Flask(__name__)
CORS(app)

# Import our existing modules
import sys
sys.path.append('.')
try:
    from IBS_CARE_AI_FINAL.backend.app.llm_adapter import LLMAdapter
    from IBS_CARE_AI_FINAL.backend.app.firebase_init import db
except ImportError:
    # Fallback for development
    pass

SYSTEM_PROMPT = """You are IBSCare Coach: an empathetic, concise assistant who provides non-diagnostic lifestyle suggestions for IBS. Use the user's recent logs (pain levels, mood, meals, triggers) and the last 20 chat turns for personalization. Be specific with actionable tips (diet, hydration, breathing exercises, sleep hygiene) but never provide a medical diagnosis. If the user reports red-flag symptoms (fever, blood in stool, severe unrelieved pain), advise seeing a doctor immediately."""

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """Handle chat messages with AI assistant"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400
        
        # Initialize LLM adapter
        llm_adapter = LLMAdapter()
        
        # Build messages for LLM
        messages = [{
            "role": "user",
            "content": user_message
        }]
        
        # Enhanced system prompt with context
        enhanced_prompt = f"{SYSTEM_PROMPT}\n\nUser's recent health summary: No recent data available."
        
        # Call LLM asynchronously
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            llm_response = loop.run_until_complete(
                llm_adapter.call_llm(enhanced_prompt, messages)
            )
        finally:
            loop.close()
        
        return jsonify({
            "reply": llm_response.get("reply", "I'm here to help with your IBS management. How can I assist you today?"),
            "tokens_used": llm_response.get("tokens_used", 0)
        })
        
    except Exception as e:
        logging.error(f"Chat endpoint error: {e}")
        return jsonify({
            "reply": "I'm experiencing some technical difficulties. Please try again in a moment. In the meantime, you can track your symptoms in the Daily Log section.",
            "tokens_used": 0
        })

# Vercel serverless function handler
def handler(request):
    return app(request.environ, lambda status, headers: None)
