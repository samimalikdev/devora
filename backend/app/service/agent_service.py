import json
import os
import sqlite3
import uuid
import logging
from typing import TypedDict, Optional, List, Dict, Any
from fastapi import HTTPException, status

from google.genai import types
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.sqlite import SqliteSaver

from app.service.llm_service import get_gemini_client
from app.schemas.agent import (
    JobAuditRequest,
    JobAuditApproveRequest,
    MockInterviewStartRequest,
    MockInterviewAnswerRequest,
)

logger = logging.getLogger(__name__)

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "hitl_memory.sqlite")
_db_conn = sqlite3.connect(DB_PATH, check_same_thread=False)
checkpointer = SqliteSaver(_db_conn)



class JobIntelligenceState(TypedDict, total=False):
    thread_id: str
    chat_id: Optional[str]
    user_id: Optional[str]
    job_description: str
    target_role: str
    experience_years: float
    user_id: Optional[str]
    must_haves: List[str]
    nice_to_haves: List[str]
    architecture_patterns: List[str]
    red_flags: List[str]
    matched_skills: List[str]
    missing_critical_gaps: List[str]
    match_score: int
    user_confirmed_skills: List[str]
    user_notes: Optional[str]
    predicted_interview_questions: List[Dict[str, Any]]
    gap_defense_talking_points: List[str]
    reverse_interview_questions: List[str]
    status: str



def node_deconstruct_and_audit(state: JobIntelligenceState) -> Dict[str, Any]:

    client = get_gemini_client()
    jd_text = state.get("job_description", "")
    role = state.get("target_role", "Software Engineer")
    exp = state.get("experience_years", 3.0)

    prompt = f"""You are Devora Lead Job Intelligence Agent.
Analyze the target job description for a candidate targeting role: '{role}' with {exp} years of experience.
Return a clean JSON object with this exact structure:
{{
  "must_haves": ["Mandatory technical skills or credentials required"],
  "nice_to_haves": ["Optional or bonus skills mentioned"],
  "architecture_patterns": ["Architecture patterns required e.g., Microservices, Event-Driven, Clean Architecture"],
  "red_flags": ["Potential warning signs e.g., Unrealistic scope, ambiguous tech stack, 24/7 on-call"],
  "matched_skills": ["Skills expected for a {role} at {exp} yrs"],
  "missing_critical_gaps": ["High-priority gaps the candidate must defend or bridge"],
  "match_score": 78
}}

JOB DESCRIPTION:
{jd_text}
"""
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.2,
    )

    try:
        resp = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config=config,
        )
        data = json.loads(resp.text)
    except Exception as e:
        logger.error(f"Error in node_deconstruct_and_audit: {e}")
        data = {
            "must_haves": [role],
            "nice_to_haves": ["Cloud Deployment"],
            "architecture_patterns": ["RESTful APIs"],
            "red_flags": [],
            "matched_skills": [f"{role} fundamentals"],
            "missing_critical_gaps": ["Specific domain frameworks"],
            "match_score": 75,
        }

    return {
        **data,
        "status": "awaiting_user_approval",
    }


def node_synthesize_battle_plan(state: JobIntelligenceState) -> Dict[str, Any]:

    client = get_gemini_client()
    jd_text = state.get("job_description", "")
    role = state.get("target_role", "Software Engineer")
    gaps = state.get("missing_critical_gaps", [])
    confirmed = state.get("user_confirmed_skills", [])
    notes = state.get("user_notes", "")

    prompt = f"""You are Devora Lead Technical Interview Strategist.
Candidate targeting role: '{role}'
Target Job Description snippet: {jd_text[:800]}
Previously identified gaps: {json.dumps(gaps)}
Candidate confirmed skills: {json.dumps(confirmed)}
Candidate clarification notes: "{notes}"

Synthesize an interview battle plan tailored to this job and the candidate's actual strengths.
Return a clean JSON object with this exact structure:
{{
  "predicted_interview_questions": [
    {{
      "question": "Realistic scenario or technical deep-dive question",
      "focus_area": "Architecture / Coding / System Design / Behavioral",
      "model_talking_points": "Key concepts, trade-offs, and metrics the candidate should state"
    }}
  ],
  "gap_defense_talking_points": [
    "Specific pivot script or strategy to confidently address any remaining skill gaps"
  ],
  "reverse_interview_questions": [
    "High-impact question candidate can ask the interviewer to demonstrate seniority"
  ]
}}
Provide exactly 5 predicted questions, 3 gap defense talking points, and 3 reverse interview questions.
"""
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.3,
    )

    try:
        resp = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config=config,
        )
        plan = json.loads(resp.text)
    except Exception as e:
        logger.error(f"Error in node_synthesize_battle_plan: {e}")
        plan = {
            "predicted_interview_questions": [
                {
                    "question": f"How do you design scalable APIs for {role} roles?",
                    "focus_area": "System Architecture",
                    "model_talking_points": "Focus on idempotency, rate limiting, and caching layers.",
                }
            ],
            "gap_defense_talking_points": [
                "Emphasize strong fundamentals and rapid learning curve using analogous frameworks."
            ],
            "reverse_interview_questions": [
                "What is your deployment frequency and test coverage culture on this team?"
            ],
        }

    return {
        **plan,
        "status": "completed",
    }


