from typing import List, Optional
from pydantic import BaseModel


class BulletRewrite(BaseModel):
    before: str
    after: str
    explanation: str


class ResumeCategoryScores(BaseModel):
    skills_match: int       
    experience_depth: int   
    impact_score: int       
    readability: int       


class ResumeAnalysisResponse(BaseModel):
    match_score: int                    
    job_title_detected: str              
    summary: str                         
    category_scores: ResumeCategoryScores
    matched_skills: List[str]            
    missing_skills: List[str]            
    strengths: List[str]                 
    weaknesses: List[str]                
    tailoring_tips: List[str]            
    bullet_rewrites: List[BulletRewrite] 



class ContactItem(BaseModel):
    text: str
    url: Optional[str] = None


class ExperienceItem(BaseModel):
    title: str
    date: str
    sub: str
    bullets: List[str]


class SkillCategory(BaseModel):
    category: str
    skills: str


class ProjectItem(BaseModel):
    name: str
    link: Optional[str] = None
    stack: str
    bullets: List[str]


class EducationItem(BaseModel):
    degree: str
    status: str
    school: str


class ResumeBuilderData(BaseModel):
    name: str
    contact: List[ContactItem]
    summary: str
    experience: List[ExperienceItem]
    skills: List[SkillCategory]
    projects: List[ProjectItem]
    education: List[EducationItem]


class GenerateLatexResponse(BaseModel):
    tex_content: str
    filename: str = "resume.tex"
