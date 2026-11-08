import uuid
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import StreamingResponse

from app.core.auth import get_current_user
from app.core.rate_limiter import enforce_rate_limit
from app.schemas.chat import ChatPromptRequest, ChatSessionResponse, ChatMessageResponse
from app.service import chat_service

router = APIRouter(prefix="/chat", tags=["Chat"])


def is_valid_uuid(val: str | None) -> bool:
    if not val or not val.strip() or val.strip().lower() == "string":
        return False
    try:
        uuid.UUID(val.strip())
        return True
    except ValueError:
        return False


@router.post("/stream")
async def chat_stream(
    request: ChatPromptRequest,
    current_user = Depends(get_current_user),
):

    user_id = str(current_user.id)
    enforce_rate_limit(
        key_prefix="chat_stream",
        identifier=user_id,
        max_requests=30,
        window_seconds=60,
        error_message="Chat rate limit reached. Please wait a moment before sending more messages."
    )
    valid_chat_id = request.chat_id if is_valid_uuid(request.chat_id) else None
    user_msg = request.message.strip()

    try:
        chat_id = chat_service.get_or_create_chat(user_id, valid_chat_id, user_msg)
        chat_service.save_user_message(chat_id, user_msg)
        history = chat_service.get_conversation_history(chat_id)

        return StreamingResponse(
            chat_service.stream_chat_response(chat_id, history, user_id=user_id),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=List[ChatSessionResponse])
def get_user_chats(current_user = Depends(get_current_user)):

    try:
        return chat_service.fetch_user_chats(str(current_user.id))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{chat_id}/messages", response_model=List[ChatMessageResponse])
def get_chat_messages(
    chat_id: str,
    current_user = Depends(get_current_user),
):
    if not is_valid_uuid(chat_id):
        return []
    try:

        messages = chat_service.fetch_chat_messages(chat_id, str(current_user.id))
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{chat_id}")
def delete_chat(
    chat_id: str,
    current_user = Depends(get_current_user),
):
    if not is_valid_uuid(chat_id):
        raise HTTPException(status_code=400, detail="Invalid chat_id")
    try:
        success = chat_service.remove_chat_session(chat_id, str(current_user.id))
        return {"success": success, "message": "Chat deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
