from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime

class MealItem(BaseModel):
    timeISO: str
    items: List[str]

class LogCreate(BaseModel):
    dateISO: str = Field(..., description="Date in ISO format (YYYY-MM-DD)")
    mood: int = Field(..., ge=1, le=10, description="Mood rating 1-10")
    pain_level: int = Field(..., ge=0, le=10, description="Pain level 0-10")
    meals: List[MealItem] = Field(default=[], description="List of meals")
    notes: str = Field(default="", description="Additional notes")
    triggers: List[str] = Field(default=[], description="List of triggers")

    @validator('dateISO')
    def validate_date(cls, v):
        try:
            datetime.fromisoformat(v)
        except ValueError:
            raise ValueError('Invalid date format. Use YYYY-MM-DD')
        return v

class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="User message")

class TokenVerification(BaseModel):
    id_token: str = Field(..., description="Firebase ID token")

class LogResponse(BaseModel):
    dateISO: str
    mood: int
    pain_level: int
    meals: List[MealItem]
    notes: str
    triggers: List[str]
    createdAt: str

class ChatResponse(BaseModel):
    reply: str
    tokens_used: Optional[int] = 0

class HealthResponse(BaseModel):
    status: str = "ok"

class AuthResponse(BaseModel):
    uid: str
    email: str

# New schemas for assessment and IBS classification
class AssessmentQuestion(BaseModel):
    id: str
    question: str
    type: str  # "multiple_choice", "scale", "text"
    options: Optional[List[str]] = None
    required: bool = True

class AssessmentAnswer(BaseModel):
    question_id: str
    answer: Any

class AssessmentSubmission(BaseModel):
    user_id: str
    answers: List[AssessmentAnswer]
    completed_at: datetime

class IBSClassification(BaseModel):
    ibs_type: str  # "IBS-C", "IBS-D", "IBS-M", "IBS-U"
    confidence: float
    reasoning: str
    recommendations: List[str]

class AssessmentResult(BaseModel):
    classification: IBSClassification
    completed_at: datetime
    next_steps: List[str]

class EmailReminder(BaseModel):
    user_id: str
    email: str
    reminder_type: str  # "daily", "weekly", "custom"
    enabled: bool = True
    time: str = "09:00"  # HH:MM format
    timezone: str = "UTC"