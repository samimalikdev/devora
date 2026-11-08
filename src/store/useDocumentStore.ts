import { create } from 'zustand'


export interface DocumentItem {
    id: string;
    title: string;
    file_path: string;
    file_size: number;
    total_pages: number;
    created_at?: string;
}

export interface DocumentPageItem {
    page_number: number;
    content: string;
}

export interface DocumentChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string,
    sources?: Array<{
        document_id: string;
        page_number: number;
        score?: number;
        snippet: string;
    }>;
    created_at?: string;
}

interface DocumentState {
    visiblePage: number;
    setVisiblePage: (page: number) => void;

    activeCitation: string | null;
    setActiveCitation: (citation: string | null) => void;

    currentDocument: DocumentItem | null;
    setCurrentDocument: (doc: DocumentItem | null) => void;

    pages: DocumentPageItem[];
    setPages: (pages: DocumentPageItem[]) => void;

    isUploading: boolean;
    setIsUploading: (uploading: boolean) => void;

    uploadError: string | null;
    setUploadError: (error: string | null) => void;

    messages: DocumentChatMessage[];
    setMessages: (messages: DocumentChatMessage[]) => void;
    addMessage: (msg: DocumentChatMessage) => void;
    isSearching: boolean;
    setIsSearching: (searching: boolean) => void;
    clearMessages: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
    visiblePage: 1,
    setVisiblePage: (page) => set({ visiblePage: page }),

    activeCitation: null,
    setActiveCitation: (citation) => set({ activeCitation: citation }),

    currentDocument: null,
    setCurrentDocument: (doc) => set({ currentDocument: doc }),

    pages: [],
    setPages: (pages) => set({ pages }),
    isUploading: false,

    setIsUploading: (uploading) => set({ isUploading: uploading }),

    uploadError: null,
    setUploadError: (error) => set({ uploadError: error }),

    messages: [],
    setMessages: (messages) => set({ messages }),
    
    addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
    
    isSearching: false,
    setIsSearching: (searching) => set({ isSearching: searching }),
   
    clearMessages: () => set({ messages: [] }),

}));
