import { create } from 'zustand'

interface DashboardStore {
    activeTab: string,
    setActiveTab: (tab: string) => void;

    promptText: string;
    setPromptText: (text: string) => void;

    activeNavItem: string;
    setActiveNavItem: (item: string) => void;

    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
    activeTab: 'all',
    setActiveTab: (tab) => set({ activeTab: tab }),
    promptText: '',
    setPromptText: (text) => set({ promptText: text }),
    activeNavItem: 'Overview',
    setActiveNavItem: (item) => set({ activeNavItem: item }),
    sidebarOpen: false,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))