job_graph_builder = StateGraph(JobIntelligenceState)
job_graph_builder.add_node("deconstruct_and_audit", node_deconstruct_and_audit)
job_graph_builder.add_node("synthesize_battle_plan", node_synthesize_battle_plan)
job_graph_builder.add_edge(START, "deconstruct_and_audit")
job_graph_builder.add_edge("deconstruct_and_audit", "synthesize_battle_plan")
job_graph_builder.add_edge("synthesize_battle_plan", END)

job_agent_graph = job_graph_builder.compile(
    checkpointer=checkpointer,
    interrupt_before=["synthesize_battle_plan"]
)



class CareerInterviewState(TypedDict, total=False):
    thread_id: str
    chat_id: Optional[str]
    user_id: Optional[str]
    topic: str
    difficulty: str
    target_role: str
    scenario_prompt: str
    rubric_criteria: List[str]
    candidate_answer: Optional[str]
    evaluation_score: Optional[int]
    strengths: List[str]
    missing_points: List[str]
    tech_lead_verdict: Optional[str]
    follow_up_challenge: Optional[str]
    status: str


def node_architect_scenario(state: CareerInterviewState) -> Dict[str, Any]:

    client = get_gemini_client()
    topic = state.get("topic", "System Design")
    difficulty = state.get("difficulty", "Senior")
    role = state.get("target_role", "Software Engineer")

    prompt = f"""You are a Principal Tech Lead at a Tier-1 tech company conducting a {difficulty} interview for a {role}.
Interview Topic: '{topic}'

Generate a production-grade scenario with real constraints (traffic, latency, data consistency, or failure modes).
Return a clean JSON object:
{{
  "scenario_prompt": "Clear, detailed problem statement describing the business challenge and engineering constraints.",
  "rubric_criteria": [
    "Criterion 1: e.g. Data modeling & consistency trade-offs",
    "Criterion 2: e.g. Caching & rate limiting strategy",
    "Criterion 3: e.g. Fault tolerance and single point of failure mitigation"
  ]
}}
"""
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.3,
    )

    try:
        resp = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config=config,
        )
        data = json.loads(resp.text)
    except Exception as e:
        logger.error(f"Error in node_architect_scenario: {e}")
        data = {
            "scenario_prompt": f"Design a resilient microservice architecture for: {topic}.",
            "rubric_criteria": ["Architecture clarity", "Scalability", "Trade-off analysis"],
        }

    return {
        **data,
        "status": "awaiting_candidate_answer",
    }


def node_evaluate_candidate(state: CareerInterviewState) -> Dict[str, Any]:

    client = get_gemini_client()
    scenario = state.get("scenario_prompt", "")
    rubric = state.get("rubric_criteria", [])
    answer = state.get("candidate_answer", "")

    prompt = f"""You are a Principal Tech Lead evaluating a candidate's interview answer.
SCENARIO:
{scenario}

RUBRIC CRITERIA:
{json.dumps(rubric)}

CANDIDATE ANSWER:
{answer}

Critique the answer rigorously according to the rubric.
Return a clean JSON object:
{{
  "evaluation_score": 85,
  "strengths": ["Clear strength 1", "Clear strength 2"],
  "missing_points": ["Important architectural detail or edge case that was overlooked"],
  "tech_lead_verdict": "2-3 sentences of direct, actionable feedback from the Tech Lead.",
  "follow_up_challenge": "A tough follow-up edge case or failure scenario to push the design further."
}}
"""
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.2,
    )

    try:
        resp = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config=config,
        )
        eval_data = json.loads(resp.text)
    except Exception as e:
        logger.error(f"Error in node_evaluate_candidate: {e}")
        eval_data = {
            "evaluation_score": 75,
            "strengths": ["Structured approach"],
            "missing_points": ["Edge cases under peak load"],
            "tech_lead_verdict": "Solid baseline thinking, but needs deeper fault tolerance.",
            "follow_up_challenge": "How would your design behave if the primary database partition became unreachable for 3 minutes?",
        }

    return {
        **eval_data,
        "status": "completed",
    }


