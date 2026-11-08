export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)devora_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
      const url = `${API_BASE_URL}${endpoint}`;
      const token = getAuthToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...((options.headers as Record<string, string>) || {})
      };

      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'API request failed');
      }

      return data as T;
}
