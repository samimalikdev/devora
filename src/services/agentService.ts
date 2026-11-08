import { apiClient } from './api';

export interface JobAuditState {
  thread_id?: string;
  chat_id?: string;
  user_id?: string;
  job_description?: string;
  target_role?: string;
  experience_years?: number;
  must_haves?: string[];
  nice_to_haves?: string[];
  architecture_patterns?: string[];
  red_flags?: string[];
  matched_skills?: string[];
  missing_critical_gaps?: string[];
  match_score?: number;
  user_confirmed_skills?: string[];
  user_notes?: string;
  predicted_interview_questions?: Array<{
    question: string;
    focus_area: string;
    model_talking_points: string;
  }>;
  gap_defense_talking_points?: string[];
  reverse_interview_questions?: string[];
  status?: string;
}

export interface JobAuditResponse {
  status: string;
  message: string;
  thread_id: string;
  state: JobAuditState;
  next_step?: string[];
}

export interface MockInterviewState {
  thread_id?: string;
  chat_id?: string;
  user_id?: string;
  topic?: string;
  difficulty?: string;
  target_role?: string;
  scenario_prompt?: string;
  rubric_criteria?: string[];
  candidate_answer?: string;
  evaluation_score?: number;
  strengths?: string[];
  missing_points?: string[];
  tech_lead_verdict?: string;
  follow_up_challenge?: string;
  status?: string;
}

export interface MockInterviewResponse {
  status: string;
  message: string;
  thread_id: string;
  state: MockInterviewState;
  next_step?: string[];
}

export const agentService = {

    startJobAudit: async (
    jobDescription: string,
    targetRole = 'Software Engineer',
    expYears = 3,
    userId?: string
  ): Promise<JobAuditResponse> => {

    return apiClient<JobAuditResponse>('/agent/job-audit', {
      method: 'POST',
      body: JSON.stringify({
        job_description: jobDescription,
        target_role: targetRole,
        experience_years: expYears,
        user_id: userId,
      }),
    });
  },


  approveJobAudit: async (
    threadId: string,
    confirmedSkills: string[],
    notes?: string
  ): Promise<JobAuditResponse> => {

    return apiClient<JobAuditResponse>('/agent/job-audit/approve', {
      method: 'POST',
      body: JSON.stringify({
        thread_id: threadId,
        user_confirmed_skills: confirmedSkills,
        user_notes: notes,
      }),
    });
  },

  startMockInterview: async (
    topic: string,
    difficulty = 'Senior',
    targetRole = 'Full-Stack / AI Engineer',
    userId?: string
  ): Promise<MockInterviewResponse> => {

    return apiClient<MockInterviewResponse>('/agent/mock-interview/start', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        difficulty,
        target_role: targetRole,
        user_id: userId,
      }),
    });
  },

answerMockInterview: async (
    threadId: string,
    candidateAnswer: string
  ): Promise<MockInterviewResponse> => {
    
    return apiClient<MockInterviewResponse>('/agent/mock-interview/answer', {
      method: 'POST',
      body: JSON.stringify({
        thread_id: threadId,
        candidate_answer: candidateAnswer,
      }),
    });
  },

}