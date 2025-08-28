import logging
import os
from typing import List, Dict, Optional
import httpx
from .config import Config

logger = logging.getLogger(__name__)

class LLMAdapter:
    def __init__(self):
        self.gemini_api_key = Config.GEMINI_API_KEY
        self.groq_api_key = Config.GROQ_API_KEY
        self.model_name = Config.MODEL_NAME

    async def call_llm(self, system_prompt: str, messages: List[Dict], model_name: str = None) -> Dict:
        """
        Call LLM with provider fallback
        Returns: {"reply": str, "tokens_used": int}
        """
        model_name = model_name or self.model_name
        
        # Try Gemini first
        if self.gemini_api_key and 'gemini' in model_name.lower():
            try:
                return await self._call_gemini(system_prompt, messages, model_name)
            except Exception as e:
                logger.warning(f"Gemini API failed: {e}")
        
        # Fallback to Groq
        if self.groq_api_key:
            try:
                return await self._call_groq(system_prompt, messages)
            except Exception as e:
                logger.warning(f"Groq API failed: {e}")
        
        # If both fail, return a default response
        return {
            "reply": "I apologize, but I'm temporarily unable to process your request. Please try again later or consult with your healthcare provider for immediate concerns.",
            "tokens_used": 0
        }

    async def _call_gemini(self, system_prompt: str, messages: List[Dict], model_name: str) -> Dict:
        """Call Google Gemini API via HTTP"""
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=self.gemini_api_key)
            model = genai.GenerativeModel(model_name)
            
            # Format messages for Gemini
            conversation = f"{system_prompt}\n\n"
            for msg in messages:
                role = "Human" if msg["role"] == "user" else "Assistant"
                conversation += f"{role}: {msg['content']}\n"
            
            # Generate response
            response = model.generate_content(conversation)
            
            return {
                "reply": response.text,
                "tokens_used": getattr(response, 'usage_metadata', {}).get('total_token_count', 0)
            }
            
        except ImportError:
            # Fallback to HTTP API if google-generativeai is not available
            return await self._call_gemini_http(system_prompt, messages, model_name)

    async def _call_gemini_http(self, system_prompt: str, messages: List[Dict], model_name: str) -> Dict:
        """Fallback HTTP implementation for Gemini"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
        
        # Format messages for Gemini REST API
        conversation = f"{system_prompt}\n\n"
        for msg in messages:
            role = "Human" if msg["role"] == "user" else "Assistant"
            conversation += f"{role}: {msg['content']}\n"
        
        payload = {
            "contents": [
                {
                    "parts": [{"text": conversation}]
                }
            ]
        }
        
        headers = {
            "Content-Type": "application/json",
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                headers=headers,
                params={"key": self.gemini_api_key},
                timeout=30.0
            )
            response.raise_for_status()
            
            data = response.json()
            reply = data["candidates"][0]["content"]["parts"][0]["text"]
            
            return {
                "reply": reply,
                "tokens_used": data.get("usageMetadata", {}).get("totalTokenCount", 0)
            }

    async def _call_groq(self, system_prompt: str, messages: List[Dict]) -> Dict:
        """Call Groq API via HTTP"""
        url = "https://api.groq.com/openai/v1/chat/completions"
        
        # Format messages for Groq (OpenAI-compatible format)
        formatted_messages = [{"role": "system", "content": system_prompt}]
        formatted_messages.extend(messages)
        
        payload = {
            "model": "llama3-8b-8192",
            "messages": formatted_messages,
            "max_tokens": 500,
            "temperature": 0.7
        }
        
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=30.0)
            response.raise_for_status()
            
            data = response.json()
            reply = data["choices"][0]["message"]["content"]
            tokens_used = data.get("usage", {}).get("total_tokens", 0)
            
            return {
                "reply": reply,
                "tokens_used": tokens_used
            }

# Global LLM adapter instance
llm_adapter = LLMAdapter()