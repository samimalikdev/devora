import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.responses import Response, PlainTextResponse

from app.core.auth import get_current_user
from app.schemas.resume import (
    ResumeAnalysisResponse,
    ResumeBuilderData,
    GenerateLatexResponse,
)
from app.service import resume_service, latex_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resume", tags=["Resume Intelligence"])

MAX_UPLOAD_SIZE = 15 * 1024 * 1024 


@router.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume_endpoint(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    user_id: Optional[str] = Form(None),
    current_user=Depends(get_current_user),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resume files are supported.",
        )

    if not job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty.",
        )

    file_bytes = await file.read(MAX_UPLOAD_SIZE + 1)
    if len(file_bytes) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 15MB limit.",
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    try:
        analysis = resume_service.analyze_resume(
            file_bytes=file_bytes,
            job_description=job_description,
        )
        return analysis

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during resume analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze resume against job description.",
        )


@router.post("/build-data", response_model=ResumeBuilderData)
async def build_resume_data_endpoint(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    current_user=Depends(get_current_user),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported.",
        )

    if not job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty.",
        )

    file_bytes = await file.read(MAX_UPLOAD_SIZE + 1)
    if len(file_bytes) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 15MB limit.",
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    try:
        data = resume_service.generate_tailored_resume_data(
            file_bytes=file_bytes,
            job_description=job_description,
        )
        return data
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating tailored resume data: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate tailored resume data.",
        )


@router.post("/generate-latex", response_model=GenerateLatexResponse)
async def generate_latex_endpoint(
    payload: ResumeBuilderData,
    current_user=Depends(get_current_user),
):
    try:
        tex_code = latex_service.build_tex(payload)
        return GenerateLatexResponse(tex_content=tex_code, filename="resume.tex")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate LaTeX: {str(e)}",
        )


@router.post("/download-tex")
async def download_tex_endpoint(
    payload: ResumeBuilderData,
    current_user=Depends(get_current_user),
):
    try:
        tex_code = latex_service.build_tex(payload)
        return PlainTextResponse(
            content=tex_code,
            media_type="text/x-tex",
            headers={"Content-Disposition": "attachment; filename=resume.tex"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate download: {str(e)}",
        )


@router.post("/generate-pdf")
async def generate_pdf_endpoint(
    payload: ResumeBuilderData,
    current_user=Depends(get_current_user),
):
    try:
        tex_code = latex_service.build_tex(payload)
        pdf_bytes = latex_service.compile_latex_to_pdf(tex_code)

        clean_name = payload.name.strip().replace(" ", "_")
        filename = f"{clean_name}_Resume.pdf" if clean_name else "resume.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "application/pdf",
            },
        )
    except RuntimeError as re:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(re))
    except Exception as e:
        logger.error(f"Error compiling resume PDF: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile PDF: {str(e)}",
        )
