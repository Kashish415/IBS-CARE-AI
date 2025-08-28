"""
Enhanced LLM Adapter using LangChain for context-aware IBS care assistance
"""

import logging
import os
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel, Field

from .config import Config
from .firebase_init import db

logger = logging.getLogger(__name__)

class HealthContext(BaseModel):
    """Structured health context for personalized responses"""
    recent_logs_count: int = Field(default=0, description="Number of recent health logs")
    avg_mood: float = Field(default=5.0, description="Average mood score (1-10)")
    avg_energy: float = Field(default=5.0, description="Average energy score (1-10)")
    avg_symptom_severity: float = Field(default=0.0, description="Average symptom severity (0-10)")
    days_tracked: int = Field(default=0, description="Number of days tracked")
    common_symptoms: List[str] = Field(default_factory=list, description="Most common symptoms")
    common_triggers: List[str] = Field(default_factory=list, description="Most common triggers")
    ibs_type: Optional[str] = Field(default=None, description="IBS subtype from assessment")
    ibs_severity: Optional[str] = Field(default=None, description="IBS severity level")
    last_log_date: Optional[str] = Field(default=None, description="Date of last health log")

class ChatResponse(BaseModel):
    """Response model for chat interactions"""
    reply: str = Field(description="AI assistant response")
    tokens_used: int = Field(default=0, description="Number of tokens used")
    context_used: bool = Field(default=False, description="Whether health context was available")

