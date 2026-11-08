from pydantic import BaseModel
from typing import List, Optional


class DocumentPage(BaseModel):
    page_number: int
    content: str


class DocumentResponse(BaseModel):
    id: str
    title: str
    file_path: str
    file_size: int
    total_pages: int
    created_at: Optional[str] = None
    status: str = "ready"          
    total_chunks: int = 0
    processed_chunks: int = 0
    error: Optional[str] = None


class UploadSuccessResponse(BaseModel):
    success: bool
    message: str
    document: DocumentResponse
    pages: List[DocumentPage] = []   


class PagesResponse(BaseModel):
    pages: List[DocumentPage]
    offset: int
    limit: int
    total_pages: int
    has_more: bool


class DocumentDetailResponse(BaseModel):
    document: DocumentResponse
    pages: List[DocumentPage]        
    has_more: bool
