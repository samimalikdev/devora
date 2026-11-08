import logging
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.core.supabase import supabase
from app.core.auth import get_current_user
from app.api.v1.auth import router as auth_router
from app.api.v1.documents import router as documents_router
from app.api.v1.search import router as search_router
from app.api.v1.chat import router as chat_router
from app.api.v1.resume import router as resume_router
from app.api.v1.agent import router as agent_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title='Devora AI Backend',
    description='Backend for Devora AI Platform',
    version='1.0.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix='/api/v1')
app.include_router(documents_router, prefix='/api/v1')
app.include_router(search_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(resume_router, prefix="/api/v1")
app.include_router(agent_router, prefix="/api/v1")


@app.get('/')
def read_root():
    return {
        "status": "online",
        "message": "Welcome to Devora AI Backend API",
        "docs_url": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get('/db-check')
def test_supabase_connection(current_user=Depends(get_current_user)):
    try: 
        _ = supabase.storage.list_buckets()
        return {
            "database": "connected",
            "message": "Supabase client successfully connected!"
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection error"
        )
