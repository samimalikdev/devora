from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel, Field

class ChatPromptRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User's prompt / question")
    chat_id: Optional[str] = Field(default=None, description="Existing chat ID (agar new conversation ho to omit karein)")
    user_id: str = Field(..., description="Authenticated user ID (Required)")
    
class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str    

class ChatMessageResponse(BaseModel):
    id: str
    chat_id: str
    role: str
    content: str
    created_at: str    