from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class JobAuditRequest(BaseModel):
    job_description: str = Field(..., description="Raw text of the target job posting")
    target_role: Optional[str] = Field("Software Engineer", description="Target role title")
    experience_years: Optional[float] = Field(3.0, ge=0, description="Candidate years of experience")
    user_id: Optional[str] = None

class JobAuditApproveRequest(BaseModel):
    thread_id: str = Field(..., description="SQLite Checkpoint Thread ID")
    user_confirmed_skills: Optional[List[str]] = Field(default_factory=list, description="Skills user confirmed having")
    user_notes: Optional[str] = Field(None, description="Additional context or notes for the battle-plan")
   

class MockInterviewStartRequest(BaseModel):
    topic: str = Field(..., example="System Design: Distributed Rate Limiter & URL Shortener")
    difficulty: Optional[str] = Field("Senior", example="Mid / Senior / Staff")
    target_role: Optional[str] = Field("Full-Stack / AI Engineer", example="Target position")
    thread_id: Optional[str] = None
    user_id: Optional[str] = None

    
class MockInterviewAnswerRequest(BaseModel):
    thread_id: str = Field(..., description="Active interview session thread ID")
    candidate_answer: str = Field(..., description="Candidate's technical response to the scenario")