interview_builder = StateGraph(CareerInterviewState)
interview_builder.add_node("architect_scenario", node_architect_scenario)
interview_builder.add_node("evaluate_candidate", node_evaluate_candidate)
interview_builder.add_edge(START, "architect_scenario")
interview_builder.add_edge("architect_scenario", "evaluate_candidate")
interview_builder.add_edge("evaluate_candidate", END)

interview_agent_graph = interview_builder.compile(
    checkpointer=checkpointer,
    interrupt_before=["evaluate_candidate"]
)



def run_job_audit(req: JobAuditRequest, user_id: str) -> Dict[str, Any]:
    thread_id = f"job-audit-{uuid.uuid4().hex[:10]}"
    config = {"configurable": {"thread_id": thread_id}}

    chat_id = None
    if user_id:
        try:
            from app.core.supabase import supabase_admin
            title = f"Job Audit: {req.target_role or 'Software Engineer'}"
            c_res = supabase_admin.table("chats").insert({
                "title": title,
                "user_id": user_id
            }).execute()
            if c_res.data:
                chat_id = str(c_res.data[0]["id"])
        except Exception as e:
            logger.warning(f"Failed to create chat in Supabase: {e}")

    initial_state: JobIntelligenceState = {
        "thread_id": thread_id,
        "chat_id": chat_id,
        "job_description": req.job_description,
        "target_role": req.target_role or "Software Engineer",
        "experience_years": req.experience_years or 3.0,
        "user_id": user_id,
    }

    job_agent_graph.invoke(initial_state, config)
    state = job_agent_graph.get_state(config)

    if chat_id:
        try:
            from app.core.supabase import supabase_admin
            supabase_admin.table("messages").insert({
                "chat_id": chat_id,
                "role": "user",
                "content": f"Analyze Job Description for '{req.target_role}':\n\n{req.job_description}"
            }).execute()

            audit_vals = state.values
            must_str = ", ".join(audit_vals.get("must_haves", []))
            gaps_str = ", ".join(audit_vals.get("missing_critical_gaps", []))
            summary_msg = (
                f"### Job Intelligence Audit: {req.target_role}\n\n"
                f"- **Match Score**: {audit_vals.get('match_score', 75)}%\n"
                f"- **Mandatory Tech Stack**: {must_str}\n"
                f"- **Flagged Critical Gaps**: {gaps_str}\n\n"
                f"*Awaiting Candidate Confirmation to synthesize battle plan.*"
            )
            supabase_admin.table("messages").insert({
                "chat_id": chat_id,
                "role": "assistant",
                "content": summary_msg
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to save initial messages to Supabase: {e}")

    return {
        "thread_id": thread_id,
        "chat_id": chat_id,
        "state": state.values,
        "next_step": list(state.next),
    }


def resume_job_audit(req: JobAuditApproveRequest, user_id: str) -> Dict[str, Any]:
    config = {"configurable": {"thread_id": req.thread_id}}

    existing_state = job_agent_graph.get_state(config)
    if not existing_state or not existing_state.values:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job audit thread not found."
        )

    owner_id = existing_state.values.get("user_id")
    if owner_id and owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this job audit session."
        )

    job_agent_graph.update_state(
        config,
        {
            "user_confirmed_skills": req.user_confirmed_skills or [],
            "user_notes": req.user_notes or "",
        }
    )

    job_agent_graph.invoke(None, config)
    state = job_agent_graph.get_state(config)

    chat_id = state.values.get("chat_id")
    if chat_id:
        try:
            from app.core.supabase import supabase_admin
            confirmed = ", ".join(req.user_confirmed_skills or [])
            notes = req.user_notes or "None"
            supabase_admin.table("messages").insert({
                "chat_id": chat_id,
                "role": "user",
                "content": f"Confirmed Skills: {confirmed}\nNotes: {notes}"
            }).execute()

            q_blocks = []
            for idx, q in enumerate(state.values.get("predicted_interview_questions", []), 1):
                q_blocks.append(f"**Q{idx} [{q.get('focus_area', 'Technical')}]: {q.get('question')}**\n> *Model Talking Points*: {q.get('model_talking_points')}")
            questions_str = "\n\n".join(q_blocks)
            gap_str = "\n".join(f"- {g}" for g in state.values.get("gap_defense_talking_points", []))
            rev_str = "\n".join(f"- {r}" for r in state.values.get("reverse_interview_questions", []))

            plan_msg = (
                f"### Strategic Interview Battle Plan\n\n"
                f"#### 5 Predicted Interview Questions:\n{questions_str}\n\n"
                f"#### Gap Defense Strategy:\n{gap_str}\n\n"
                f"#### Reverse-Interview Questions to Ask:\n{rev_str}"
            )
            supabase_admin.table("messages").insert({
                "chat_id": chat_id,
                "role": "assistant",
                "content": plan_msg
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to persist battle plan to Supabase: {e}")

    return {
        "thread_id": req.thread_id,
        "chat_id": chat_id,
        "state": state.values,
        "status": "completed",
    }


def start_mock_interview(req: MockInterviewStartRequest, user_id: str) -> Dict[str, Any]:
    thread_id = f"mock-{uuid.uuid4().hex[:10]}"
    config = {"configurable": {"thread_id": thread_id}}

    chat_id = None
    if user_id:
        try:
            from app.core.supabase import supabase_admin
            title = f"Mock Interview: {req.topic[:35]}"
            c_res = supabase_admin.table("chats").insert({
                "title": title,
                "user_id": user_id
            }).execute()
            if c_res.data:
                chat_id = str(c_res.data[0]["id"])
        except Exception as e:
            logger.warning(f"Failed to create mock chat in Supabase: {e}")

    initial_state: CareerInterviewState = {
        "thread_id": thread_id,
        "chat_id": chat_id,
        "user_id": user_id,
        "topic": req.topic,
        "difficulty": req.difficulty or "Senior",
        "target_role": req.target_role or "Full-Stack / AI Engineer",
    }

    interview_agent_graph.invoke(initial_state, config)
    state = interview_agent_graph.get_state(config)

    if chat_id:
        try:
            from app.core.supabase import supabase_admin
            rubrics = "\n".join(f"- {r}" for r in state.values.get("rubric_criteria", []))
            scenario_msg = (
                f"### Mock Interview Challenge: {req.topic}\n\n"
                f"**Level:** {req.difficulty} · **Role:** {req.target_role}\n\n"
                f"**Scenario:**\n{state.values.get('scenario_prompt')}\n\n"
                f"**Evaluation Rubric:**\n{rubrics}\n\n"
                f"*Awaiting candidate architecture response...*"
            )
            supabase_admin.table("messages").insert({
                "chat_id": chat_id,
                "role": "assistant",
                "content": scenario_msg
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to save mock scenario in Supabase: {e}")

    return {
        "thread_id": thread_id,
        "chat_id": chat_id,
        "state": state.values,
        "next_step": list(state.next),
    }


def answer_mock_interview(req: MockInterviewAnswerRequest, user_id: str) -> Dict[str, Any]:
    config = {"configurable": {"thread_id": req.thread_id}}

    existing_state = interview_agent_graph.get_state(config)
    if not existing_state or not existing_state.values:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mock interview thread not found."
        )

    owner_id = existing_state.values.get("user_id")
    if owner_id and owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this mock interview session."
        )

    interview_agent_graph.update_state(
        config,
        {"candidate_answer": req.candidate_answer}
    )

    interview_agent_graph.invoke(None, config)
    state = interview_agent_graph.get_state(config)

    chat_id = state.values.get("chat_id")
    if chat_id:
        try:
            from app.core.supabase import supabase_admin
            supabase_admin.table("messages").insert({
                "chat_id": chat_id,
                "role": "user",
                "content": req.candidate_answer
            }).execute()

            strengths_str = "\n".join(f"- {s}" for s in state.values.get("strengths", []))
            missing_str = "\n".join(f"- {m}" for m in state.values.get("missing_points", []))
            score_msg = (
                f"###  Tech Lead Evaluation Scorecard: {state.values.get('evaluation_score', 80)} / 100\n\n"
                f"**Key Strengths:**\n{strengths_str}\n\n"
                f"**Missing Points / Edge Cases:**\n{missing_str}\n\n"
                f"**Tech Lead Verdict:**\n> {state.values.get('tech_lead_verdict')}\n\n"
                f"**Follow-Up Challenge:**\n> {state.values.get('follow_up_challenge')}"
            )
            supabase_admin.table("messages").insert({
                "chat_id": chat_id,
                "role": "assistant",
                "content": score_msg
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to persist scorecard in Supabase: {e}")

    return {
        "thread_id": req.thread_id,
        "chat_id": chat_id,
        "state": state.values,
        "status": "completed",
    }
