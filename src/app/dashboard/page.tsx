'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  MessagesSquare,
  Clock3,
  FileText,
  ContactRound,
  Briefcase,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Settings2,
  HelpCircle,
  ChevronsUpDown,
  Bell,
  Sparkles,
  Plus,
  Layers2,
  ArrowUp,
  FileSearch,
  Ellipsis,
  FolderHeart,
  PanelLeft,
  X,
  UploadCloud,
  LogOut,
} from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useAuthStore } from '@/store/useAuthStore';
import { documentService } from '@/services/documentService';
import { chatService } from '@/services/chatService';


const TOOLKIT_ITEMS = [
  {
    num: '01',
    name: 'Job Intelligence',
    line1: 'The right role.',
    line2: 'The next right step.',
    action: 'Explore possibilities',
    icon: <Briefcase size={18} className="w-[18px] h-[18px]" />,
    href: '/chat?topic=jobs',
  },
  {
    num: '02',
    name: 'Career Assistant',
    line1: 'A clearer path.',
    line2: 'A brighter tomorrow.',
    action: 'Move forward',
    icon: <TrendingUp size={18} className="w-[18px] h-[18px]" />,
    href: '/chat?topic=career',
  },
];

const SUGGESTIONS = [
  'Summarize a document',
  'Improve my resume with Harvard ATS',
  'Prepare for a full-stack interview',
];

