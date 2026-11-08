import { create } from 'zustand';
import { 
  resumeService, 
  ResumeAnalysisResponse, 
  ResumeBuilderData 
} from '@/services/resumeService';

export type ResumeTab = 'overview' | 'rewrites' | 'skills' | 'builder';

interface ResumeStore {
  file: File | null;
  fileName: string | null;
  jobDescription: string;
  isAnalyzing: boolean;
  analysis: ResumeAnalysisResponse | null;
  error: string | null;
  activeTab: ResumeTab;

  builderData: ResumeBuilderData | null;
  isBuildingData: boolean;
  isDownloadingPdf: boolean;

  setFile: (file: File | null) => void;
  setJobDescription: (jd: string) => void;
  setActiveTab: (tab: ResumeTab) => void;
  setBuilderData: (data: ResumeBuilderData | null) => void;
  analyzeResume: (userId?: string) => Promise<void>;
  buildResumeData: () => Promise<void>;
  downloadPdf: () => Promise<void>;
  downloadTex: () => Promise<void>;
  reset: () => void;
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  file: null,
  fileName: null,
  jobDescription: '',
  isAnalyzing: false,
  analysis: null,
  error: null,
  activeTab: 'overview',

  builderData: null,
  isBuildingData: false,
  isDownloadingPdf: false,

  setFile: (file) => set({ file, fileName: file ? file.name : null, error: null }),
  setJobDescription: (jobDescription) => set({ jobDescription }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setBuilderData: (builderData) => set({ builderData }),

  analyzeResume: async (userId?: string) => {

    const { file, jobDescription, isAnalyzing } = get();
    if (!file || !jobDescription.trim() || isAnalyzing) return;
    set({ isAnalyzing: true, error: null });

    try {
      const result = await resumeService.analyzeResume(file, jobDescription, userId);
      set({ analysis: result, isAnalyzing: false });

    } catch (err: any) {
      set({ error: err.message || 'Failed to analyze resume', isAnalyzing: false });

    }
  },

  buildResumeData: async () => {

    const { file, jobDescription, isBuildingData } = get();
    if (!file || !jobDescription.trim() || isBuildingData) return;

    set({ isBuildingData: true, error: null });

    try {

      const data = await resumeService.buildResumeData(file, jobDescription);
      set({ builderData: data, isBuildingData: false, activeTab: 'builder' });

    } catch (err: any) {

      set({ error: err.message || 'Failed to generate tailored resume data', isBuildingData: false });
  
    }
  },

  downloadPdf: async () => {

    const { builderData, isDownloadingPdf } = get();
    if (!builderData || isDownloadingPdf) return;

    set({ isDownloadingPdf: true, error: null });

    try {

      const blob = await resumeService.downloadPdf(builderData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      const cleanName = builderData.name.trim().replace(/\s+/g, '_');
      a.download = `${cleanName || 'Resume'}_Harvard_ATS.pdf`;
      document.body.appendChild(a);

      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      set({ isDownloadingPdf: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to download PDF', isDownloadingPdf: false });
    }
  },

  downloadTex: async () => {
    const { builderData } = get();
    if (!builderData) return;
    try {
      const blob = await resumeService.downloadTex(builderData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume.tex`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      set({ error: err.message || 'Failed to download .tex file' });
    }
  },

  reset: () =>
    set({
      file: null,
      fileName: null,
      jobDescription: '',
      isAnalyzing: false,
      analysis: null,
      builderData: null,
      isBuildingData: false,
      isDownloadingPdf: false,
      error: null,
      activeTab: 'overview',
    }),
}));