class EnhancedLLMAdapter:
    """LangChain-powered LLM adapter with context awareness"""
    
    def __init__(self):
        self.gemini_api_key = Config.GEMINI_API_KEY
        self.groq_api_key = Config.GROQ_API_KEY
        self.model_name = Config.MODEL_NAME
        
        # Initialize LangChain models
        self.gemini_model = None
        self.groq_model = None
        
        if self.gemini_api_key:
            try:
                self.gemini_model = ChatGoogleGenerativeAI(
                    model=self.model_name,
                    google_api_key=self.gemini_api_key,
                    temperature=0.7,
                    max_tokens=1000
                )
                logger.info("Gemini model initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini model: {e}")
        
        if self.groq_api_key:
            try:
                self.groq_model = ChatGroq(
                    groq_api_key=self.groq_api_key,
                    model_name="llama3-8b-8192",
                    temperature=0.7,
                    max_tokens=800
                )
                logger.info("Groq model initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Groq model: {e}")
    
    def _get_system_prompt(self, health_context: HealthContext) -> str:
        """Generate context-aware system prompt"""
        
        base_prompt = """You are IBSCare AI, a compassionate and knowledgeable health assistant specializing in IBS (Irritable Bowel Syndrome) management. Your role is to provide personalized, evidence-based lifestyle advice and emotional support.

🎯 **Your Capabilities:**
- Provide personalized dietary recommendations based on user's patterns
- Suggest stress management and lifestyle modifications
- Help interpret symptom patterns and triggers
- Offer encouragement and emotional support
- Share evidence-based IBS management strategies

⚠️ **Critical Guidelines:**
- NEVER provide medical diagnosis or replace professional medical advice
- If user reports severe symptoms (fever >101°F, blood in stool, severe unrelenting pain), immediately advise seeking emergency medical care
- Always emphasize that your advice is educational and supplementary to professional healthcare
- Be empathetic, supportive, and encouraging while being realistic

📊 **Response Style:**
- Keep responses concise but thorough (2-4 paragraphs max)
- Use warm, empathetic language with appropriate emoji
- Provide specific, actionable advice when possible
- Reference user's health patterns when relevant
- Always end with encouragement and next steps"""

        # Add personalized context if available
        if health_context.recent_logs_count > 0:
            context_section = f"""

🔍 **User's Health Context:**
- Recent logs: {health_context.recent_logs_count} entries over {health_context.days_tracked} days
- Average mood: {health_context.avg_mood:.1f}/10
- Average energy: {health_context.avg_energy:.1f}/10
- Average symptom severity: {health_context.avg_symptom_severity:.1f}/10"""

            if health_context.last_log_date:
                context_section += f"\n- Last log date: {health_context.last_log_date}"
            
            if health_context.ibs_type:
                context_section += f"\n- IBS type: {health_context.ibs_type}"
                if health_context.ibs_severity:
                    context_section += f" ({health_context.ibs_severity})"
            
            if health_context.common_symptoms:
                context_section += f"\n- Common symptoms: {', '.join(health_context.common_symptoms[:5])}"
            
            if health_context.common_triggers:
                context_section += f"\n- Common triggers: {', '.join(health_context.common_triggers[:5])}"
            
            context_section += "\n\n**Use this context to personalize your advice and reference specific patterns when relevant.**"
            
            return base_prompt + context_section
        
        return base_prompt + "\n\n**Note:** No recent health data available for this user."
    
    async def get_health_context(self, user_uid: str) -> HealthContext:
        """Fetch and analyze user's health context from Firestore"""
        try:
            # Get recent health logs (last 14 days)
            cutoff_date = (datetime.now() - timedelta(days=14)).isoformat()
            
            health_logs_ref = (
                db.collection('health_logs')
                .where('userId', '==', user_uid)
                .where('createdAt', '>=', cutoff_date)
                .order_by('createdAt', direction='DESCENDING')
                .limit(50)
            )
            
            logs = []
            for doc in health_logs_ref.stream():
                logs.append(doc.to_dict())
            
            # Get user profile for assessment info
            user_profile = None
            try:
                user_doc = db.collection('users').document(user_uid).get()
                if user_doc.exists:
                    user_profile = user_doc.to_dict()
            except Exception as e:
                logger.warning(f"Could not fetch user profile: {e}")
            
            # Get assessment data
            assessment_data = None
            try:
                assessments_ref = (
                    db.collection('assessments')
                    .where('userId', '==', user_uid)
                    .order_by('createdAt', direction='DESCENDING')
                    .limit(1)
                )
                assessment_docs = list(assessments_ref.stream())
                if assessment_docs:
                    assessment_data = assessment_docs[0].to_dict()
            except Exception as e:
                logger.warning(f"Could not fetch assessment data: {e}")
            
            # Process health context
            if not logs:
                return HealthContext()
            
            # Calculate averages
            avg_mood = sum(log.get('mood', 5) for log in logs) / len(logs)
            avg_energy = sum(log.get('energy', 5) for log in logs) / len(logs)
            avg_symptoms = sum(log.get('symptomSeverity', 0) for log in logs) / len(logs)
            
            # Extract common symptoms and triggers
            all_symptoms = []
            all_triggers = []
            unique_dates = set()
            
            for log in logs:
                if 'symptoms' in log and isinstance(log['symptoms'], list):
                    all_symptoms.extend(log['symptoms'])
                if 'triggers' in log and isinstance(log['triggers'], list):
                    all_triggers.extend(log['triggers'])
                if 'date' in log:
                    unique_dates.add(log['date'])
            
            # Get most common symptoms and triggers
            from collections import Counter
            common_symptoms = [item for item, count in Counter(all_symptoms).most_common(5)]
            common_triggers = [item for item, count in Counter(all_triggers).most_common(5)]
            
            # Build context
            context = HealthContext(
                recent_logs_count=len(logs),
                avg_mood=round(avg_mood, 1),
                avg_energy=round(avg_energy, 1),
                avg_symptom_severity=round(avg_symptoms, 1),
                days_tracked=len(unique_dates),
                common_symptoms=common_symptoms,
                common_triggers=common_triggers,
                last_log_date=logs[0].get('date') if logs else None
            )
            
            # Add assessment data if available
            if assessment_data:
                context.ibs_type = assessment_data.get('type')
                context.ibs_severity = assessment_data.get('severity')
            
            logger.info(f"Generated health context for user {user_uid}: {context.recent_logs_count} logs, {context.days_tracked} days")
            return context
            
        except Exception as e:
            logger.error(f"Failed to get health context for user {user_uid}: {e}")
            return HealthContext()
    
    async def generate_response(self, user_uid: str, message: str, chat_history: List[Dict] = None) -> ChatResponse:
        """Generate AI response using LangChain with health context"""
        try:
            # Get user's health context
            health_context = await self.get_health_context(user_uid)
            
            # Generate system prompt with context
            system_prompt = self._get_system_prompt(health_context)
            
            # Build conversation history
            messages = [SystemMessage(content=system_prompt)]
            
            # Add chat history if available
            if chat_history:
                for msg in chat_history[-10:]:  # Last 10 messages for context
                    if msg.get('role') == 'user':
                        messages.append(HumanMessage(content=msg['content']))
                    elif msg.get('role') == 'assistant':
                        messages.append(AIMessage(content=msg['content']))
            
            # Add current user message
            messages.append(HumanMessage(content=message))
            
            # Try Gemini first, then Groq as fallback
            response_text = None
            tokens_used = 0
            
            if self.gemini_model:
                try:
                    response = await self.gemini_model.ainvoke(messages)
                    response_text = response.content
                    # Gemini doesn't provide token usage in LangChain, estimate
                    tokens_used = len(message.split()) + len(response_text.split())
                    logger.info("Generated response using Gemini model")
                except Exception as e:
                    logger.warning(f"Gemini model failed: {e}")
            
            if not response_text and self.groq_model:
                try:
                    response = await self.groq_model.ainvoke(messages)
                    response_text = response.content
                    tokens_used = len(message.split()) + len(response_text.split())
                    logger.info("Generated response using Groq model")
                except Exception as e:
                    logger.warning(f"Groq model failed: {e}")
            
            # Fallback response if both models fail
            if not response_text:
                response_text = self._get_fallback_response()
                tokens_used = 0
            
            return ChatResponse(
                reply=response_text,
                tokens_used=tokens_used,
                context_used=health_context.recent_logs_count > 0
            )
            
        except Exception as e:
            logger.error(f"Failed to generate response: {e}")
            return ChatResponse(
                reply=self._get_fallback_response(),
                tokens_used=0,
                context_used=False
            )
    
    def _get_fallback_response(self) -> str:
        """Generate fallback response when AI models are unavailable"""
        return """Hello! I'm your IBS care assistant. I'm here to help you manage your symptoms and provide personalized advice. How are you feeling today?

I'm currently experiencing some technical difficulties with my AI processing, but I'm still here to support you! While I work on getting back to full capacity, you can:

📊 Track your symptoms in the Daily Log
🧠 Complete or review your IBS assessment  
📈 Check your health dashboard for patterns

I'll be back to providing personalized advice shortly. How can I help you today? 💙"""

# Global enhanced LLM adapter instance
enhanced_llm_adapter = EnhancedLLMAdapter()
