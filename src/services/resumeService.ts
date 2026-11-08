import { API_BASE_URL, apiClient, getAuthToken } from './api';

export interface BulletRewrite {
    before: string;
    after: string;
    explanation: string;
}

export interface ResumeCategoryScores {
    skills_match: number;
    experience_depth: number;
    impact_score: number;
    readability: number;
}

export interface ResumeAnalysisResponse {
    match_score: number;
    job_title_detected: string;
    summary: string;
    category_scores: ResumeCategoryScores;
    matched_skills: string[];
    missing_skills: string[];
    strengths: string[];
    weaknesses: string[];
    tailoring_tips: string[];
    bullet_rewrites: BulletRewrite[];
}

export interface ContactItem {
    text: string;
    url?: string | null;
}

export interface ExperienceItem {
    title: string;
    date: string;
    sub: string;
    bullets: string[];
}

export interface SkillCategory {
    category: string;
    skills: string;
}

export interface ProjectItem {
    name: string;
    link?: string | null;
    stack: string;
    bullets: string[];
}

export interface EducationItem {
    degree: string;
    status: string;
    school: string;
}

export interface ResumeBuilderData {
    name: string;
    contact: ContactItem[];
    summary: string;
    experience: ExperienceItem[];
    skills: SkillCategory[];
    projects: ProjectItem[];
    education: EducationItem[];
}

export const resumeService = {

    analyzeResume: async (
        file: File,
        jobDescription: string,
        userId?: string
    ): Promise<ResumeAnalysisResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('job_description', jobDescription.trim());
        if (userId) formData.append('user_id', userId);

        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE_URL}/resume/analyze`, {
            method: 'POST',
            headers,
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to analyze resume.');
        return data as ResumeAnalysisResponse;
    },

    buildResumeData: async (
        file: File,
        jobDescription: string
    ): Promise<ResumeBuilderData> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('job_description', jobDescription.trim());

        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE_URL}/resume/build-data`, {
            method: 'POST',
            headers,
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to build tailored resume data.');
        return data as ResumeBuilderData;
    },

    generateLatex: async (payload: ResumeBuilderData): Promise<{ tex_content: string; filename: string }> => {
        return apiClient<{ tex_content: string; filename: string }>('/resume/generate-latex', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    downloadPdf: async (payload: ResumeBuilderData): Promise<Blob> => {
        const token = getAuthToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE_URL}/resume/generate-pdf`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: 'Failed to download PDF.' }));
            throw new Error(err.detail || 'Failed to download PDF.');
        }
        return await res.blob();
    },

    downloadTex: async (payload: ResumeBuilderData): Promise<Blob> => {
        const token = getAuthToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE_URL}/resume/download-tex`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error('Failed to download .tex file.');
        }
        return await res.blob();
    },
};
