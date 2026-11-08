'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store';
import { authService } from '@/services/authService';
import {
  User,
  ShieldCheck,
  Sliders,
  PanelLeft,
  X,
  ArrowUpRight,
  ArrowLeft,
  Camera,
  CheckCircle2,
  AlertCircle,
  Lock,
  Trash2,
  Sparkles,
  Layers2,
  MessagesSquare,
  FolderOpen,
  ContactRound,
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Check,
  Save,
  Loader2,
  Info,
  Key,
  LogOut,
} from 'lucide-react';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const {
    activeTab,
    setActiveTab,
    loading,
    setLoading,
    toast,
    showToast,
    profileName,
    setProfileName,
    profileRole,
    setProfileRole,
    profileBio,
    setProfileBio,
    avatarUrl,
    setAvatarUrl,

    mfaEnabled,
    showMfaSetup,
    setShowMfaSetup,
    cancelMfaSetup,
    mfaData,
    verificationCode,
    setVerificationCode,
    enrollMfa,
    verifyMfa,
    disableMfa,
    fetchMfaStatus,
  } = useSettingsStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMfaStatus();

    const loadUserProfile = async () => {
      try {
        const freshUser = await authService.getMe();
        if (freshUser) {
          if (freshUser.full_name) setProfileName(freshUser.full_name);
          if (freshUser.role) setProfileRole(freshUser.role);
          if (freshUser.bio) setProfileBio(freshUser.bio);
          if (freshUser.avatar_url) setAvatarUrl(freshUser.avatar_url);

          if (user) {
            setUser({
              ...user,
              full_name: freshUser.full_name || user.full_name,
              role: freshUser.role || user.role,
              bio: freshUser.bio || user.bio,
              avatar_url: freshUser.avatar_url || user.avatar_url,
            });
          }
        }
      } catch {

        if (user?.full_name) setProfileName(user.full_name);
        if (user?.role) setProfileRole(user.role);
        if (user?.bio) setProfileBio(user.bio);
        if (user?.avatar_url) setAvatarUrl(user.avatar_url);
      }
    };

    loadUserProfile();
  }, [fetchMfaStatus]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      showToast('Profile photo updated (session)', 'success');
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const res = await authService.updateProfile({
        full_name: profileName,
        role: profileRole,
        bio: profileBio,
        avatar_url: avatarUrl || undefined,
      });

      if (user) {
        setUser({
          ...user,
          full_name: profileName,
          role: profileRole,
          bio: profileBio,
          avatar_url: avatarUrl,
        });
      }
      showToast(res.message || 'Profile information saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      showToast('Please enter a new password', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.updatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      showToast(res.message || 'Password updated securely in Supabase!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateAccount = async () => {
    const confirmed = confirm(
      'Are you absolutely sure you want to permanently erase your account data? This will terminate your Supabase login, erase all vector memory, chat transcripts, and generated resumes. This action cannot be undone.'
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      await authService.terminateAccount();
      showToast('Account permanently terminated', 'info');
      logout();
      router.push('/login');
    } catch (err: any) {
      showToast(err.message || 'Failed to terminate account', 'error');
    } finally {
      setLoading(false);
    }
  };

  const displayName = profileName || user?.full_name || (user?.email ? user.email.split('@')[0] : 'Devora User');
  const userInitials =
    displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'DU';

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: <User size={15} /> },
    { id: 'security' as const, label: 'Security & 2FA', icon: <ShieldCheck size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#0b1f24] font-['Manrope',sans-serif] text-[12px] antialiased">
      {/* Skip to main */}
      <a
        href="#settings-main"
        className="fixed -top-[100px] left-5 p-3 bg-white z-50 focus:top-[10px] text-[#0b1f24] font-bold rounded-[8px] shadow-md border border-[#d2e1dc] transition-all"
      >
        Skip to settings
      </a>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter') setSidebarOpen(false);
          }}
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-[#0b1f24]/30 backdrop-blur-[2px] md:hidden border-0 cursor-default"
        />
      )}

      {/* Main Grid Wrapper */}
      <div className="min-h-screen flex flex-col md:grid md:grid-cols-[250px_minmax(0,1fr)] min-[1450px]:grid-cols-[270px_minmax(0,1fr)] max-[1050px]:grid-cols-[220px_minmax(0,1fr)]">
    
        <aside
          id="workspace-sidebar"
          className={`
            fixed md:sticky top-0 inset-y-0 left-0 z-50 md:z-30
            w-[260px] md:w-auto h-screen
            bg-white border-r border-[#e3ebe8]
            pt-[22px] md:pt-[27px] px-[17px] pb-4
            flex flex-col min-w-0
            overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#d2e1dc_transparent]
            transition-transform duration-200 ease-in-out
            ${sidebarOpen
              ? 'translate-x-0 shadow-[15px_0_50px_rgba(11,79,74,0.14)]'
              : '-translate-x-full md:translate-x-0'
            }
          `}
          aria-label="Workspace navigation"
        >
          {/* Brand Row */}
          <div className="flex items-center justify-between mx-[11px] mb-5">
            <Link
              href="/"
              className="flex items-center gap-[9px] text-[24px] md:text-[26px] font-extrabold tracking-[-1px] text-[#0b1f24] no-underline"
            >
              <svg className="w-[26px] h-[30px] shrink-0" width="26" height="30">
                <use href="#logo-mark" />
              </svg>
              <span>
                Devora<i className="brand-dot not-italic text-[#f59e0b] -ml-[2px]">.</i>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden w-8 h-8 rounded-lg grid place-items-center text-[#5b6b70] hover:bg-[#e6f4f0] hover:text-[#0f766e] transition-colors"
              aria-label="Close navigation"
            >
              <X size={18} className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Quick Back to Workspace */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 mx-[11px] mb-4 text-[10.5px] font-semibold text-[#5b6b70] hover:text-[#0f766e] transition-colors no-underline"
          >
            <ArrowLeft size={13} className="w-[13px] h-[13px]" />
            Back to workspace
          </Link>

          {/* Sidebar Nav */}
          <nav className="mt-2">
            <div className="flex justify-between mx-[11px] mb-[10px] text-[#8a989c] text-[8px] tracking-[1.3px] font-bold uppercase">
              WORKSPACE
            </div>

            {[
              { label: 'Overview', icon: <LayoutDashboard size={15} />, href: '/dashboard' },
              { label: 'Documents', icon: <FolderOpen size={15} />, href: '/documents' },
              { label: 'Conversations', icon: <MessagesSquare size={15} />, href: '/chat' },
              { label: 'Resume ATS', icon: <ContactRound size={15} />, href: '/resume' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="relative flex items-center gap-[10px] w-full h-9 my-[3px] px-[11px] rounded-[8px] text-left text-[10.5px] whitespace-nowrap cursor-pointer border-0 transition-colors no-underline text-[#1c3238] hover:bg-[#f3f7f4] hover:text-[#0f766e] font-semibold"
              >
                <span className="text-[#5b6b70]">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <div className="flex justify-between mx-[11px] mt-[24px] mb-[10px] text-[#8a989c] text-[8px] tracking-[1.3px] font-bold uppercase">
              YOUR AI TOOLKIT <span className="text-[#0f766e] tracking-normal font-bold">2</span>
            </div>

            {[
              { name: 'Job Intelligence', icon: <Briefcase size={16} className="w-4 h-4" />, href: '/chat?topic=jobs' },
              { name: 'Career Assistant', icon: <TrendingUp size={16} className="w-4 h-4" />, href: '/chat?topic=career' },
            ].map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                onClick={() => setSidebarOpen(false)}
                className="relative flex items-center gap-[10px] w-full h-9 my-[3px] px-[11px] rounded-[8px] text-left text-[10.5px] whitespace-nowrap cursor-pointer border-0 transition-colors text-[#1c3238] hover:bg-[#f3f7f4] hover:text-[#0f766e] font-semibold no-underline"
              >
                <span className="text-[#5b6b70]">{tool.icon}</span>
                {tool.name}
              </Link>
            ))}

            <div className="flex justify-between mx-[11px] mt-[24px] mb-[10px] text-[#8a989c] text-[8px] tracking-[1.3px] font-bold uppercase">
              SETTINGS
            </div>

            <div className="flex items-center gap-[10px] w-full h-9 px-[11px] rounded-[8px] text-[10.5px] font-bold text-[#0f766e] bg-[#e6f4f0] border border-[#99f6e4]/60">
              <Sliders size={15} className="text-[#0f766e]" />
              <span>Settings</span>
              <span className="ml-auto w-[5px] h-[5px] rounded-full bg-[#0f766e]" />
            </div>
          </nav>

          {/* Sidebar Bottom (User Card & Logout) */}
          <div className="mt-auto pt-5">
            <div className="flex items-center gap-[9px] pt-3 border-t border-[#e3ebe8]">
              <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-tr from-[#0d9488] to-[#0b4f4a] text-white font-bold text-[10px] grid place-items-center shrink-0 shadow-xs">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block text-[10px] font-bold leading-tight text-[#0b1f24] truncate">
                  {displayName}
                </strong>
                <small className="block text-[8.5px] text-[#5b6b70] leading-tight truncate">
                  {user?.email || 'Logged in'}
                </small>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-7 h-7 rounded-lg grid place-items-center text-[#8a989c] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                title="Sign out of Devora"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </aside>

       
        <div className="min-w-0 flex-1 flex flex-col">
          {/* Top Bar Header */}
          <header className="flex items-center justify-between gap-3 h-[64px] sm:h-[69px] px-4 sm:px-6 lg:px-[30px] bg-white/95 backdrop-blur-sm border-b border-[#e3ebe8] sticky top-0 z-20">
            <div className="flex items-center gap-2.5 sm:gap-[14px] text-[11px] whitespace-nowrap min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden w-8 h-8 -ml-1 rounded-lg grid place-items-center text-[#5b6b70] hover:bg-[#e6f4f0] hover:text-[#0f766e] transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <PanelLeft size={18} className="w-[18px] h-[18px]" />
              </button>
              <span className="text-[#5b6b70] font-medium hidden sm:inline">Workspace</span>
              <span className="text-[#8a989c] hidden sm:inline">/</span>
              <strong className="font-bold text-[#0b1f24]">Account Settings</strong>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:flex items-center gap-[6px] px-2.5 py-[5px] border border-[#99f6e4] bg-[#ccfbf1]/50 text-[#0f766e] rounded-[6px] text-[8.5px] font-bold whitespace-nowrap">
                <span className="w-1.5 h-1.5 bg-[#0f766e] rounded-full animate-pulse" />
                Live Configuration
              </span>

              <Link
                className="flex items-center gap-1 sm:gap-[5px] text-[10.5px] text-[#5b6b70] hover:text-[#0f766e] font-bold transition-colors no-underline whitespace-nowrap"
                href="/dashboard"
              >
                <span>Dashboard</span>
                <ArrowUpRight size={13} className="w-[13px] h-[13px]" />
              </Link>
            </div>
          </header>

          {/* Main Content Area */}
          <main id="settings-main" className="max-w-[1180px] w-full mx-auto pt-6 sm:pt-8 px-4 sm:px-6 lg:px-[30px] pb-16 flex-1">
            {/* Header Title Banner */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0f766e]" />
                <h1 className="text-[20px] sm:text-[24px] font-extrabold tracking-[-0.6px] text-[#0b1f24]">
                  Account & Workspace Settings
                </h1>
              </div>
              <p className="text-[11px] sm:text-[11.5px] text-[#5b6b70] max-w-2xl leading-relaxed">
                Configure your personal workspace identity and multi-factor security credentials.
              </p>
            </div>

            {/* Clean Segmented Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-[#d2e1dc] rounded-xl w-fit shadow-[0_2px_8px_rgba(11,79,74,0.03)] mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-[10.5px] sm:text-[11px] font-bold transition-all cursor-pointer ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white shadow-[0_3px_10px_rgba(15,118,110,0.22)]'
                      : 'text-[#5b6b70] hover:text-[#0b1f24] hover:bg-[#f3f7f4]'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-6 sm:gap-7 items-start">
                <div className="space-y-6">
                  {/* Personal Information Card */}
                  <div className="bg-white border border-[#d2e1dc] rounded-2xl p-5 sm:p-7 shadow-[0_2px_12px_rgba(11,79,74,0.04)]">
                    <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#e3ebe8]">
                      <div>
                        <h2 className="text-[13.5px] sm:text-[14px] font-extrabold text-[#0b1f24]">
                          Personal Information
                        </h2>
                        <p className="text-[10px] text-[#5b6b70] mt-0.5">
                          Update your public workspace name and engineering title.
                        </p>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#e6f4f0] text-[#0f766e] border border-[#99f6e4]">
                        Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-[9.5px] uppercase tracking-wider font-extrabold text-[#5b6b70]">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full bg-[#f8faf9] border border-[#d2e1dc] rounded-xl px-3.5 py-2.5 text-[11px] text-[#0b1f24] font-semibold outline-none focus:border-[#14b8a6] focus:ring-2 focus:ring-[#ccfbf1]/50 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[9.5px] uppercase tracking-wider font-extrabold text-[#5b6b70]">
                          Workspace Role
                        </label>
                        <input
                          type="text"
                          value={profileRole}
                          onChange={(e) => setProfileRole(e.target.value)}
                          placeholder="e.g. Senior AI Engineer"
                          className="w-full bg-[#f8faf9] border border-[#d2e1dc] rounded-xl px-3.5 py-2.5 text-[11px] text-[#0b1f24] font-semibold outline-none focus:border-[#14b8a6] focus:ring-2 focus:ring-[#ccfbf1]/50 transition-all"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="block text-[9.5px] uppercase tracking-wider font-extrabold text-[#5b6b70]">
                          Email Address (Primary Login)
                        </label>
                        <input
                          type="email"
                          disabled
                          defaultValue={user?.email || 'user@devora.ai'}
                          className="w-full bg-[#f3f7f4] border border-[#d2e1dc] border-dashed rounded-xl px-3.5 py-2.5 text-[11px] text-[#718287] font-semibold cursor-not-allowed outline-none"
                        />
                        <span className="block text-[8px] text-[#8a989c]">
                          Primary authentication email managed via Supabase OAuth.
                        </span>
                      </div>

                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="block text-[9.5px] uppercase tracking-wider font-extrabold text-[#5b6b70]">
                          Workspace Bio
                        </label>
                        <textarea
                          rows={3}
                          value={profileBio}
                          onChange={(e) => setProfileBio(e.target.value)}
                          placeholder="Brief description of your expertise and goals..."
                          className="w-full bg-[#f8faf9] border border-[#d2e1dc] rounded-xl p-3 text-[11px] text-[#0b1f24] leading-relaxed outline-none focus:border-[#14b8a6] focus:ring-2 focus:ring-[#ccfbf1]/50 transition-all resize-none"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end pt-4 border-t border-[#e3ebe8]">
                      <button
                        type="button"
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white font-bold text-[11px] rounded-xl shadow-[0_3px_12px_rgba(15,118,110,0.25)] hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        Save Changes
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-50/40 border border-red-200/80 rounded-2xl p-5 sm:p-6">
                    <h3 className="text-[13px] font-extrabold text-red-900 mb-1 flex items-center gap-2">
                      <AlertCircle size={15} className="text-red-600" />
                      Danger Zone
                    </h3>
                    <p className="text-[10px] text-red-700/80 leading-relaxed mb-4">
                      Permanently terminate your account and erase all associated vector memory, chat transcripts, and generated LaTeX resumes.
                    </p>
                    <button
                      type="button"
                      onClick={handleTerminateAccount}
                      disabled={loading}
                      className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-100/70 rounded-xl font-bold text-[10px] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Terminate Account'}
                    </button>
                  </div>
                </div>

                {/* Profile Avatar & Metadata Card */}
                <div className="bg-white border border-[#d2e1dc] rounded-2xl p-6 shadow-[0_2px_12px_rgba(11,79,74,0.04)] text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-full border-2 border-[#99f6e4] p-1 bg-[#ccfbf1]/30 mx-auto overflow-hidden shadow-inner">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar preview"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#0d9488] to-[#0b4f4a] text-white font-extrabold text-[22px] grid place-items-center">
                          {userInitials}
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />

                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="absolute bottom-1 right-1 w-7 h-7 bg-[#0f766e] hover:bg-[#0b4f4a] rounded-full grid place-items-center text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="Upload profile photo"
                    >
                      <Camera size={13} />
                    </button>
                  </div>

                  <h3 className="text-[14px] font-extrabold text-[#0b1f24] leading-tight">
                    {displayName}
                  </h3>
                  <span className="inline-block mt-1 text-[9px] font-bold text-[#0f766e] bg-[#ccfbf1]/60 border border-[#99f6e4] px-2.5 py-0.5 rounded-full">
                    {profileRole}
                  </span>

                  <div className="mt-5 pt-4 border-t border-[#e3ebe8] space-y-2.5 text-left">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#8a989c] font-medium uppercase tracking-wider text-[8.5px]">User ID</span>
                      <span className="font-mono text-[9px] text-[#0b1f24] bg-[#f3f7f4] px-1.5 py-0.5 rounded border border-[#d2e1dc]">
                        #{user?.id ? user.id.slice(0, 8) : 'devora-live'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#8a989c] font-medium uppercase tracking-wider text-[8.5px]">Tier</span>
                      <span className="text-[#0f766e] font-bold flex items-center gap-1">
                        <Sparkles size={11} className="text-[#f59e0b]" /> Pro Enterprise
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#8a989c] font-medium uppercase tracking-wider text-[8.5px]">Status</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SECURITY */}
            {activeTab === 'security' && (
              <div className="max-w-2xl space-y-6">

                <div className="bg-white border border-[#d2e1dc] rounded-2xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(11,79,74,0.04)]">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider mb-2.5 border ${mfaEnabled
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${mfaEnabled ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'
                            }`}
                        />
                        {mfaEnabled ? 'Protection Active' : 'Advisory: MFA Recommended'}
                      </div>
                      <h2 className="text-[14.5px] font-extrabold text-[#0b1f24]">
                        Two-Factor Authentication (TOTP)
                      </h2>
                      <p className="text-[10px] text-[#5b6b70] mt-1 max-w-xl leading-relaxed">
                        Add an extra layer of protection to your Devora workspace by requiring an authenticator sync code.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#ccfbf1]/60 text-[#0f766e] border border-[#99f6e4] grid place-items-center shrink-0">
                      <Key size={18} />
                    </div>
                  </div>
                  {showMfaSetup ? (
                    <div className="mt-5 p-5 bg-[#f8faf9] rounded-2xl border border-[#d2e1dc] space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-5 items-center">
                        {/* QR Matrix SVG Preview */}
                        <div className="w-[140px] h-[140px] bg-white border border-[#d2e1dc] rounded-2xl p-2 mx-auto shadow-sm flex flex-col items-center justify-center overflow-hidden">
                          {mfaData?.qrCode?.startsWith('<svg') ? (
                            <div
                              className="w-24 h-24 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                              dangerouslySetInnerHTML={{ __html: mfaData.qrCode }}
                            />
                          ) : mfaData?.qrCode?.startsWith('data:image/') || mfaData?.qrCode?.startsWith('http') ? (
                            <img
                              src={mfaData.qrCode}
                              alt="Devora TOTP QR Code"
                              className="w-24 h-24 object-contain"
                            />
                          ) : mfaData?.uri || mfaData?.secret ? (
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                                mfaData.uri ||
                                  `otpauth://totp/Devora:${user?.email || 'User'}?secret=${mfaData.secret}&issuer=Devora`
                              )}`}
                              alt="Devora TOTP"
                              className="w-24 h-24 object-contain"
                            />
                          ) : (
                            <svg className="w-24 h-24 text-[#0f766e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="3" width="7" height="7" rx="1.5" />
                              <rect x="14" y="3" width="7" height="7" rx="1.5" />
                              <rect x="14" y="14" width="7" height="7" rx="1.5" />
                              <rect x="3" y="14" width="7" height="7" rx="1.5" />
                              <circle cx="6.5" cy="6.5" r="1.5" fill="currentColor" />
                              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                              <circle cx="6.5" cy="17.5" r="1.5" fill="currentColor" />
                              <line x1="14" y1="17" x2="21" y2="17" />
                              <line x1="17" y1="14" x2="17" y2="21" />
                            </svg>
                          )}
                          <span className="text-[7.5px] font-bold text-[#8a989c] mt-1">DEVORA-AUTH-MATRIX</span>
                        </div>
                        <div className="space-y-2.5">
                          <h3 className="text-[12.5px] font-extrabold text-[#0b1f24]">
                            Scan QR CODE with Authenticator App
                          </h3>
                          <p className="text-[9.5px] text-[#5b6b70] leading-relaxed">
                            Open Google Authenticator, Authy, or 1Password, scan this QR code, and enter your 6-digit sync code below.
                          </p>
                          <div className="p-2.5 bg-white rounded-xl border border-[#d2e1dc]">
                            <span className="block text-[7.5px] font-extrabold uppercase text-[#8a989c] tracking-wider mb-0.5">
                              Manual Backup Key
                            </span>
                            <code className="text-[10.5px] font-bold font-mono text-[#0f766e]">
                              {mfaData?.secret || 'DVR7-MFA9-KJ22-X90P'}
                            </code>
                          </div>
                        </div>
                      </div>
                      {/* 6-Digit Code Input & Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="flex-1 bg-white border border-[#d2e1dc] rounded-xl px-4 py-2.5 text-center font-mono text-[16px] tracking-[0.3em] font-bold text-[#0f766e] outline-none focus:border-[#14b8a6] focus:ring-2 focus:ring-[#ccfbf1]"
                        />
                        <button
                          type="button"
                          onClick={() => verifyMfa(verificationCode)}
                          disabled={verificationCode.length !== 6 || loading}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white font-bold text-[11px] rounded-xl shadow-[0_3px_12px_rgba(15,118,110,0.25)] hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {loading ? 'Verifying...' : 'Authorize'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelMfaSetup}
                          className="px-4 py-2.5 border border-[#d2e1dc] text-[#5b6b70] hover:text-[#0b1f24] rounded-xl text-[10.5px] font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-4">
                      {mfaEnabled ? (
                        <button
                          type="button"
                          onClick={disableMfa}
                          className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-xl font-bold text-[10.5px] transition-colors cursor-pointer"
                        >
                          Disable 2FA Protection
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={enrollMfa}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white font-bold text-[11px] rounded-xl shadow-[0_3px_12px_rgba(15,118,110,0.25)] hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                        >
                          Configure MFA Matrix
                        </button>
                      )}
                      <span className="text-[9.5px] text-[#8a989c] font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-[#0f766e]" /> TOTP Standard v2.1
                      </span>
                    </div>
                  )}
                </div>

                {/* Password Reset Card */}
                <div className="bg-white border border-[#d2e1dc] rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(11,79,74,0.04)]">
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#e3ebe8]">
                    <div>
                      <h3 className="text-[14px] font-extrabold text-[#0b1f24]">
                        Access Credentials & Password
                      </h3>
                      <p className="text-[10px] text-[#5b6b70] mt-0.5">
                        Update your master workspace password with minimum 6 characters.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#ccfbf1] text-[#0f766e] grid place-items-center shrink-0 border border-[#99f6e4]">
                      <Lock size={15} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[9.5px] uppercase tracking-wider font-extrabold text-[#5b6b70]">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#f8faf9] border border-[#d2e1dc] rounded-xl px-3.5 py-2.5 text-[11px] text-[#0b1f24] font-semibold outline-none focus:border-[#14b8a6] focus:ring-2 focus:ring-[#ccfbf1]/50 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[9.5px] uppercase tracking-wider font-extrabold text-[#5b6b70]">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full bg-[#f8faf9] border rounded-xl px-3.5 py-2.5 text-[11px] text-[#0b1f24] font-semibold outline-none focus:ring-2 focus:ring-[#ccfbf1]/50 transition-all ${confirmPassword && newPassword !== confirmPassword
                              ? 'border-red-400 focus:border-red-400'
                              : 'border-[#d2e1dc] focus:border-[#14b8a6]'
                            }`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={handleUpdatePassword}
                        disabled={loading || !newPassword}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white font-bold text-[11px] rounded-xl shadow-[0_3px_12px_rgba(15,118,110,0.25)] hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {loading ? 'Securing...' : 'Reset Password'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Session Sign Out Card */}
                <div className="bg-white border border-red-200/80 rounded-2xl p-6 shadow-[0_2px_12px_rgba(239,68,68,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[13.5px] font-extrabold text-[#0b1f24]">
                      Terminate Workspace Session
                    </h3>
                    <p className="text-[10px] text-[#5b6b70] mt-0.5">
                      Sign out of your active Devora account session on this device.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <LogOut size={13} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Toast Notification Element */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-[0_12px_32px_rgba(11,79,74,0.18)] border text-[11px] font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 ${toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : toast.type === 'info'
                ? 'bg-sky-50 border-sky-200 text-sky-900'
                : 'bg-[#ccfbf1] border-[#99f6e4] text-[#0b4f4a]'
            }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={15} className="text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 size={15} className="text-[#0f766e] shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

