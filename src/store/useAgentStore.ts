import { useChatStore } from "./useChatStore";
import { create } from 'zustand';
import { 
  agentService, 
  JobAuditState, 
  MockInterviewState 
} from '@/services/agentService';

interface AgentStore {

  agentLoading: boolean;
  agentStatusText: string;
  error: string | null;

  jobAudit: JobAuditState | null;
  userConfirmedSkills: string[];
  userAuditNotes: string;

  mockInterview: MockInterviewState | null;
  candidateAnswerText: string;

  setUserConfirmedSkills: (skills: string[]) => void;
  toggleConfirmedSkill: (skill: string) => void;
  setUserAuditNotes: (notes: string) => void;
  setCandidateAnswerText: (text: string) => void;

  startJobAudit: (jobDescription: string, targetRole?: string, expYears?: number, userId?: string) => Promise<void>;
  approveJobAudit: () => Promise<void>;
  startMockInterview: (topic: string, difficulty?: string, targetRole?: string, userId?: string) => Promise<void>;
  submitMockAnswer: () => Promise<void>;
  resetAgent: () => void;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agentLoading: false,
  agentStatusText: '',
  error: null,

  jobAudit: null,
  userConfirmedSkills: [],
  userAuditNotes: '',

  mockInterview: null,
  candidateAnswerText: '',

  setUserConfirmedSkills: (skills) => set({ userConfirmedSkills: skills }),
  toggleConfirmedSkill: (skill) => {
    const { userConfirmedSkills } = get();
    if (userConfirmedSkills.includes(skill)) {
      set({ userConfirmedSkills: userConfirmedSkills.filter((s) => s !== skill) });
    } else {
      set({ userConfirmedSkills: [...userConfirmedSkills, skill] });
    }
  },
  setUserAuditNotes: (userAuditNotes) => set({ userAuditNotes }),
  setCandidateAnswerText: (candidateAnswerText) => set({ candidateAnswerText }),

  startJobAudit: async (jobDescription, targetRole = 'Software Engineer', expYears = 3, userId) => {
    set({
      agentLoading: true,
      agentStatusText: 'Deconstructing Job Description & checking candidate fit with LangGraph...',
      error: null,
    });

    try {
      const res = await agentService.startJobAudit(jobDescription, targetRole, expYears, userId);
      set({
        jobAudit: res.state,
        userConfirmedSkills: res.state.matched_skills || [],
        agentLoading: false,
        agentStatusText: '',
      });
      if (userId) {
        useChatStore.getState().loadUserChats(userId);
      }
    } catch (err: any) {
      set({
        error: err.message || 'Failed to start Job Audit',
        agentLoading: false,
        agentStatusText: '',
      });
    }
  },

  approveJobAudit: async () => {
    const { jobAudit, userConfirmedSkills, userAuditNotes, agentLoading } = get();
    if (!jobAudit?.thread_id || agentLoading) return;

    set({
      agentLoading: true,
      agentStatusText: 'Resuming LangGraph to synthesize 5 predicted questions & defense plan...',
      error: null,
    });

    try {
      const res = await agentService.approveJobAudit(
        jobAudit.thread_id,
        userConfirmedSkills,
        userAuditNotes
      );
      set({
        jobAudit: res.state,
        agentLoading: false,
        agentStatusText: '',
      });
      const authUser = useChatStore.getState().chats;
      const currentUserId = res.state.user_id;
      if (currentUserId) {
        useChatStore.getState().loadUserChats(currentUserId);
      }
    } catch (err: any) {
      set({
        error: err.message || 'Failed to resume Job Audit',
        agentLoading: false,
        agentStatusText: '',
      });
    }
  },

  startMockInterview: async (topic, difficulty = 'Senior', targetRole = 'Full-Stack / AI Engineer', userId) => {
    set({
      agentLoading: true,
      agentStatusText: 'Principal Tech Lead is architecting scenario and rubric constraints...',
      error: null,
    });

    try {
      const res = await agentService.startMockInterview(topic, difficulty, targetRole, userId);
      set({
        mockInterview: res.state,
        agentLoading: false,
        agentStatusText: '',
      });
      if (userId) {
        useChatStore.getState().loadUserChats(userId);
      }
    } catch (err: any) {
      set({
        error: err.message || 'Failed to start Mock Interview',
        agentLoading: false,
        agentStatusText: '',
      });
    }
  },


  submitMockAnswer: async () => {
    const { mockInterview, candidateAnswerText, agentLoading } = get();
    if (!mockInterview?.thread_id || !candidateAnswerText.trim() || agentLoading) return;

    set({
      agentLoading: true,
      agentStatusText: 'Evaluating solution against Tech Lead rubric & generating scorecard...',
      error: null,
    });

    try {
      const res = await agentService.answerMockInterview(
        mockInterview.thread_id,
        candidateAnswerText.trim()
      );
      set({
        mockInterview: res.state,
        candidateAnswerText: '',
        agentLoading: false,
        agentStatusText: '',
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to evaluate interview answer',
        agentLoading: false,
        agentStatusText: '',
      });
    }
  },

  resetAgent: () => {
    set({
      jobAudit: null,
      mockInterview: null,
      userConfirmedSkills: [],
      userAuditNotes: '',
      candidateAnswerText: '',
      error: null,
      agentStatusText: '',
    });
  },
}));
