import logging
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user
from app.schemas.agent import (
    JobAuditRequest,
    JobAuditApproveRequest,
    MockInterviewStartRequest,
    MockInterviewAnswerRequest,
)
from app.service import agent_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent", tags=["LangGraph Multi-Agent Intelligence"])


@router.post("/job-audit", summary="Start Job Description Audit & Gap Analysis")
async def start_job_audit_endpoint(
    req: JobAuditRequest,
    current_user=Depends(get_current_user),
):
    try:
        user_id = str(current_user.id)
        result = agent_service.run_job_audit(req, user_id=user_id)
        return {
            "status": "awaiting_user_approval",
            "message": "Audit completed. Review flagged gaps and confirm your strengths to generate battle plan.",
            **result,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job audit execution failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Job audit failed: {str(e)}",
        )


@router.post("/job-audit/approve", summary="Approve/Clarify Gaps & Resume Graph for Battle Plan")
async def approve_job_audit_endpoint(
    req: JobAuditApproveRequest,
    current_user=Depends(get_current_user),
):
    try:
        user_id = str(current_user.id)
        result = agent_service.resume_job_audit(req, user_id=user_id)
        return {
            "status": "completed",
            "message": "Battle plan synthesized successfully.",
            **result,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job audit resume failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resume job audit: {str(e)}",
        )


@router.post("/mock-interview/start", summary="Start Mock Technical / Architecture Scenario")
async def start_mock_interview_endpoint(
    req: MockInterviewStartRequest,
    current_user=Depends(get_current_user),
):
    try:
        user_id = str(current_user.id)
        result = agent_service.start_mock_interview(req, user_id=user_id)
        return {
            "status": "awaiting_candidate_answer",
            "message": "Scenario generated. Awaiting candidate answer.",
            **result,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Mock interview start failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mock interview generation failed: {str(e)}",
        )


@router.post("/mock-interview/answer", summary="Submit Answer & Resume Graph for Rubric Scoring")
async def answer_mock_interview_endpoint(
    req: MockInterviewAnswerRequest,
    current_user=Depends(get_current_user),
):
    try:
        user_id = str(current_user.id)
        result = agent_service.answer_mock_interview(req, user_id=user_id)
        return {
            "status": "completed",
            "message": "Interview response evaluated successfully.",
            **result,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Mock interview evaluation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate interview answer: {str(e)}",
        )
