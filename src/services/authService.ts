import { apiClient } from './api';

export interface UpdateProfilePayload {
  full_name?: string;
  role?: string;
  bio?: string;
  avatar_url?: string;
}

export const authService = {
  getMe: () => apiClient<any>('/auth/me'),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  updatePassword: (newPassword: string) =>
    apiClient<any>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ new_password: newPassword }),
    }),

  terminateAccount: () =>
    apiClient<any>('/auth/account', {
      method: 'DELETE',
    }),

  listMfaFactors: () => apiClient<any>('/auth/mfa/factors'),
  
  enrollMfa: () => apiClient<any>('/auth/mfa/enroll', { 
    method: 'POST' 
  }),
  
  challengeMfa: (factorId: string) => apiClient<any>('/auth/mfa/challenge', {
    method: 'POST',
    body: JSON.stringify({ factor_id: factorId }),
  }),
  
  verifyMfa: (factorId: string, challengeId: string, code: string) => apiClient<any>('/auth/mfa/verify', {
    method: 'POST',
    body: JSON.stringify({ factor_id: factorId, challenge_id: challengeId, code }),
  }),
  
  unenrollMfa: (factorId: string) => apiClient<any>(`/auth/mfa/factors/${factorId}`, {
    method: 'DELETE',
  }),
};
