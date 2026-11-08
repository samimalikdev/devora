import io
import re
import json
import time
import hashlib
import logging
from typing import Dict, Any, Optional
import pypdf
from google.genai import types
from app.service.llm_service import get_gemini_client
from app.core import redis_client

logger = logging.getLogger(__name__)

_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 3600  


def get_cache_key(prefix: str, file_bytes: bytes, job_description: str) -> str:
    hasher = hashlib.sha256()
    hasher.update(file_bytes)
    hasher.update(job_description.strip().encode("utf-8"))
    return f"{prefix}:{hasher.hexdigest()}"


def get_from_cache(key: str) -> Optional[Any]:
    data = redis_client.cache_get(key)
    if data:
        logger.info(f" REDIS CACHE HIT for {key} (Saved 100% Gemini tokens!)")
        return data
    return None

def set_in_cache(key: str, data: Any):
    redis_client.cache_set(key, data, ttl_seconds=86400)




def clean_job_description(jd: str) -> str:

    boilerplate_patterns = [
        r"(?i)equal (opportunity|employment) employer.*",
        r"(?i)we are committed to (diversity|equal opportunity).*",
        r"(?i)all qualified applicants will receive consideration.*",
        r"(?i)salary and benefits:.*",
        r"(?i)benefits & perks:.*",
        r"(?i)privacy policy.*",
    ]
    cleaned = jd
    for pat in boilerplate_patterns:
        cleaned = re.split(pat, cleaned)[0]

    return re.sub(r"\n\s*\n+", "\n\n", cleaned).strip()


def extract_text_from_pdf(file_bytes: bytes) -> str:

    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
    full_text = []

    for idx, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""

        clean_page = re.sub(r"[ \t]+", " ", page_text)
        clean_page = re.sub(r"\n\s*\n+", "\n\n", clean_page).strip()
        if clean_page:
            full_text.append(f"--- Page {idx + 1} ---\n{clean_page}")

    return "\n\n".join(full_text)


COMBINED_SYSTEM_PROMPT = """You are Devora Resume Intelligence & Executive Harvard ATS Strategist.
Given a candidate's resume and a target Job Description (JD), evaluate the fit AND extract structured 1-page Harvard ATS resume data tailored to the JD.

Return a valid JSON object matching this exact schema:
{
  "analysis": {
    "match_score": 78,
    "job_title_detected": "Senior Flutter Developer",
    "summary": "2-3 sentences evaluating fit, strengths, and primary gaps against the JD.",
    "category_scores": {
      "skills_match": 82,
      "experience_depth": 75,
      "impact_score": 70,
      "readability": 88
    },
    "matched_skills": ["Flutter", "Dart", "BLoC", "REST APIs"],
    "missing_skills": ["GraphQL", "CI/CD (Fastlane)"],
    "strengths": ["Direct hands-on experience in Flutter and BLoC requested by JD."],
    "weaknesses": ["Lacks mention of mobile CI/CD automation."],
    "tailoring_tips": ["Highlight any unit testing or Play Store releases in recent projects."],
    "bullet_rewrites": [
      {
        "before": "Original bullet from resume",
        "after": "Tailored bullet with strong action verbs and quantified impact",
        "explanation": "Rationale aligned with JD"
      }
    ]
  },
  "builder_data": {
    "name": "Candidate Full Name",
    "contact": [
      {"text": "email@example.com", "url": null},
      {"text": "+123456789", "url": null},
      {"text": "linkedin.com/in/username", "url": "https://linkedin.com/in/username"},
      {"text": "github.com/username", "url": "https://github.com/username"},
      {"text": "portfolio.dev", "url": "https://portfolio.dev"}
    ],
    "summary": "2-3 sentence tailored Harvard summary highlighting expertise aligned with JD.",
    "experience": [
      {
        "title": "Role Title",
        "date": "2023 -- Present",
        "sub": "Company · Remote / Location",
        "bullets": [
          "Action verb + measurable business outcome + relevant tech stack matching JD."
        ]
      }
    ],
    "skills": [
      {"category": "Mobile", "skills": "Flutter, Dart, BLoC"},
      {"category": "Backend", "skills": "Node.js, PostgreSQL"}
    ],
    "projects": [
      {
        "name": "Project Name — One-line Overview",
        "link": "github.com/username/project",
        "stack": "Tech · Stack · MiddleDots",
        "bullets": ["Action verb + metrics + technical delivery matching JD."]
      }
    ],
    "education": [
      {"degree": "Degree Title", "status": "In Progress or Completed", "school": "Institution Name"}
    ]
  }
}
Density & Formatting Rules:
- NEVER hallucinate fake companies or fake degrees. Use the candidate's authentic background.
- FULL 1-PAGE DENSITY: Ensure the resume comfortably occupies 85% to 95% of a single page without spilling onto page 2.
- Write 3 to 4 detailed, quantified bullet points per experience role and project (following the XYZ formula: Accomplished [X] measured by [Y] by doing [Z], mentioning frameworks & tools matching the JD).
- Include 3 to 4 comprehensive skill categories (e.g. Mobile Development, Backend & APIs, Databases, Cloud & DevOps).
- Feature 2 to 3 relevant projects from the candidate's history with tech stack details and impact bullets.
- Never produce sparse or brief output that leaves the lower half of the page blank.
"""


def _run_single_pass_ai(file_bytes: bytes, job_description: str) -> Dict[str, Any]:
    cache_key = get_cache_key("combined", file_bytes, job_description)
    cached = get_from_cache(cache_key)
    if cached:
        return cached

    resume_text = extract_text_from_pdf(file_bytes)
    if not resume_text.strip():
        raise ValueError("Could not extract readable text from the uploaded PDF resume.")

    cleaned_jd = clean_job_description(job_description)
    if not cleaned_jd:
        raise ValueError("Job description is required.")

    client = get_gemini_client()
    user_prompt = f"TARGET JOB DESCRIPTION:\n{cleaned_jd}\n\nCANDIDATE RESUME TEXT:\n{resume_text}"

    config = types.GenerateContentConfig(
        system_instruction=COMBINED_SYSTEM_PROMPT,
        temperature=0.25,
        response_mime_type="application/json",
    )

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=user_prompt,
        config=config,
    )

    raw_json = response.text or "{}"
    data = json.loads(raw_json)

    set_in_cache(cache_key, data)
    return data


def analyze_resume(file_bytes: bytes, job_description: str) -> Dict[str, Any]:
    full_data = _run_single_pass_ai(file_bytes, job_description)
    analysis = full_data.get("analysis", {})

    for b in analysis.get("bullet_rewrites", []):
        if "explaination" in b and "explanation" not in b:
            b["explanation"] = b["explaination"]

    return analysis


def generate_tailored_resume_data(file_bytes: bytes, job_description: str) -> Dict[str, Any]:
    full_data = _run_single_pass_ai(file_bytes, job_description)
    return full_data.get("builder_data", {})
