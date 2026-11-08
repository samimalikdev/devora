import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  role?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}


interface AuthStore {

  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  setUser: (user: UserProfile | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;


  loginEmail: string;
  setLoginEmail: (email: string) => void;
  loginPassword: string;
  setLoginPassword: (password: string) => void;
  loginShowPassword: boolean;
  setLoginShowPassword: (show: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;


  signupFullName: string;
  setSignupFullName: (name: string) => void;
  signupEmail: string;
  setSignupEmail: (email: string) => void;
  signupPassword: string;
  setSignupPassword: (password: string) => void;
  signupShowPassword: boolean;
  setSignupShowPassword: (show: boolean) => void;
  acceptTerms: boolean;
  setAcceptTerms: (accept: boolean) => void;

  resetLoginForm: () => void;
  resetSignupForm: () => void;
}


export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      logout: () => {
        if (typeof document !== 'undefined') {
          const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
          document.cookie = `devora_token=; path=/; max-age=0; SameSite=Lax${isSecure ? '; Secure' : ''}`;
        }
        set({ user: null, token: null });
      },

      loginEmail: '',
      setLoginEmail: (email) => set({ loginEmail: email }),
      loginPassword: '',
      setLoginPassword: (password) => set({ loginPassword: password }),
      loginShowPassword: false,
      setLoginShowPassword: (show) => set({ loginShowPassword: show }),
      rememberMe: false,
      setRememberMe: (remember) => set({ rememberMe: remember }),

      signupFullName: '',
      setSignupFullName: (name) => set({ signupFullName: name }),
      signupEmail: '',
      setSignupEmail: (email) => set({ signupEmail: email }),
      signupPassword: '',
      setSignupPassword: (password) => set({ signupPassword: password }),
      signupShowPassword: false,
      setSignupShowPassword: (show) => set({ signupShowPassword: show }),
      acceptTerms: false,
      setAcceptTerms: (accept) => set({ acceptTerms: accept }),

      resetLoginForm: () =>
        set({
          loginEmail: '',
          loginPassword: '',
          loginShowPassword: false,
          rememberMe: false,
        }),
      resetSignupForm: () =>
        set({
          signupFullName: '',
          signupEmail: '',
          signupPassword: '',
          signupShowPassword: false,
          acceptTerms: false,
        }),
    }),
    {
      name: 'devora-auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
