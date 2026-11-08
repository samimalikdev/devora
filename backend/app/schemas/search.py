from __future__ import annotations
from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User question or search query")
    document_id: str | None = Field(default=None, description="Specific document ID to search within")
    top_k: int = Field(default=3, ge=1, le=20, description="Kitne relevant passages return karne hain")


class SourceReference(BaseModel):
    document_id: str
    page_number: int
    score: float | None = None
    snippet: str = ""


class SearchHit(BaseModel):
    document_id: str
    page_number: int
    content: str
    relevance_score: float | None = None
    bm25_score: float | None = None


class AskedQuestion(BaseModel):
    asked: bool = False
    answer: str | None = None
    sources: list[SourceReference] = Field(default_factory=list)


class SearchResponse(BaseModel):
    success: bool = True
    query: str
    count: int = 0
    results: list[SearchHit] = Field(default_factory=list)
    answer: AskedQuestion = Field(default_factory=AskedQuestion)
