import { create } from 'zustand';
import { chatService, ChatSession, ChatMessage, WebSource } from '@/services/chatService';

interface ChatStore {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  copied: boolean;
  setCopied: (copied: boolean) => void;


  chats: ChatSession[];
  currentChatId: string | null;
  messages: ChatMessage[];
  isLoadingChats: boolean;
  isLoadingMessages: boolean;


  inputPrompt: string;
  setInputPrompt: (val: string) => void;
  isStreaming: boolean;
  streamingText: string;
  error: string | null;
  searchStatus: string | null;
  activeSources: WebSource[];
  
  loadUserChats: (userId: string) => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  newChat: () => void;
  deleteChat: (chatId: string, userId: string) => Promise<void>;
  sendMessage: (userId: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  copied: false,
  setCopied: (copied) => set({ copied }),

  chats: [],
  currentChatId: null,
  messages: [],
  isLoadingChats: false,
  isLoadingMessages: false,

  inputPrompt: '',
  setInputPrompt: (inputPrompt) => set({ inputPrompt }),
  isStreaming: false,
  streamingText: '',
  error: null,
  searchStatus: null,    
  activeSources: [],    
  loadUserChats: async (userId: string) => {

    if (!userId) return;
    
    set({ isLoadingChats: true, error: null });

    try {
      
      const chats = await chatService.getUserChats(userId);
      set({ chats, isLoadingChats: false });

    } catch (err: any) {
      set({ error: err.message, isLoadingChats: false });
    }
  },

  selectChat: async (chatId: string) => {

    set({ currentChatId: chatId, isLoadingMessages: true, error: null, streamingText: '' });

    try {

      const messages = await chatService.getChatMessages(chatId);
      set({ messages, isLoadingMessages: false });

    } catch (err: any) {
      set({ error: err.message, isLoadingMessages: false });
    }
  },

  newChat: () => {
    set({
      currentChatId: null,
      messages: [],
      streamingText: '',
      inputPrompt: '',
      searchStatus: null,    
      activeSources: [],     
      error: null,
    });
  },

  deleteChat: async (chatId: string, userId: string) => {

    try {
      await chatService.deleteChat(chatId);
      
      if (get().currentChatId === chatId) {
        get().newChat();
      }

      await get().loadUserChats(userId);
    
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  sendMessage: async (userId: string) => {
   
    const { inputPrompt, currentChatId, isStreaming, messages } = get();
    const trimmed = inputPrompt.trim();
   
    if (!trimmed || isStreaming || !userId) return;

    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      chat_id: currentChatId || '',
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
    };

    set({
      messages: [...messages, tempMsg],
      inputPrompt: '',
      isStreaming: true,
      streamingText: '',
      searchStatus: null,     
      activeSources: [],      
      error: null,
    });

    let activeChatId = currentChatId;
    let accumulatedText = '';

    await chatService.streamChat(
      trimmed,
      userId,
      activeChatId,

      (token: string) => {
        accumulatedText += token;
        set({ streamingText: accumulatedText });
      },

      (newChatId: string) => {
        activeChatId = newChatId;
        set({ currentChatId: newChatId });
      },

      () => {
        const assistantMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          chat_id: activeChatId || '',
          role: 'assistant',
          sources: get().activeSources, 
          content: accumulatedText,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, assistantMsg],
          streamingText: '',
          isStreaming: false,
          searchStatus: null,
          activeSources: [],
        }));

        get().loadUserChats(userId);
      },
       (err: string) => {
        set({ error: err, isStreaming: false, searchStatus: null });
      },
      (statusText: string) => {                
        set({ searchStatus: statusText });
      },
      (sources: WebSource[]) => {              
        set({ activeSources: sources, searchStatus: null });
      }
    );
  },
}));
