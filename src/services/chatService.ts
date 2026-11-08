import { API_BASE_URL, apiClient, getAuthToken } from './api';


export interface WebSource {
    title: string;
    url: string;
    snippet?: string;
}

export interface ChatSession {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface ChatMessage {
    id: string;
    chat_id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: WebSource[];
    created_at: string;
}

export const chatService = {
    getUserChats: async (_userId?: string): Promise<ChatSession[]> => {
        return apiClient<ChatSession[]>('/chat');
    },

    getChatMessages: async (chatId: string): Promise<ChatMessage[]> => {
        return apiClient<ChatMessage[]>(`/chat/${chatId}/messages`);
    },

    deleteChat: async (chatId: string): Promise<{ success: boolean }> => {
        return apiClient<{ success: boolean }>(`/chat/${chatId}`, {
            method: 'DELETE',
        });
    },

    streamChat: async (
        message: string,
        userId: string,
        chatId: string | null,
        onToken: (token: string) => void,
        onInit: (newChatId: string) => void,
        onDone: () => void,
        onError: (err: string) => void,
        onStatus?: (status: string) => void,
        onSources?: (sources: WebSource[]) => void
    ) => {
        try {
            const token = getAuthToken();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            const response = await fetch(`${API_BASE_URL}/chat/stream`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    message,
                    user_id: userId,
                    chat_id: chatId
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || 'Failed to connect to chat stream.');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error('No readable stream available.');

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.replace('data: ', '').trim());
                            if (data.type === 'init') {
                                onInit(data.chat_id);
                            } else if (data.type === 'status') {      
                                onStatus?.(data.text);
                            } else if (data.type === 'sources') {      
                                onSources?.(data.sources);
                            } else if (data.type === 'token') {
                                onToken(data.text);
                            } else if (data.type === 'done') {
                                onDone();
                            } else if (data.type === 'error') {
                                onError(data.error);
                            }
                        } catch {
                        }
                    }
                }
            }
        } catch (err: any) {
            onError(err.message || 'Stream communication failed.');
        }
    }
};
