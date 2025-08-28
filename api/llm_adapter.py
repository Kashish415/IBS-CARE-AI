import os
import httpx
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

class LLMAdapter:
    def __init__(self):
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.groq_api_key = os.getenv('GROQ_API_KEY')
        self.model_name = os.getenv('MODEL_NAME', 'gemini-2.0-flash')

    async def call_llm(self, system_prompt: str, messages: List[Dict], model_name: str = None) -> Dict:
        """Call LLM with provider fallback"""
        model_name = model_name or self.model_name
        
        # Try Gemini first
        if self.gemini_api_key:
            try:
                return await self._call_gemini_http(system_prompt, messages, model_name)
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

    async def _call_gemini_http(self, system_prompt: str, messages: List[Dict], model_name: str) -> Dict:
        """Call Gemini via HTTP API"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
        
        # Format messages for Gemini
        conversation = f"{system_prompt}\n\n"
        for msg in messages:
            role = "Human" if msg["role"] == "user" else "Assistant"
            conversation += f"{role}: {msg['content']}\n"
        
        payload = {
            "contents": [{"parts": [{"text": conversation}]}]
        }
        
        headers = {"Content-Type": "application/json"}
        
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
        """Call Groq API"""
        url = "https://api.groq.com/openai/v1/chat/completions"
        
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
            
            return {"reply": reply, "tokens_used": tokens_used}
