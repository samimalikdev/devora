import { API_BASE_URL, apiClient, getAuthToken } from './api';

export const documentService = {
  uploadPDF: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Upload failed');
    return data;
  },

  searchDocument: async (documentId: string, query: string, topK: number = 3, signal?: AbortSignal) => {
    return apiClient<any>('/search?ask=true', {
      method: 'POST',
      body: JSON.stringify({
        document_id: documentId,
        query,
        top_k: topK,
      }),
      signal,
    });
  },

  getDocuments: async () => {
    return apiClient<any[]>('/documents');
  },

  getDocumentById: async (documentId: string) => {
    return apiClient<any>(`/documents/${documentId}`);
  },
};