const WEEK_BARS = [
  { day: 'M', height: '42%' },
  { day: 'T', height: '65%' },
  { day: 'W', height: '88%', highlight: true },
  { day: 'T', height: '52%' },
  { day: 'F', height: '70%' },
  { day: 'S', height: '28%' },
  { day: 'S', height: '15%', future: true },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const {
    activeTab,
    setActiveTab,
    promptText,
    setPromptText,
    activeNavItem,
    setActiveNavItem,
    sidebarOpen,
    setSidebarOpen,
  } = useDashboardStore();

  const [documents, setDocuments] = useState<any[]>([]);
  const [chatCount, setChatCount] = useState<number>(0);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(true);

  const userInitials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user?.email
      ? user.email.slice(0, 2).toUpperCase()
      : 'DV';

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Friend';

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user?.id) {
        setLoadingDocs(false);
        return;
      }
      try {
        const [docsData, chatsData] = await Promise.all([
          documentService.getDocuments().catch(() => []),
          chatService.getUserChats().catch(() => []),
        ]);

        setDocuments(Array.isArray(docsData) ? docsData : [])
        setChatCount(Array.isArray(chatsData) ? chatsData.length : 0);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoadingDocs(false);
      }
    }

    fetchDashboardData();
  }, [user?.id]);

  const handleSendPrompt = () => {
    if (!promptText.trim()) return;
    const query = encodeURIComponent(promptText.trim());
    setPromptText('');
    router.push(`/chat?prompt=${query}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#0b1f24] font-['Manrope',sans-serif] text-[12px] antialiased">
      {/* Skip to dashboard link */}
      <a
        href="#dashboard-main"
        className="fixed -top-[100px] left-5 p-3 bg-white z-50 focus:top-[10px] text-[#0b1f24] font-bold rounded-[8px] shadow-md border border-[#d2e1dc] transition-all"
      >
        Skip to dashboard
      </a>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-[#0b1f24]/30 backdrop-blur-[2px] md:hidden border-0 cursor-default"
        />
      )}

      {/* Main Grid Shell */}
      <div className="grid grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)] min-[1250px]:grid-cols-[240px_minmax(0,1fr)] min-h-screen">
      
        <aside
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
          <div className="flex items-center justify-between ml-[8px] mr-1">
            <Link
              className="flex items-center gap-[9px] text-[26px] md:text-[28px] font-extrabold tracking-[-1.2px] w-fit text-[#0b1f24] no-underline"
              href="/"
              aria-label="Devora home"
            >
              <svg className="w-[28px] h-[32px] shrink-0" width="28" height="32">
                <use href="#logo-mark" />
              </svg>
              <span>
                Devora<i className="brand-dot not-italic text-[#f59e0b] -ml-[2px]">.</i>
              </span>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden w-8 h-8 rounded-lg grid place-items-center text-[#5b6b70] hover:bg-[#e6f4f0] hover:text-[#0f766e] transition-colors"
              aria-label="Close navigation"
            >
              <X size={18} className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Workspace Switcher with Live User Initials */}
          <div className="flex items-center gap-[9px] mt-[22px] md:mt-[26px] border border-[#d2e1dc] bg-gradient-to-br from-white to-[#f3f7f4] rounded-[11px] p-[11px_9px]">
            <div className="w-[31px] h-[31px] grid place-items-center border border-[#99f6e4] rounded-[9px] bg-[#ccfbf1] text-[#0b4f4a] text-[10px] font-bold shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <strong className="block text-[10px] font-bold leading-tight text-[#0b1f24] truncate">
                {user?.full_name || 'Personal Workspace'}
              </strong>
              <small className="flex items-center gap-2 mt-1 text-[#5b6b70] text-[9px] leading-tight font-medium">
                Active <span className="px-1.5 py-[1px] bg-[#ccfbf1] text-[#0f766e] text-[6.5px] tracking-[0.4px] rounded font-bold">PRO</span>
              </small>
            </div>
            <ChevronsUpDown size={13} className="ml-auto w-[13px] h-[13px] text-[#8a989c] shrink-0" />
          </div>

          {/* New Task Action */}
          <button
            type="button"
            className="flex items-center gap-[9px] w-full h-10 mt-[14px] px-[13px] border border-transparent rounded-[9px] bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white text-[11px] font-extrabold shadow-[0_4px_14px_rgba(15,118,110,0.25)] hover:shadow-[0_6px_18px_rgba(15,118,110,0.35)] hover:-translate-y-[1px] transition-all cursor-pointer"
            onClick={() => {
              setSidebarOpen(false);
              const input = document.getElementById('composer-textarea');
              input?.focus();
            }}
          >
            <Plus size={16} className="w-4 h-4 shrink-0" />
            New task
            <kbd className="ml-auto px-1.5 py-[2px] border border-white/25 rounded text-[#ccfbf1] text-[8px] font-semibold font-sans">
              ⌘ K
            </kbd>
          </button>

          {/* Sidebar Nav */}
          <nav className="mt-[24px]">
            <div className="flex justify-between mx-[11px] mb-[10px] text-[#8a989c] text-[8px] tracking-[1.3px] font-bold uppercase">
              WORKSPACE
            </div>

            {[
              { label: 'Overview', icon: <LayoutDashboard size={16} className="w-4 h-4" />, href: '/dashboard' },
              { label: 'Documents', icon: <FolderOpen size={16} className="w-4 h-4" />, count: documents.length ? `${documents.length}` : undefined, href: '/documents' },
              { label: 'Conversations', icon: <MessagesSquare size={16} className="w-4 h-4" />, count: chatCount ? `${chatCount}` : undefined, href: '/chat' },
              { label: 'Resume ATS', icon: <ContactRound size={16} className="w-4 h-4" />, href: '/resume' },
            ].map((item) => {
              const isActive = item.href === '/dashboard';
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`relative flex items-center gap-[10px] w-full h-9 my-[3px] px-[11px] rounded-[8px] text-left text-[10.5px] whitespace-nowrap cursor-pointer border-0 transition-colors no-underline ${
                    isActive
                      ? 'text-[#0f766e] bg-[#e6f4f0] font-bold'
                      : 'text-[#1c3238] hover:bg-[#f3f7f4] hover:text-[#0f766e] font-semibold'
                  }`}
                >
                  <span className={isActive ? 'text-[#0f766e]' : 'text-[#5b6b70]'}>{item.icon}</span>
                  {item.label}
                  {isActive ? (
                    <span className="ml-auto w-[5px] h-[5px] rounded-full bg-[#0f766e]" />
                  ) : (
                    item.count && (
                      <small className="ml-auto text-[8.5px] text-[#0f766e] bg-[#ccfbf1] font-bold px-1.5 py-0.5 rounded">
                        {item.count}
                      </small>
                    )
                  )}
                </Link>
              );
            })}

            <div className="flex justify-between mx-[11px] mt-[24px] mb-[10px] text-[#8a989c] text-[8px] tracking-[1.3px] font-bold uppercase">
              YOUR AI TOOLKIT <span className="text-[#0f766e] tracking-normal font-bold">{TOOLKIT_ITEMS.length}</span>
            </div>

            {TOOLKIT_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="relative flex items-center gap-[10px] w-full h-9 my-[3px] px-[11px] rounded-[8px] text-left text-[10.5px] whitespace-nowrap cursor-pointer border-0 transition-colors text-[#1c3238] hover:bg-[#f3f7f4] hover:text-[#0f766e] font-semibold no-underline"
              >
                <span className="text-[#5b6b70]">{item.icon}</span>
                {item.name}
              </Link>
            ))}

            <div className="flex justify-between mx-[11px] mt-[24px] mb-[10px] text-[#8a989c] text-[8px] tracking-[1.3px] font-bold uppercase">
              PREFERENCES
            </div>

            <Link
              href="/settings"
              onClick={() => setSidebarOpen(false)}
              className="relative flex items-center gap-[10px] w-full h-9 my-[3px] px-[11px] rounded-[8px] text-left text-[10.5px] whitespace-nowrap cursor-pointer border-0 transition-colors text-[#1c3238] hover:bg-[#f3f7f4] hover:text-[#0f766e] font-semibold no-underline"
            >
              <span className="text-[#5b6b70]">
                <Settings2 size={16} className="w-4 h-4" />
              </span>
              Settings
            </Link>
          </nav>

          {/* Sidebar Bottom (User Card, Settings & Logout) */}
          <div className="mt-auto pt-5">
            <div className="flex items-center gap-[7px] pt-3 border-t border-[#e3ebe8] -mx-1.5 px-1.5 py-1.5 rounded-lg">
              <Link
                href="/settings"
                className="flex items-center gap-[9px] min-w-0 flex-1 hover:opacity-80 transition-opacity no-underline"
                title="Open settings"
              >
                <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-tr from-[#0d9488] to-[#0b4f4a] text-white font-bold text-[10px] grid place-items-center shrink-0 shadow-xs">
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block text-[10px] font-bold leading-tight text-[#0b1f24] truncate">
                    {user?.full_name || 'Devora User'}
                  </strong>
                  <small className="block text-[8.5px] text-[#5b6b70] leading-tight truncate">
                    {user?.email || 'Logged in'}
                  </small>
                </div>
              </Link>
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
          <header className="flex items-center justify-between gap-3 sm:gap-[15px] h-[64px] sm:h-[69px] px-4 sm:px-6 lg:px-[30px] bg-white/95 backdrop-blur-sm border-b border-[#e3ebe8] sticky top-0 z-20">
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
              <strong className="font-bold text-[#0b1f24]">Overview</strong>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 lg:gap-[17px]">
              <span className="hidden sm:flex items-center gap-[6px] px-2.5 py-[5px] border border-[#99f6e4] bg-[#ccfbf1]/50 text-[#0f766e] rounded-[6px] text-[8.5px] font-bold whitespace-nowrap">
                <span className="w-1.5 h-1.5 bg-[#0f766e] rounded-full animate-pulse" />
                Live Workspace
              </span>

              <Link
                className="flex items-center gap-1 sm:gap-[5px] text-[10.5px] text-[#5b6b70] hover:text-[#0f766e] font-bold transition-colors no-underline whitespace-nowrap"
                href="/settings"
                title="Account Settings"
              >
                <Settings2 size={13} className="w-[13px] h-[13px]" />
                <span className="hidden sm:inline">Settings</span>
              </Link>

              <Link
                className="flex items-center gap-1 sm:gap-[5px] text-[10.5px] text-[#5b6b70] hover:text-[#0f766e] font-bold transition-colors no-underline whitespace-nowrap"
                href="/"
              >
                <span className="hidden sm:inline">Back to website</span>
                <span className="sm:hidden">Website</span>
                <ArrowUpRight size={13} className="w-[13px] h-[13px]" />
              </Link>
            </div>
          </header>

          {/* Main Content Area */}
          <main id="dashboard-main" className="max-w-[1380px] w-full mx-auto pt-5 sm:pt-8 px-4 sm:px-6 lg:px-[30px] pb-12 flex-1">
            {/* Dynamic Welcome Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-5 mb-5 sm:mb-[25px]">
              <div>
                <span className="block text-[#0f766e] text-[8.5px] tracking-[1.5px] font-extrabold uppercase mb-1.5 sm:mb-[8px]">
                  WELCOME BACK, {firstName.toUpperCase()}
                </span>
                <h1 className="text-[24px] sm:text-[28px] leading-[1.25] tracking-[-1.2px] font-extrabold text-[#0b1f24] m-0">
                  Ready to accelerate <span className="accent-word not-italic text-[#0f766e]">your career & ideas?</span>
                </h1>
                <p className="text-[#5b6b70] text-[11px] sm:text-[11.5px] leading-[1.8] mt-1.5 sm:mt-2 m-0 font-medium">
                  {documents.length > 0
                    ? `You have ${documents.length} active documents and ${chatCount} research sessions in your workspace.`
                    : 'Upload your documents, generate Harvard ATS resumes, and explore deep AI research.'}
                </p>
              </div>
              <div className="flex items-center gap-[10px] shrink-0 self-start sm:self-auto p-2.5 sm:p-3 border border-[#d2e1dc] bg-white rounded-[12px] shadow-xs">
                <FolderHeart size={26} className="w-6 h-6 text-[#0f766e] stroke-[1.5]" />
                <span className="text-[#5b6b70] text-[9.5px] leading-[1.5] font-medium">
                  <strong className="text-[#0b1f24] font-bold block">Devora AI</strong>
                  Connected & Ready.
                </span>
              </div>
            </div>

            {/* 3. PROMPT COMPOSER */}
            <section className="relative p-4 sm:p-[23px_24px_17px] border border-[#d2e1dc] rounded-[18px] bg-white bg-[radial-gradient(ellipse_at_100%_0%,rgba(94,234,212,0.18),transparent_65%)] shadow-[0_4px_18px_rgba(11,79,74,0.04)] before:content-[''] before:absolute before:left-7 before:right-7 before:-top-[1px] before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[#14b8a6] before:to-transparent">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                <div className="w-[36px] h-[36px] sm:w-[39px] sm:h-[39px] grid place-items-center text-[#0f766e] bg-gradient-to-br from-[#e6f4f0] to-[#ccfbf1] border border-[#99f6e4] rounded-[12px] shadow-[inset_0_1px_0_white] shrink-0">
                  <Sparkles size={20} className="w-5 h-5 sm:w-[21px] sm:h-[21px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[16px] sm:text-[18px] font-extrabold tracking-[-0.5px] text-[#0b1f24] m-0">
                    What will you create today?
                  </h2>
                  <p className="text-[#5b6b70] text-[10px] sm:text-[10.5px] mt-1 sm:mt-[4px] m-0 font-medium">
                    Start with an idea. Ask Devora to analyze a PDF, optimize your resume, or research code.
                  </p>
                </div>
                <span className="flex items-center gap-[6px] ml-auto text-[#0f766e] text-[8.5px] font-bold px-[10px] py-[5px] border border-[#99f6e4] bg-[#ccfbf1]/60 rounded-full whitespace-nowrap">
                  <span className="w-1.5 h-1.5 bg-[#0f766e] rounded-full animate-pulse" />
                  Devora 3.1 Studio
                </span>
              </div>

              <div className="mt-4 sm:mt-[18px] border border-[#d2e1dc] rounded-[12px] bg-white shadow-xs focus-within:border-[#14b8a6] focus-within:ring-2 focus-within:ring-[#ccfbf1]/60 transition-all">
                <textarea
                  id="composer-textarea"
                  className="w-full min-h-[68px] sm:min-h-[73px] p-3 sm:p-[17px_16px_24px] text-[12px] leading-[1.8] text-[#0b1f24] placeholder:text-[#8a989c] font-medium font-['Manrope',sans-serif] border-0 focus:outline-none bg-transparent resize-none"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendPrompt();
                    }
                  }}
                  placeholder="Ask Devora to analyze documents, craft Harvard ATS resumes, or explain algorithms…"
                />

                <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 pb-3">
                  <div className="flex items-center gap-2 sm:gap-[10px]">
                    <button
                      type="button"
                      className="grid place-items-center w-[25px] h-[25px] text-[#0f766e] hover:text-[#0b4f4a] transition-colors cursor-pointer border-0 bg-transparent"
                      title="Attach project context"
                    >
                      <Layers2 size={15} className="w-[15px] h-[15px]" />
                    </button>
                    <span className="w-[1px] h-[14px] bg-[#d2e1dc]" />
                    <Link
                      href="/documents"
                      className="flex items-center gap-[5px] p-0 text-[9.5px] text-[#0f766e] hover:text-[#0b4f4a] font-bold transition-colors no-underline"
                    >
                      <FileSearch size={13} className="w-[13px] h-[13px]" />
                      <span>Attach PDF</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-[10px] ml-auto">
                    <span className="flex items-center gap-[5px] text-[#0f766e] text-[9.5px] font-bold">
                      <Zap size={13} className="w-3.5 h-3.5 text-[#f59e0b]" /> Devora Fast
                    </span>
                    <button
                      type="button"
                      className="grid place-items-center w-[30px] h-[30px] rounded-[9px] text-white bg-gradient-to-br from-[#0d9488] to-[#0b4f4a] shadow-[0_3px_10px_rgba(15,118,110,0.3)] hover:brightness-110 transition-all cursor-pointer border-0"
                      onClick={handleSendPrompt}
                      aria-label="Send prompt"
                    >
                      <ArrowUp size={17} className="w-[17px] h-[17px]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Inspiration Chips */}
              <div className="flex items-center flex-wrap gap-2 mt-3 sm:mt-[14px]">
                <span className="mr-1 text-[#5b6b70] text-[9px] font-bold">Try quick prompts:</span>
                {SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setPromptText(sug)}
                    className="flex items-center gap-[5px] px-[10px] py-[6px] border border-[#d2e1dc] rounded-[6px] bg-[#f3f7f4] text-[#0f766e] hover:bg-[#e6f4f0] hover:border-[#14b8a6] transition-all text-[9.5px] font-bold cursor-pointer"
                  >
                    <Sparkles size={12} className="w-3 h-3 text-[#f59e0b]" /> {sug}
                  </button>
                ))}
              </div>
            </section>

            {/* 4. AI TOOLKIT SUITE */}
            <section className="mt-[25px] sm:mt-[29px]">
              <div className="flex items-end justify-between gap-3 mb-[15px]">
                <div>
                  <h2 className="text-[14px] sm:text-[15px] tracking-[-0.35px] font-extrabold text-[#0b1f24] m-0">
                    Your AI toolkit
                  </h2>
                  <p className="mt-1 text-[#5b6b70] text-[10px] font-medium m-0">
                    Two specialized modules for career & technical excellence.
                  </p>
                </div>
                <span className="text-[#8a989c] text-[7.5px] tracking-[1.2px] uppercase font-bold">
                  ONE CONNECTED WORKSPACE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {TOOLKIT_ITEMS.map((tool) => (
                  <Link
                    key={tool.num}
                    href={tool.href}
                    className="relative p-[17px_14px_13px] border border-[#d2e1dc] rounded-[14px] bg-gradient-to-br from-white via-white to-[#f3f7f4] shadow-[0_2px_8px_rgba(11,79,74,0.03)] hover:border-[#14b8a6] hover:shadow-[0_8px_24px_-8px_rgba(15,118,110,0.18)] transition-all cursor-pointer flex flex-col justify-between no-underline"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-[15px]">
                        <div className="w-[35px] h-[35px] grid place-items-center text-[#0f766e] bg-gradient-to-br from-[#f3f7f4] to-[#ccfbf1] border border-[#99f6e4] rounded-[10px]">
                          {tool.icon}
                        </div>
                        <span className="text-[#8a989c] text-[8.5px] font-bold tracking-[1px]">
                          {tool.num}
                        </span>
                      </div>
                      <h3 className="min-h-[34px] text-[11.5px] leading-[1.5] font-bold tracking-[-0.15px] text-[#0b1f24] m-0">
                        {tool.name}
                      </h3>
                      <p className="mt-[5px] text-[#5b6b70] text-[10px] leading-[1.75] font-medium m-0">
                        {tool.line1}
                        <br />
                        {tool.line2}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-1 mt-4 pt-[11px] border-t border-[#e3ebe8] text-[#0f766e] hover:text-[#0b4f4a] text-[8.5px] font-bold leading-[1.5]">
                      <span>{tool.action}</span>
                      <ArrowUpRight size={13} className="w-[13px] h-[13px]" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 5. RECENT PROJECTS & LIVE ACTIVITY */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.8fr)_minmax(265px,1fr)] gap-[18px] mt-[25px] sm:mt-[27px]">
              {/* Left Panel: Recent Work / Documents */}
              <div className="min-w-0 border border-[#d2e1dc] rounded-[14px] p-4 sm:p-[21px_20px_0] bg-white shadow-[0_2px_8px_rgba(11,79,74,0.03)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-[10px]">
                    <h2 className="text-[13px] font-extrabold tracking-[-0.3px] text-[#0b1f24] m-0">
                      Recent workspace documents
                    </h2>
                    <Link
                      href="/documents"
                      className="flex items-center gap-[5px] text-[9.5px] text-[#0f766e] hover:text-[#0b4f4a] font-bold transition-colors whitespace-nowrap no-underline"
                    >
                      View all <ArrowUpRight size={12} className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Documents List */}
                  {loadingDocs ? (
                    <div className="py-12 text-center text-[#8a989c] text-[11px]">
                      Loading your workspace documents…
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="py-10 text-center flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-[#ccfbf1] text-[#0f766e] grid place-items-center mb-3">
                        <UploadCloud size={20} />
                      </div>
                      <p className="text-[12px] font-bold text-[#0b1f24] m-0">No documents uploaded yet</p>
                      <p className="text-[10px] text-[#5b6b70] mt-1 mb-4">
                        Upload a PDF research paper or JD to unlock Deep Hybrid RAG.
                      </p>
                      <Link
                        href="/documents"
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white text-[10.5px] font-bold hover:brightness-110 shadow-sm transition-all no-underline"
                      >
                        Upload first PDF
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e3ebe8] mt-3">
                      {documents.slice(0, 5).map((doc) => (
                        <Link
                          key={doc.id}
                          href={`/documents?id=${doc.id}`}
                          className="flex items-center gap-2.5 sm:gap-[11px] py-3.5 sm:py-[15px] border-b border-[#e3ebe8] last:border-b-0 min-w-0 hover:bg-[#f3f7f4] -mx-2 px-2 rounded-lg transition-colors no-underline"
                        >
                          <div className="grid place-items-center w-8 h-8 sm:w-[34px] sm:h-[34px] shrink-0 text-[#0f766e] bg-[#f3f7f4] border border-[#d2e1dc] rounded-[9px]">
                            <FileText size={16} className="w-4 h-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="text-[11px] text-[#0b1f24] leading-[1.5] font-bold m-0 truncate">
                              {doc.title || doc.filename || 'Untitled Document'}
                            </h3>
                            <p className="text-[8.5px] leading-[1.8] text-[#5b6b70] font-medium mt-[1px] m-0 truncate">
                              <span>Document Intelligence</span>
                              <span className="mx-[4px]">·</span>
                              <span>{doc.total_pages ? `${doc.total_pages} pages` : 'Processed'}</span>
                              <span className="mx-[4px]">·</span>
                              <span>{new Date(doc.created_at || Date.now()).toLocaleDateString()}</span>
                            </p>
                          </div>

                          <span className="ml-auto border px-[7px] py-1 rounded-[5px] text-[7.5px] font-bold whitespace-nowrap shrink-0 bg-[#ccfbf1] text-[#0b4f4a] border-[#99f6e4] before:content-[''] before:inline-block before:w-[4px] before:h-[4px] before:mr-1 before:rounded-full before:bg-[#0f766e] before:align-middle">
                            Indexed
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-[6px] py-[13px] px-4 sm:px-5 -mx-4 sm:-mx-5 border-t border-[#e3ebe8] text-[#8a989c] text-[8.5px] font-semibold mt-4 sm:mt-auto">
                  <Clock3 size={13} className="w-[13px] h-[13px] text-[#0f766e]" />
                  <span>Your workspace is continuously synchronized.</span>
                </div>
              </div>

              {/* Right Panel: Momentum Activity & Harvard ATS Shortcut */}
              <aside className="min-w-0 border border-[#d2e1dc] rounded-[14px] p-4 sm:p-[21px_20px] bg-white shadow-[0_2px_8px_rgba(11,79,74,0.03)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-[10px]">
                    <h2 className="text-[13px] font-extrabold tracking-[-0.3px] text-[#0b1f24] m-0">
                      Your momentum
                    </h2>
                    <span className="text-[#8a989c] text-[8px] font-bold">Active Metrics</span>
                  </div>

                  <div className="flex gap-6 sm:gap-[35px] mt-4 sm:mt-[23px]">
                    <div>
                      <strong className="text-[26px] sm:text-[28px] font-black tracking-[-1px] text-[#0b1f24] leading-[1.1]">
                        {documents.length}
                      </strong>
                      <span className="block text-[8.5px] mt-1 sm:mt-[7px] text-[#5b6b70] font-semibold">
                        Documents Indexed
                      </span>
                    </div>
                    <div>
                      <strong className="text-[26px] sm:text-[28px] font-black tracking-[-1px] text-[#0b1f24] leading-[1.1]">
                        {chatCount}
                      </strong>
                      <span className="block text-[8.5px] mt-1 sm:mt-[7px] text-[#5b6b70] font-semibold">
                        Research Sessions
                      </span>
                    </div>
                  </div>

                  {/* 7-day Activity Chart */}
                  <div className="h-[88px] mt-5 sm:mt-[22px] px-[3px]">
                    <div className="flex justify-between items-end gap-2 sm:gap-[13px] h-full bg-[repeating-linear-gradient(to_top,transparent_0,transparent_21px,#e3ebe8_22px,#e3ebe8_23px)]">
                      {WEEK_BARS.map((bar, idx) => (
                        <div key={idx} className="flex flex-col justify-end items-center flex-1 h-full relative pb-[17px]">
                          <span
                            style={{ height: `calc(${bar.height} * 0.76)` }}
                            className={`w-full max-w-[24px] rounded-t-[5px] rounded-b-[1px] transition-all ${
                              bar.highlight
                                ? 'bg-gradient-to-t from-[#0f766e] to-[#14b8a6] shadow-[0_3px_10px_rgba(15,118,110,0.3)]'
                                : bar.future
                                  ? 'bg-[#d2e1dc] min-h-[2px]'
                                  : 'bg-gradient-to-t from-[#5eead4] to-[#2dd4bf]'
                            }`}
                          />
                          <small className="absolute bottom-0 text-[7.5px] text-[#5b6b70] font-bold">
                            {bar.day}
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-[5px] text-[8.5px] text-[#0f766e] font-bold mt-3 sm:mt-[13px]">
                    <TrendingUp size={12} className="w-3 h-3" /> Continuous AI development active.
                  </div>
                </div>

                {/* Harvard ATS Card Shortcut */}
                <Link
                  href="/resume"
                  className="h-[110px] -mx-4 sm:-mx-[9px] mt-4 sm:mt-[18px] mb-1 sm:mb-[11px] relative overflow-hidden rounded-[12px] bg-[#0b4f4a] block group no-underline shadow-md"
                >
                  <Image
                    src="/images/mountains.jpg"
                    alt="Mountain landscape"
                    fill
                    className="w-full h-full object-cover object-[50%_48%] saturate-[0.35] opacity-40 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 p-[14px_15px] bg-gradient-to-r from-[#083a36f5] to-[#0f766e88] flex flex-col justify-between">
                    <div>
                      <span className="text-[7px] text-[#ccfbf1] font-bold tracking-[1.1px] uppercase">
                        HARVARD ATS STUDIO
                      </span>
                      <p className="text-[14px] sm:text-[16px] font-extrabold leading-[1.3] tracking-[-0.4px] text-white mt-[4px] m-0">
                        1-Click Tailored ATS Resume &rarr;
                      </p>
                    </div>
                    <Sparkles size={21} className="absolute right-[17px] bottom-[18px] text-[#fde7c2] stroke-[1.4]" />
                  </div>
                </Link>
              </aside>
            </div>

            {/* Footer */}
            <footer className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-[15px] my-6 sm:my-[24px_22px] text-[#8a989c] text-[8.5px] font-medium text-center sm:text-left">
              <span className="flex items-center">
                <span className="text-[13px] mr-1 text-[#f59e0b] font-bold">✦</span> Devora Enterprise Platform · All systems live
              </span>
              <p className="text-[#8a989c] text-[8.5px] font-medium m-0">
                Connected to Supabase &bull; Upstash Redis &bull; Google Gemini 3.1
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
