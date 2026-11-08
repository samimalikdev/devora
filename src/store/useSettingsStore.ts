import { authService } from '@/services/authService';
import { Quote } from 'lucide-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SystemSettings {
  hapticFeedback: boolean;
  telemetry: boolean;
  etherealGlows: boolean;
  autoSaveDrafts: boolean;
}

export interface ToastInfo {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface MfaData {
    factorId: string;
    challengeId?: string;
    qrCode: string;
    uri?: string;
    secret: string;
}

interface SettingsStore {

  activeTab: 'profile' | 'security';
  setActiveTab: (tab: 'profile' | 'security') => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;

  toast: ToastInfo | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;


  profileName: string;
  setProfileName: (name: string) => void;
  profileRole: string;
  setProfileRole: (role: string) => void;
  profileBio: string;
  setProfileBio: (bio: string) => void;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;

  systemSettings: SystemSettings;
  updateSetting: (key: keyof SystemSettings, value?: boolean) => void;

  resetForms: () => void;

  mfaEnabled: boolean;
  showMfaSetup: boolean;
  setShowMfaSetup: (show: boolean) => void;
  mfaData: MfaData | null;
  verificationCode: string;
  setVerificationCode: (code: string) => void;

  enrollMfa: () => Promise<void>;
  cancelMfaSetup: () => Promise<void>;
  verifyMfa: (code: string) => Promise<boolean>;
  disableMfa: () => Promise<void>;
  fetchMfaStatus: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      activeTab: 'profile',
      setActiveTab: (activeTab) => set({ activeTab }),

      loading: false,
      setLoading: (loading) => set({ loading }),

      toast: null,
      showToast: (message, type = 'success') => {
        set({ toast: { message, type } });
        setTimeout(() => {
          set({ toast: null });
        }, 3500);
      },

      profileName: '',
      setProfileName: (profileName) => set({ profileName }),
      profileRole: 'Full-Stack Engineer',
      setProfileRole: (profileRole) => set({ profileRole }),
      profileBio: 'Specializing in AI architectures, Next.js, and scalable cloud systems.',
      setProfileBio: (profileBio) => set({ profileBio }),
      avatarUrl: null,
      setAvatarUrl: (avatarUrl) => set({ avatarUrl }),

      systemSettings: {
        hapticFeedback: true,
        telemetry: true,
        etherealGlows: true,
        autoSaveDrafts: true,
      },

      updateSetting: (key, explicitValue) => {
        const current = get().systemSettings;
        const newValue = explicitValue !== undefined ? explicitValue : !current[key];
        set({
          systemSettings: {
            ...current,
            [key]: newValue,
          },
        });
        get().showToast(
          `${key === 'hapticFeedback' ? 'Haptic Feedback' : key === 'telemetry' ? 'Telemetry' : 'Visual Glows'} ${newValue ? 'enabled' : 'disabled'}`,
          'info'
        );
      },

      resetForms: () => {
        set({
          profileName: '',
          profileRole: 'Full-Stack Engineer',
          profileBio: '',
        });
      },

      mfaEnabled: false,
      showMfaSetup: false,
      setShowMfaSetup: (showMfaSetup) => set({ showMfaSetup }),
      cancelMfaSetup: async () => {
        const { mfaData } = get();
        if (mfaData?.factorId) {
          try {
            await authService.unenrollMfa(mfaData.factorId);
          } catch (e) {
          }
        }
        set({ showMfaSetup: false, mfaData: null, verificationCode: '' });
      },
      mfaData: null,
      verificationCode: '',
      setVerificationCode: (verificationCode) => set({ verificationCode }),

      enrollMfa: async () => {
        set({ loading: true });
        try {
          const enrollData = await authService.enrollMfa();
          const challengeData = await authService.challengeMfa(enrollData.id);
          set({
            loading: false,
            mfaData: {
              factorId: enrollData.id,
              challengeId: challengeData.id,
              qrCode: enrollData.totp?.qr_code || '',
              uri: enrollData.totp?.uri || '',
              secret: enrollData.totp?.secret || '',
            },
            showMfaSetup: true,
          });
          get().showToast('QR Code generated. Scan with Authenticator app.', 'info');
        } catch (err: any) {
          set({ loading: false });
          get().showToast(err.message || 'MFA enrollment failed', 'error');
        }
      },

      verifyMfa: async (code: string) => {
        if (code.length !== 6) {
          get().showToast('Please enter full 6-digit code', 'error');
          return false;
        }
        const { mfaData } = get();
        if (!mfaData || !mfaData.challengeId) {
          get().showToast('MFA session expired. Please retry.', 'error');
          return false;
        }
        set({ loading: true });
        try {
          await authService.verifyMfa(mfaData.factorId, mfaData.challengeId, code);
          set({
            loading: false,
            mfaEnabled: true,
            showMfaSetup: false,
            verificationCode: '',
          });
          get().showToast('Two-Factor Authentication activated successfully!', 'success');
          return true;
        } catch (err: any) {
          set({ loading: false });
          get().showToast(err.message || 'Invalid verification code', 'error');
          return false;
        }
      },
      disableMfa: async () => {
        set({ loading: true });
        try {
          let factorId = get().mfaData?.factorId;
          if (!factorId) {
            const data = await authService.listMfaFactors();
            const allFactors = [
              ...(data?.totp || []),
              ...(data?.all || []),
              ...(Array.isArray(data) ? data : []),
            ];
            const target = allFactors.find((f: any) => f?.id);
            if (target?.id) factorId = target.id;
          }
          if (factorId) {
            await authService.unenrollMfa(factorId);
          }
          set({
            loading: false,
            mfaEnabled: false,
            showMfaSetup: false,
            mfaData: null,
            verificationCode: '',
          });
                    get().showToast('2FA protection has been disabled', 'info');
        } catch (err: any) {
          set({ loading: false });
          get().showToast(err.message || 'Failed to disable 2FA', 'error');
        }
      },

            fetchMfaStatus: async () => {
        try {
          const data = await authService.listMfaFactors();
          const allFactors = data?.totp || data?.all || (Array.isArray(data) ? data : []);
          const verifiedFactor = Array.isArray(allFactors)
            ? allFactors.find((f: any) => f.status === 'verified')
            : null;

          if (verifiedFactor) {
            set({
              mfaEnabled: true,
              mfaData: { factorId: verifiedFactor.id, qrCode: '', secret: '' },
            });
          } else {
            set({ mfaEnabled: false });
          }
        } catch (err) {
          set({ mfaEnabled: false });
        }
      },

    }),

    {
      name: 'devora-settings-storage',
      partialize: (state) => ({
        systemSettings: state.systemSettings,
        profileRole: state.profileRole,
        profileBio: state.profileBio,
      }),
    }
    
  )
);