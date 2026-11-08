'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


import {
  X,
  ArrowLeft,
  SquarePen,
  Plus,
  Search,
  MessageSquare,
  Ellipsis,
  FileText,
  ContactRound,
  BriefcaseBusiness,
  TrendingUp,
  PanelLeft,
  MessagesSquare,
  FileCheck2,
  Lightbulb,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  ArrowUpRight,
  Layers2,
  ChevronDown,
  Sparkles,
  Check,
  ArrowUp,
  Info,
  Loader2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Send,
  Globe,
  LogOut,
} from 'lucide-react';
import { useAgentStore } from '@/store';

function ChatView() {
  const { user, logout } = useAuthStore();

  const {
    sidebarOpen,
    setSidebarOpen,
    chats,
    currentChatId,
    messages,
    isLoadingChats,
    inputPrompt,
    setInputPrompt,
    isStreaming,
    streamingText,
    searchStatus,
    activeSources,
    loadUserChats,
    selectChat,
    newChat,
    deleteChat,
    sendMessage,
  } = useChatStore();

  const {
    agentLoading,
    agentStatusText,
    jobAudit,
    userConfirmedSkills,
    userAuditNotes,
    mockInterview,
    candidateAnswerText,
    toggleConfirmedSkill,
    setUserAuditNotes,
    setCandidateAnswerText,
    startJobAudit,
    approveJobAudit,
    startMockInterview,
    submitMockAnswer,
    resetAgent,
  } = useAgentStore();

  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');
  const promptParam = searchParams.get('prompt');
  const router = useRouter();
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const filteredChats = chats.filter((c) =>
    (c.title || 'Untitled chat').toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSwitchMode = (newMode: 'auto' | 'jobs' | 'career') => {
    resetAgent();
    setModeMenuOpen(false);
    if (newMode === 'auto') {
      router.push('/chat');
    } else {
      router.push(`/chat?topic=${newMode}`);
    }
  }

  useEffect(() => {
    if (promptParam) {
      setInputPrompt(decodeURIComponent(promptParam));
    }
  }, [promptParam, setInputPrompt]);

  useEffect(() => {
    if (currentChatId) {
      resetAgent();
    }
  }, [currentChatId, resetAgent]);

  const handleSendMessage = () => {
    if (!inputPrompt.trim() || isStreaming || agentLoading) return;
    const prompt = inputPrompt.trim();
    if (topic === 'jobs') {
      setInputPrompt('');
      startJobAudit(prompt, 'Software Engineer', 3, user?.id);
      return;
    }
    if (topic === 'career') {
      setInputPrompt('');
      startMockInterview(prompt, 'Senior', 'Full-Stack / AI Engineer', user?.id);
      return;
    }
    if (user?.id) {
      sendMessage(user.id);
    }
  };

  const activeChat = chats.find((c) => c.id === currentChatId);
  const displayName = user?.full_name || (user?.email ? user.email.split('@')[0] : 'User');
  const userInitials =
    displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  useEffect(() => {
    if (user?.id) {
      loadUserChats(user.id);
    }
  }, [user?.id, loadUserChats]);

  useEffect(() => {
    document.title = activeChat?.title
      ? `${activeChat.title} — Devora`
      : 'Devora Chat — AI Assistant';
  }, [activeChat]);

  return (
    <div className="h-screen h-[100dvh] overflow-hidden bg-white text-[#0b1f24] font-['Manrope',sans-serif] text-[13px] antialiased select-auto">
      {/* Accessibility skip link */}
      <a
        href="#chat-main"
        className="fixed -top-[100px] left-5 p-3 bg-white z-50 focus:top-2.5 text-[#0b1f24] font-bold rounded-lg shadow-md border border-[#d2e1dc] transition-all"
      >
        Skip to conversation
      </a>

      {/* Main Container: Block on mobile, Grid on desktop */}
      <div className="h-full w-full block md:grid md:grid-cols-[246px_minmax(0,1fr)] min-[1450px]:grid-cols-[260px_minmax(0,1fr)] max-[1050px]:grid-cols-[225px_minmax(0,1fr)] relative overflow-hidden">
       
        <aside
          id="chat-sidebar"
          aria-label="Chat navigation"
          className={`
            fixed md:static inset-y-0 left-0 z-50 md:z-auto
            w-[270px] max-w-[85vw] md:w-auto h-[100dvh] md:h-auto
            bg-[#fbfaf6] border-r border-[#e3ebe8]
            pt-[25px] md:pt-[26px] px-[17px] pb-0
            flex flex-col min-h-0 overflow-y-auto
            [scrollbar-width:thin] [scrollbar-color:#d2e1dc_transparent]
            transition-transform duration-200 ease-in-out
            ${sidebarOpen
              ? 'translate-x-0 shadow-[15px_0_50px_rgba(11,79,74,0.14)]'
              : '-translate-x-full md:translate-x-0'
            }
          `}
        >
          {/* Brand Row */}
          <div className="flex items-center justify-between px-2.5">
            <Link
              href="/"
              className="flex items-center gap-[9px] text-[26px] md:text-[28px] font-extrabold tracking-[-1.2px] text-[#0b1f24] no-underline"
              aria-label="Devora home"
            >
              <svg className="w-[28px] h-[32px] shrink-0" width="28" height="32">
                <use href="#logo-mark" />
              </svg>
              <span>
                Devora<i className="brand-dot not-italic text-[#f59e0b] -ml-[2px]">.</i>
              </span>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              id="close-sidebar"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden w-8 h-8 rounded-lg grid place-items-center text-[#5b6b70] hover:bg-[#e6f4f0] hover:text-[#0f766e] transition-colors"
              aria-label="Close chat navigation"
            >
              <X size={18} className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Back to workspace */}
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-[7px] text-[10.5px] font-semibold text-[#5b6b70] hover:text-[#0f766e] mt-5 md:mt-6 mx-2.5 transition-colors"
          >
            <ArrowLeft size={13} className="w-[13px] h-[13px] shrink-0" />
            Back to workspace
          </Link>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={() => {
              newChat();
              resetAgent();
              setSidebarOpen(false);
            }}
            className="flex items-center gap-[9px] mt-4 md:mt-5 bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white min-h-[43px] px-3.5 rounded-[10px] text-[11px] font-extrabold shadow-[0_4px_14px_rgba(15,118,110,0.25)] hover:shadow-[0_6px_18px_rgba(15,118,110,0.35)] hover:-translate-y-[1px] transition-all cursor-pointer w-full text-left"
          >
            <SquarePen size={16} className="w-4 h-4 shrink-0" />
            <span>New chat</span>
            <Plus size={14} className="ml-auto w-3.5 h-3.5 shrink-0" />
          </button>


          {/* Search conversations active box */}
          <div className="flex items-center gap-[7px] px-2.5 py-1.5 mt-2 text-[#5b6b70] text-[11px] font-medium border border-[#d2e1dc] bg-white rounded-lg focus-within:border-[#14b8a6] focus-within:ring-1 focus-within:ring-[#ccfbf1] transition-all">
            <Search size={13} className="w-3.5 h-3.5 text-[#8a989c] shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[10.5px] text-[#0b1f24] placeholder:text-[#8a989c]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#8a989c] hover:text-[#0b1f24] p-0.5 rounded cursor-pointer"
                title="Clear search"
              >
                <X size={12} className="w-3 h-3" />
              </button>
            ) : (
              <kbd className="ml-auto text-[8px] font-sans px-1.5 py-0.5 border border-[#d2e1dc] rounded bg-[#f3f7f4] text-[#5b6b70] font-semibold shrink-0">
                ⌘ K
              </kbd>
            )}
          </div>

          {/* Conversation History */}
          <nav className="mt-4 md:mt-5" aria-label="Recent conversations">
            <div className="flex justify-between px-2.5 mb-3 md:mb-4 text-[8px] tracking-[1.15px] text-[#8a989c] font-bold uppercase">
              <span>RECENT CONVERSATIONS</span>
              <span>{chats.length}</span>
            </div>

            {isLoadingChats ? (
              <div className="flex items-center justify-center py-4 text-[#0f766e]">
                <Loader2 size={16} className="animate-spin" />
              </div>
            ) : filteredChats.length === 0 ? (
              <p className="text-[10px] text-[#8a989c] px-2.5 py-2 italic">
                No conversations yet.
              </p>
            ) : (
              filteredChats.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    selectChat(c.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center justify-between gap-2 w-full min-h-[36px] px-2.5 rounded-lg mb-1 text-[10px] cursor-pointer transition-colors border ${currentChatId === c.id
                      ? 'text-[#0f766e] font-bold bg-[#e6f4f0] border-[#99f6e4]'
                      : 'text-[#1c3238] border-transparent hover:bg-[#f3f7f4] hover:text-[#0f766e] font-semibold'
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare size={13} className={`w-[13px] h-[13px] shrink-0 ${currentChatId === c.id ? 'text-[#0f766e]' : 'text-[#8a989c]'}`} />
                    <span className="truncate">{c.title || 'Untitled chat'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (user?.id) deleteChat(c.id, user.id);
                    }}
                    className="text-[#8a989c] hover:text-red-600 p-1 transition-colors"
                    title="Delete chat"
                  >
                    <Trash2 size={12} className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="mt-auto pt-5 pb-4">
            {/* Possibility Note */}
            <div className="flex items-start gap-2 p-[10px_9px_16px]">
              <span className="text-[20px] leading-none text-[#f59e0b]">✦</span>
              <div>
                <strong className="block text-[10px] font-bold text-[#0b1f24]">
                  A little AI. A lot of possibility.
                </strong>
                <p className="text-[8.5px] leading-[1.7] max-w-[165px] mt-1 text-[#5b6b70]">
                  Your next chapter starts with a conversation.
                </p>
              </div>
            </div>

            {/* Profile Avatar Card & Logout */}
            <div className="flex items-center gap-[9px] py-3.5 px-1.5 border-t border-[#e3ebe8]">
              <Link href="/settings" className="flex items-center gap-[9px] min-w-0 flex-1 no-underline hover:opacity-85 transition-opacity">
                <span className="w-[31px] h-[31px] grid place-items-center rounded-full bg-gradient-to-tr from-[#0d9488] to-[#0b4f4a] border-2 border-white shadow-xs text-white text-[10px] font-bold shrink-0">
                  {userInitials}
                </span>
                <div className="min-w-0">
                  <strong className="block text-[10.5px] font-bold text-[#0b1f24] leading-tight truncate">
                    {displayName}
                  </strong>
                  <small className="block mt-0.5 text-[8.5px] text-[#5b6b70] font-medium leading-tight truncate">
                    {user?.email || 'Logged In'}
                  </small>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="w-7 h-7 rounded-lg grid place-items-center text-[#8a989c] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                title="Sign out of Devora"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <button
            type="button"
            id="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close chat navigation"
            className="fixed inset-0 z-40 bg-[#0b1f24]/30 backdrop-blur-[2px] md:hidden cursor-default border-0"
          />
        )}

    
        <main
          id="chat-main"
          className="h-full w-full grid grid-rows-[62px_minmax(0,1fr)_auto] md:grid-rows-[68px_minmax(0,1fr)_auto] min-w-0 min-h-0 overflow-hidden bg-white"
        >
          {/* Top Bar Header */}
          <header className="flex items-center justify-between gap-2.5 sm:gap-4 px-3.5 sm:px-5 md:px-7 border-b border-[#e3ebe8] bg-white z-10 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
              {/* Mobile Sidebar Hamburger */}
              <button
                type="button"
                id="open-sidebar"
                onClick={() => setSidebarOpen(true)}
                aria-expanded={sidebarOpen}
                aria-controls="chat-sidebar"
                className="md:hidden w-8 h-8 rounded-[7px] grid place-items-center text-[#5b6b70] hover:bg-[#e6f4f0] hover:text-[#0f766e] transition-colors"
                aria-label="Open chat navigation"
              >
                <PanelLeft size={18} className="w-[18px] h-[18px]" />
              </button>

              <div className="min-w-0">
                <strong className="block text-[13.5px] sm:text-[15px] tracking-[-0.4px] font-bold text-[#0b1f24] leading-tight truncate">
                  Devora Chat <span className="text-[#f59e0b] font-normal">✦</span>
                </strong>
                <small className="block mt-0.5 text-[8.5px] text-[#5b6b70] font-medium leading-tight truncate">
                  Your context. A clearer conversation.
                </small>
              </div>

              <span className="w-px h-6 bg-[#e3ebe8] hidden lg:block" />

              <span className="hidden lg:flex items-center gap-1.5 text-[9.5px] text-[#0f766e] font-semibold bg-[#ccfbf1]/50 border border-[#99f6e4] px-2.5 py-1 rounded-full whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0f766e] animate-pulse" />
                <span id="header-mode">{activeChat ? activeChat.title : 'Your AI workspace'}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[8px] font-bold text-[#0f766e] border border-[#99f6e4] bg-[#ccfbf1]/60 px-2 py-1 rounded-[5px] whitespace-nowrap">
                Devora-3.1
              </span>
              <button
                type="button"
                disabled
                className="hidden md:grid w-[29px] h-[29px] place-items-center rounded-[7px] text-[#8a989c] opacity-80 cursor-default"
                aria-label="More conversation options, unavailable in preview"
              >
                <Ellipsis size={16} className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Conversation Scroll Area */}
          <div
            id="conversation-scroller"
            className="min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:#d2e1dc_transparent] overscroll-contain flex-1 bg-[#fbfaf6]"
          >
            {jobAudit || mockInterview || messages.length > 0 || isStreaming ? (
              <section className="max-w-[780px] min-[1450px]:max-w-[840px] mx-auto p-[20px_14px_24px] sm:p-6 md:p-8 space-y-6">
                {/* Agent Loading Banner */}
                {agentLoading && (
                  <div className="flex items-center gap-3 p-4 bg-[#f3f7f4] border border-[#99f6e4] rounded-xl text-[#0f766e] shadow-xs animate-pulse mb-4">
                    <Loader2 size={18} className="animate-spin text-[#0f766e]" />
                    <span className="text-[12px] font-semibold text-[#0b4f4a]">
                      {agentStatusText || 'Agent is thinking...'}
                    </span>
                  </div>
                )}

                {/* View A: Job Intelligence Audit & HITL Card */}
                {jobAudit && (
                  <div className="bg-white border border-[#d2e1dc] rounded-2xl p-5 sm:p-6 shadow-[0_4px_22px_rgba(11,79,74,0.06)] space-y-5">
                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-[#e3ebe8]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#ccfbf1] grid place-items-center text-[#0f766e] border border-[#99f6e4]">
                          <BriefcaseBusiness size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-[14.5px] font-extrabold text-[#0b1f24]">
                              Job Intelligence Audit
                            </h2>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#ccfbf1] text-[#0b4f4a] border border-[#99f6e4]">
                              Match: {jobAudit.match_score || 75}%
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5b6b70]">
                            Target: {jobAudit.target_role || 'Software Engineer'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={resetAgent}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#f3f7f4] hover:bg-[#e6f4f0] text-[#0f766e] border border-[#d2e1dc] transition-colors cursor-pointer"
                      >
                        Reset Audit
                      </button>
                    </div>

                    {/* Taxonomy Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="p-3.5 bg-[#f3f7f4] rounded-xl border border-[#d2e1dc]">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0f766e] block mb-2">
                          Mandatory Technical Stack
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {jobAudit.must_haves?.map((m, i) => (
                            <span
                              key={i}
                              className="text-[10.5px] bg-white border border-[#d2e1dc] px-2.5 py-0.5 rounded-md text-[#0b1f24] font-semibold shadow-2xs"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3.5 bg-[#f3f7f4] rounded-xl border border-[#d2e1dc]">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0f766e] block mb-2">
                          Architecture Patterns
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {jobAudit.architecture_patterns?.map((a, i) => (
                            <span
                              key={i}
                              className="text-[10.5px] bg-white border border-[#d2e1dc] px-2.5 py-0.5 rounded-md text-[#0b1f24] font-semibold shadow-2xs"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Red Flags if any */}
                    {jobAudit.red_flags && jobAudit.red_flags.length > 0 && (
                      <div className="p-3.5 bg-[#fffbeb] border border-[#fde68a] rounded-xl text-[#92400e]">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold mb-1.5 text-[#b45309]">
                          <AlertTriangle size={14} className="text-[#d97706]" /> Job Posting Red Flags & Expectations
                        </span>
                        <ul className="list-disc ml-4 text-[11px] space-y-1">
                          {jobAudit.red_flags.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/*  HITL CHECKPOINT */}
                    {jobAudit.status === 'awaiting_user_approval' ? (
                      <div className="mt-4 p-4 sm:p-5 bg-gradient-to-br from-[#f3f7f4] to-[#e6f4f0] border-2 border-[#14b8a6] rounded-xl shadow-xs space-y-3.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0f766e] animate-ping" />
                          <span className="text-[12px] font-extrabold text-[#0b4f4a] tracking-tight">
                            ⏸️ Human-in-the-Loop Checkpoint: Defend Detected Gaps
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5b6b70] leading-relaxed">
                          The agent analyzed candidate fit and detected these critical requirements. Check any skills you possess, and provide strategic context:
                        </p>

                        <div className="space-y-1.5">
                          {jobAudit.missing_critical_gaps?.map((gap, i) => {
                            const isConfirmed = userConfirmedSkills.includes(gap);
                            return (
                              <label
                                key={i}
                                className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-[#d2e1dc] cursor-pointer hover:border-[#14b8a6] transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={isConfirmed}
                                  onChange={() => toggleConfirmedSkill(gap)}
                                  className="w-3.5 h-3.5 rounded accent-[#0f766e]"
                                />
                                <span className="text-[11px] font-semibold text-[#0b1f24]">{gap}</span>
                              </label>
                            );
                          })}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#0b4f4a] uppercase">
                            Strategic Notes / Analogous Experience:
                          </label>
                          <input
                            type="text"
                            value={userAuditNotes}
                            onChange={(e) => setUserAuditNotes(e.target.value)}
                            placeholder="e.g. Worked with RabbitMQ instead of Kafka; deep background in event streaming"
                            className="w-full px-3 py-2 text-[11.5px] bg-white border border-[#d2e1dc] rounded-lg outline-none focus:border-[#0f766e]"
                          />
                        </div>

                        <button
                          onClick={approveJobAudit}
                          disabled={agentLoading}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white rounded-xl text-[11.5px] font-bold shadow-[0_4px_12px_rgba(15,118,110,0.25)] hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 size={15} /> Confirm Experience & Synthesize Battle Plan
                        </button>
                      </div>
                    ) : (
                      /* COMPLETED BATTLE PLAN */
                      <div className="mt-4 pt-4 border-t border-[#e3ebe8] space-y-4">
                        <div className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#0f766e]">
                          <Sparkles size={16} className="text-[#f59e0b]" /> 5 Predicted Interview Questions & Battle Strategy
                        </div>

                        <div className="space-y-3">
                          {jobAudit.predicted_interview_questions?.map((q, i) => (
                            <div key={i} className="p-4 bg-[#f3f7f4] rounded-xl border border-[#d2e1dc] space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9.5px] font-extrabold text-[#0b4f4a] bg-[#ccfbf1] px-2 py-0.5 rounded border border-[#99f6e4] uppercase">
                                  {q.focus_area}
                                </span>
                                <span className="text-[9.5px] font-bold text-[#8a989c]">Question #{i + 1}</span>
                              </div>
                              <h4 className="text-[12px] font-bold text-[#0b1f24] leading-snug">{q.question}</h4>
                              <div className="text-[11px] text-[#1c3238] bg-white p-3 rounded-lg border border-[#d2e1dc] leading-relaxed">
                                <strong className="text-[#0b1f24] block mb-1">Model Talking Points:</strong>
                                {q.model_talking_points}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                          <div className="p-3.5 bg-white rounded-xl border border-[#d2e1dc]">
                            <span className="text-[10px] font-extrabold text-[#0b1f24] uppercase block mb-1.5">
                              Gap Defense Strategy
                            </span>
                            <ul className="text-[10.5px] text-[#5b6b70] space-y-1.5 list-disc ml-3.5">
                              {jobAudit.gap_defense_talking_points?.map((g, i) => (
                                <li key={i}>{g}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-3.5 bg-white rounded-xl border border-[#d2e1dc]">
                            <span className="text-[10px] font-extrabold text-[#0b1f24] uppercase block mb-1.5">
                              Reverse Interview Questions
                            </span>
                            <ul className="text-[10.5px] text-[#5b6b70] space-y-1.5 list-disc ml-3.5">
                              {jobAudit.reverse_interview_questions?.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* View B: Career Mock Interview & Scorecard */}
                {mockInterview && (
                  <div className="bg-white border border-[#d2e1dc] rounded-2xl p-5 sm:p-6 shadow-[0_4px_22px_rgba(11,79,74,0.06)] space-y-5">
                    <div className="flex items-center justify-between pb-4 border-b border-[#e3ebe8]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#ccfbf1] grid place-items-center text-[#0f766e] border border-[#99f6e4]">
                          <TrendingUp size={18} />
                        </div>
                        <div>
                          <h2 className="text-[14.5px] font-extrabold text-[#0b1f24]">Mock Technical Interview</h2>
                          <p className="text-[11px] text-[#5b6b70]">
                            {mockInterview.difficulty} Level · {mockInterview.target_role}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={resetAgent}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#f3f7f4] hover:bg-[#e6f4f0] text-[#0f766e] border border-[#d2e1dc] transition-colors cursor-pointer"
                      >
                        Reset Scenario
                      </button>
                    </div>

                    <div className="p-4 bg-[#f3f7f4] rounded-xl border border-[#d2e1dc] space-y-2.5">
                      <span className="text-[10px] font-extrabold text-[#0f766e] uppercase tracking-wider block">
                        Production Challenge
                      </span>
                      <p className="text-[12.5px] text-[#0b1f24] font-medium leading-relaxed">
                        {mockInterview.scenario_prompt}
                      </p>

                      <div className="pt-3 border-t border-[#d2e1dc]">
                        <span className="text-[9.5px] font-bold text-[#5b6b70] uppercase block mb-1.5">
                          Evaluation Rubric Criteria:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {mockInterview.rubric_criteria?.map((rc, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2.5 py-0.5 rounded-md bg-white border border-[#d2e1dc] text-[#1c3238] font-medium shadow-2xs"
                            >
                              ✓ {rc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* HITL CHECKPOINT */}
                    {mockInterview.status === 'awaiting_candidate_answer' ? (
                      <div className="p-4 sm:p-5 bg-gradient-to-br from-[#f3f7f4] to-[#e6f4f0] border-2 border-[#14b8a6] rounded-xl space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0f766e] animate-ping" />
                          <span className="text-[12px] font-extrabold text-[#0b4f4a]">
                             Candidate Response Required
                          </span>
                        </div>
                        <textarea
                          rows={5}
                          value={candidateAnswerText}
                          onChange={(e) => setCandidateAnswerText(e.target.value)}
                          placeholder="Draft your architectural approach, tech stack choices, trade-offs, and failure recovery strategies..."
                          className="w-full p-3 bg-white border border-[#d2e1dc] rounded-lg text-[12px] text-[#0b1f24] outline-none focus:border-[#0f766e] resize-none leading-relaxed"
                        />
                        <button
                          onClick={submitMockAnswer}
                          disabled={!candidateAnswerText.trim() || agentLoading}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white rounded-xl text-[11.5px] font-bold shadow-[0_4px_12px_rgba(15,118,110,0.25)] hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Send size={14} /> Submit Solution for Rubric Evaluation
                        </button>
                      </div>
                    ) : (
                      /* COMPLETED SCORECARD */
                      <div className="pt-4 border-t border-[#e3ebe8] space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#ecfdf5] to-[#f3f7f4] border border-[#99f6e4] rounded-xl">
                          <div>
                            <span className="text-[10px] font-extrabold text-[#065f46] uppercase block mb-0.5">
                              Tech Lead Evaluation Score
                            </span>
                            <span className="text-[22px] font-black text-[#0f766e]">
                              {mockInterview.evaluation_score} / 100
                            </span>
                          </div>
                          <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-[#ccfbf1] text-[#0b4f4a] border border-[#99f6e4]">
                            {mockInterview.evaluation_score && mockInterview.evaluation_score >= 80
                              ? 'Pass · Senior Bar'
                              : 'Needs Optimization'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3.5 bg-white rounded-xl border border-[#bbf7d0]">
                            <span className="text-[10px] font-extrabold text-[#15803d] uppercase block mb-1.5">
                              Key Strengths
                            </span>
                            <ul className="text-[10.5px] text-[#334155] space-y-1.5 list-disc ml-3.5">
                              {mockInterview.strengths?.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-3.5 bg-white rounded-xl border border-[#fecaca]">
                            <span className="text-[10px] font-extrabold text-[#b91c1c] uppercase block mb-1.5">
                              Missing Details / Blindspots
                            </span>
                            <ul className="text-[10.5px] text-[#334155] space-y-1.5 list-disc ml-3.5">
                              {mockInterview.missing_points?.map((m, i) => (
                                <li key={i}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="p-3.5 bg-[#f3f7f4] border border-[#d2e1dc] rounded-xl text-[11.5px] text-[#0b4f4a]">
                          <strong className="block mb-1 text-[10.5px] uppercase font-bold text-[#0f766e]">
                            Principal Tech Lead Verdict:
                          </strong>
                          <p className="italic leading-relaxed">{mockInterview.tech_lead_verdict}</p>
                        </div>

                        <div className="p-3.5 bg-[#f0fdfa] border border-[#99f6e4] rounded-xl text-[11.5px] text-[#0f766e]">
                          <strong className="block mb-1 text-[10.5px] uppercase font-bold text-[#0d9488]">
                            Adaptive Follow-Up Challenge:
                          </strong>
                          <p className="leading-relaxed">{mockInterview.follow_up_challenge}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Normal Messages */}
                {messages.map((msg) =>
                  msg.role === 'user' ? (
                    <article key={msg.id} className="max-w-[85%] ml-auto">
                      <div className="flex items-center justify-end gap-2 text-[9px] mb-1.5">
                        <strong className="text-[11px] font-bold text-[#0b1f24]">You</strong>
                      </div>
                      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white rounded-[15px_3px_15px_15px] text-[12.5px] leading-relaxed shadow-xs whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </article>
                  ) : (
                    <article key={msg.id} className="flex gap-3 max-w-[95%]">
                      <div className="w-8 h-8 rounded-lg bg-[#f3f7f4] border border-[#d2e1dc] grid place-items-center shrink-0 mt-0.5">
                        <svg className="w-[18px] h-[21px] shrink-0" width="18" height="21">
                          <use href="#logo-mark" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-[#0b1f24] block mb-1">Devora</span>

                        {/* Live Web Sources Badges */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2.5">
                            {msg.sources.map((s, idx) => {
                              let domain = '';
                              try {
                                domain = new URL(s.url).hostname.replace('www.', '');
                              } catch {
                                domain = 'web';
                              }
                              return (
                                <a
                                  key={idx}
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f3f7f4] border border-[#d2e1dc] hover:border-[#0f766e] hover:bg-[#e6f4f0] text-[#0b1f24] text-[10.5px] font-medium transition-all no-underline shadow-2xs max-w-[220px]"
                                  title={s.title}
                                >
                                  <Globe size={11} className="text-[#0f766e] shrink-0" />
                                  <span className="truncate font-semibold">{s.title}</span>
                                  <span className="text-[8.5px] text-[#8a989c] shrink-0 font-mono">· {domain}</span>
                                </a>
                              );
                            })}
                          </div>
                        )}

                        <div className="text-[12.5px] leading-relaxed text-[#1c3238] space-y-2">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ href, children, ...props }: any) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#0f766e] hover:text-[#0b4f4a] font-semibold underline underline-offset-2 hover:brightness-110"
                                  {...props}
                                >
                                  {children}
                                </a>
                              ),
                              h1: ({ ...props }) => (
                                <h1 className="text-base font-bold text-[#0b1f24] mt-3 mb-1" {...props} />
                              ),
                              h2: ({ ...props }) => (
                                <h2 className="text-sm font-bold text-[#0b1f24] mt-2.5 mb-1" {...props} />
                              ),
                              h3: ({ ...props }) => (
                                <h3 className="text-xs font-bold text-[#0b1f24] mt-2 mb-0.5" {...props} />
                              ),
                              p: ({ ...props }) => <p className="mb-1.5 leading-relaxed" {...props} />,
                              ul: ({ ...props }) => (
                                <ul className="list-disc list-outside space-y-1 my-1.5 ml-4" {...props} />
                              ),
                              ol: ({ ...props }) => (
                                <ol className="list-decimal list-outside space-y-1 my-1.5 ml-4" {...props} />
                              ),
                              li: ({ ...props }) => <li className="pl-1" {...props} />,
                              strong: ({ ...props }) => <strong className="font-bold text-[#0b1f24]" {...props} />,
                              pre: ({ children, ...props }: any) => (
                                <pre
                                  className="bg-[#0b1f24] text-[#ccfbf1] p-3 rounded-lg overflow-x-auto my-2 text-[12px] font-mono"
                                  {...props}
                                >
                                  {children}
                                </pre>
                              ),
                              code: ({ className, children, ...props }: any) => {
                                const isInline =
                                  !className?.includes('language-') && !String(children).includes('\n');
                                return isInline ? (
                                  <code
                                    className="bg-[#e6f4f0] text-[#0f766e] px-1 py-0.5 rounded text-[11.5px] font-mono"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </article>
                  )
                )}

                {/* Live SSE Streaming Bubble */}
                {isStreaming && (
                  <article className="flex gap-3 max-w-[95%] animate-fade-in">
                    <div className="w-8 h-8 rounded-lg bg-[#f3f7f4] border border-[#d2e1dc] grid place-items-center shrink-0 mt-0.5">
                      <svg className="w-[18px] h-[21px] shrink-0" width="18" height="21">
                        <use href="#logo-mark" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-[#0b1f24] block mb-1">Devora</span>

                      {/* Searching Animation Pill */}
                      {searchStatus && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-2.5 rounded-full bg-[#ccfbf1]/70 border border-[#99f6e4] text-[#0b4f4a] text-[10.5px] font-bold animate-pulse">
                          <Globe size={13} className="text-[#0f766e] animate-spin" />
                          <span>{searchStatus}</span>
                        </div>
                      )}

                      {/* Active Sources Badges while streaming */}
                      {activeSources && activeSources.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                          {activeSources.map((s, idx) => {
                            let domain = '';
                            try {
                              domain = new URL(s.url).hostname.replace('www.', '');
                            } catch {
                              domain = 'web';
                            }
                            return (
                              <a
                                key={idx}
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#d2e1dc] hover:border-[#0f766e] hover:bg-[#f3f7f4] text-[#0b1f24] text-[10.5px] font-medium transition-all no-underline shadow-2xs max-w-[220px]"
                                title={s.title}
                              >
                                <Globe size={11} className="text-[#0f766e] shrink-0" />
                                <span className="truncate font-semibold">{s.title}</span>
                                <span className="text-[8.5px] text-[#8a989c] shrink-0 font-mono">· {domain}</span>
                              </a>
                            );
                          })}
                        </div>
                      )}

                      <div className="text-[12.5px] leading-relaxed text-[#1c3238] space-y-2">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ href, children, ...props }: any) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0f766e] hover:text-[#0b4f4a] font-semibold underline underline-offset-2 hover:brightness-110"
                                {...props}
                              >
                                {children}
                              </a>
                            ),
                            h1: ({ ...props }) => (
                              <h1 className="text-base font-bold text-[#0b1f24] mt-3 mb-1" {...props} />
                            ),
                            h2: ({ ...props }) => (
                              <h2 className="text-sm font-bold text-[#0b1f24] mt-2.5 mb-1" {...props} />
                            ),
                            h3: ({ ...props }) => (
                              <h3 className="text-xs font-bold text-[#0b1f24] mt-2 mb-0.5" {...props} />
                            ),
                            p: ({ ...props }) => <p className="mb-1.5 leading-relaxed" {...props} />,
                            ul: ({ ...props }) => (
                              <ul className="list-disc list-outside space-y-1 my-1.5 ml-4" {...props} />
                            ),
                            ol: ({ ...props }) => (
                              <ol className="list-decimal list-outside space-y-1 my-1.5 ml-4" {...props} />
                            ),
                            li: ({ ...props }) => <li className="pl-1" {...props} />,
                            strong: ({ ...props }) => <strong className="font-bold text-[#0b1f24]" {...props} />,
                            pre: ({ children, ...props }: any) => (
                              <pre
                                className="bg-[#0b1f24] text-[#ccfbf1] p-3 rounded-lg overflow-x-auto my-2 text-[12px] font-mono"
                                {...props}
                              >
                                {children}
                              </pre>
                            ),
                            code: ({ className, children, ...props }: any) => {
                              const isInline =
                                !className?.includes('language-') && !String(children).includes('\n');
                              return isInline ? (
                                <code
                                  className="bg-[#e6f4f0] text-[#0f766e] px-1 py-0.5 rounded text-[11.5px] font-mono"
                                  {...props}
                                >
                                  {children}
                                </code>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {streamingText || 'Thinking...'}
                        </ReactMarkdown>
                        <span className="inline-block w-1.5 h-3.5 bg-[#0f766e] ml-1 animate-pulse align-middle" />
                      </div>
                    </div>
                  </article>
                )}
              </section>
            ) : (
              /* View 2: Empty/New Chat Welcome Screen */
              <section
                id="new-conversation"
                aria-labelledby="new-chat-title"
                className="max-w-[720px] mx-auto py-7 px-4 sm:py-10 sm:px-6 md:py-12 md:px-8 text-center"
              >
                {/* Active Mode Pill Badge */}
                {topic && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-[#ccfbf1]/60 border border-[#99f6e4] text-[#0f766e] text-[10.5px] font-bold shadow-2xs">
                    {topic === 'jobs' ? (
                      <BriefcaseBusiness size={13} className="text-[#0f766e]" />
                    ) : (
                      <TrendingUp size={13} className="text-[#0f766e]" />
                    )}
                    <span>{topic === 'jobs' ? 'Job Intelligence Mode' : 'Career & Mock Interview Coach'}</span>
                    <Link
                      href="/chat"
                      className="ml-1 text-[#5b6b70] hover:text-[#0b1f24] text-[11px] no-underline font-bold"
                      title="Reset to standard chat"
                    >
                      ✕
                    </Link>
                  </div>
                )}

                <span className="w-[56px] h-[56px] sm:w-[70px] sm:h-[70px] rounded-[18px] sm:rounded-[22px] border border-[#d2e1dc] bg-gradient-to-br from-white to-[#f3f7f4] shadow-[0_8px_25px_rgba(11,79,74,0.08)] grid place-items-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-[34px] h-[39px] shrink-0" width="34" height="39">
                    <use href="#logo-mark" />
                  </svg>
                </span>

                <span className="text-[7.5px] sm:text-[8.5px] font-extrabold tracking-[1.6px] text-[#0f766e] uppercase">
                  {topic === 'jobs'
                    ? 'TARGET ROLE & INTERVIEW BREAKDOWN'
                    : topic === 'career'
                      ? 'TECHNICAL PREP & CAREER STRATEGY'
                      : 'YOUR NEXT CHAPTER STARTS HERE'}
                </span>

                <h1
                  id="new-chat-title"
                  className="text-[24px] sm:text-[28px] md:text-[34px] leading-[1.25] font-extrabold tracking-[-1.4px] my-2.5 sm:my-3 text-[#0b1f24]"
                >
                  {topic === 'jobs' ? (
                    <>
                      Decode the role.
                      <br />
                      <em className="accent-word not-italic text-[#0f766e]">Ace the interview.</em>
                    </>
                  ) : topic === 'career' ? (
                    <>
                      Sharpen your skills.
                      <br />
                      <em className="accent-word not-italic text-[#0f766e]">Own your next chapter.</em>
                    </>
                  ) : (
                    <>
                      A clearer thought.
                      <br />
                      <em className="accent-word not-italic text-[#0f766e]">A brighter next step.</em>
                    </>
                  )}
                </h1>

                <p className="text-[11px] sm:text-[12px] md:text-[13px] leading-[1.8] text-[#5b6b70] max-w-[520px] mx-auto">
                  {topic === 'jobs'
                    ? 'Paste any job description to decode hidden tech stack requirements, predict interview questions, and assess role fit.'
                    : topic === 'career'
                      ? 'Interactive mock System Design interviews, behavioral STAR practice, and tailored engineering career roadmaps.'
                      : 'Bring your questions, documents, and ambitions. Explore a sample conversation to see what’s possible.'}
                </p>

                {/* Dynamic 2x2 Starter Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-left mt-5 sm:mt-7">
                  {topic === 'jobs' ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setInputPrompt(
                            'Here is a job description. Analyze it and tell me: 1. Must-have skills vs nice-to-haves, 2. Core business problem this role solves, 3. Key strengths I should highlight.'
                          )
                        }
                        className="relative border border-[#d2e1dc] rounded-xl p-3.5 sm:p-4 bg-white hover:bg-[#f3f7f4] hover:border-[#14b8a6] hover:-translate-y-[1px] transition-all text-left shadow-2xs group cursor-pointer block w-full"
                      >
                        <BriefcaseBusiness
                          size={19}
                          className="w-[18px] h-[18px] text-[#0f766e] mb-2.5 group-hover:text-[#0b4f4a] transition-colors"
                        />
                        <strong className="block text-[11px] sm:text-[11.5px] text-[#0b1f24] font-bold">
                          Deconstruct a Job Description
                        </strong>
                        <span className="block text-[9.5px] sm:text-[10px] text-[#5b6b70] leading-[1.7] mt-1">
                          Separate true requirements from buzzwords.
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="absolute right-3.5 top-3.5 text-[#8a989c] group-hover:text-[#0f766e]"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setInputPrompt(
                            'What are the top 5 technical and architectural questions interviewers typically ask for this specific tech stack and role?'
                          )
                        }
                        className="relative border border-[#d2e1dc] rounded-xl p-3.5 sm:p-4 bg-white hover:bg-[#f3f7f4] hover:border-[#14b8a6] hover:-translate-y-[1px] transition-all text-left shadow-2xs group cursor-pointer block w-full"
                      >
                        <Sparkles
                          size={19}
                          className="w-[18px] h-[18px] text-[#f59e0b] mb-2.5 group-hover:text-[#0f766e] transition-colors"
                        />
                        <strong className="block text-[11px] sm:text-[11.5px] text-[#0b1f24] font-bold">
                          Predict Interview Questions
                        </strong>
                        <span className="block text-[9.5px] sm:text-[10px] text-[#5b6b70] leading-[1.7] mt-1">
                          Anticipate live coding and architecture topics.
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="absolute right-3.5 top-3.5 text-[#8a989c] group-hover:text-[#0f766e]"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setInputPrompt(
                            'How can I audit my skills against this job description to see what critical gaps I need to address?'
                          )
                        }
                        className="relative border border-[#d2e1dc] rounded-xl p-3.5 sm:p-4 bg-white hover:bg-[#f3f7f4] hover:border-[#14b8a6] hover:-translate-y-[1px] transition-all text-left shadow-2xs group cursor-pointer block w-full"
                      >
                        <FileCheck2
                          size={19}
                          className="w-[18px] h-[18px] text-[#0f766e] mb-2.5 group-hover:text-[#0b4f4a] transition-colors"
                        />
                        <strong className="block text-[11px] sm:text-[11.5px] text-[#0b1f24] font-bold">
                          Skills Gap Assessment
                        </strong>
                        <span className="block text-[9.5px] sm:text-[10px] text-[#5b6b70] leading-[1.7] mt-1">
                          Identify your strongest edges and blind spots.
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="absolute right-3.5 top-3.5 text-[#8a989c] group-hover:text-[#0f766e]"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setInputPrompt(
                            'What are potential red flags or unrealistic expectations I should watch out for in this job posting?'
                          )
                        }
                        className="relative border border-[#d2e1dc] rounded-xl p-3.5 sm:p-4 bg-white hover:bg-[#f3f7f4] hover:border-[#14b8a6] hover:-translate-y-[1px] transition-all text-left shadow-2xs group cursor-pointer block w-full"
                      >
                        <Lightbulb
                          size={19}
                          className="w-[18px] h-[18px] text-[#f59e0b] mb-2.5 group-hover:text-[#0f766e] transition-colors"
                        />
                        <strong className="block text-[11px] sm:text-[11.5px] text-[#0b1f24] font-bold">
                          Spot Red Flags & Scope Creep
                        </strong>
                        <span className="block text-[9.5px] sm:text-[10px] text-[#5b6b70] leading-[1.7] mt-1">
                          Know the culture and expectations before applying.
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="absolute right-3.5 top-3.5 text-[#8a989c] group-hover:text-[#0f766e]"
                        />
                      </button>
                    </>
                  ) : topic === 'career' ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setInputPrompt(
                            'Conduct a realistic mock System Design interview with me. Start with a real-world scenario (like building a distributed chat or URL shortener), ask one question at a time, and evaluate my choices.'
                          )
                        }
                        className="relative border border-[#d2e1dc] rounded-xl p-3.5 sm:p-4 bg-white hover:bg-[#f3f7f4] hover:border-[#14b8a6] hover:-translate-y-[1px] transition-all text-left shadow-2xs group cursor-pointer block w-full"
                      >
                        <Layers2
                          size={19}
                          className="w-[18px] h-[18px] text-[#0f766e] mb-2.5 group-hover:text-[#0b4f4a] transition-colors"
                        />
                        <strong className="block text-[11px] sm:text-[11.5px] text-[#0b1f24] font-bold">
                          Mock System Design Interview
                        </strong>
                        <span className="block text-[9.5px] sm:text-[10px] text-[#5b6b70] leading-[1.7] mt-1">
                          Step-by-step interactive architectural challenge.
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="absolute right-3.5 top-3.5 text-[#8a989c] group-hover:text-[#0f766e]"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setInputPrompt(
                            'Ask me a challenging behavioral interview question (e.g. handling technical conflict or project failure) and critique my answer using the STAR methodology.'
                          )
                        }
                        className="relative border border-[#d2e1dc] rounded-xl p-3.5 sm:p-4 bg-white hover:bg-[#f3f7f4] hover:border-[#14b8a6] hover:-translate-y-[1px] transition-all text-left shadow-2xs group cursor-pointer block w-full"
                      >
                        <TrendingUp
                          size={19}
                          className="w-[18px] h-[18px] text-[#0f766e] mb-2.5 group-hover:text-[#0b4f4a] transition-colors"
                        />
                        <strong className="block text-[11px] sm:text-[11.5px] text-[#0b1f24] font-bold">
                          Behavioral STAR Practice
                        </strong>
                        <span className="block text-[9.5px] sm:text-[10px] text-[#5b6b70] leading-[1.7] mt-1">
                          Structure your leadership & impact stories.
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="absolute right-3.5 top-3.5 text-[#8a989c] group-hover:text-[#0f766e]"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setInputPrompt(
                            'I am currently a full-stack engineer. What is a 3-month concrete roadmap to master Generative AI, Hybrid RAG, and LangGraph Agents?'
                          )
                        }
                        className="relative border border-[#d2e1dc] rounded-xl p-3.5 sm:p-4 bg-white hover:bg-[#f3f7f4] hover:border-[#14b8a6] hover:-translate-y-[1px] transition-all text-left shadow-2xs group cursor-pointer block w-full"
                      >
                        <Sparkles
                          size={19}
                          className="w-[18px] h-[18px] text-[#f59e0b] mb-2.5 group-hover:text-[#0f766e] transition-colors"
                        />
                        <strong className="block text-[11px] sm:text-[11.5px] text-[#0b1f24] font-bold">
                          Engineering Career Roadmap
                        </strong>
                        <span className="block text-[9.5px] sm:text-[10px] text-[#5b6b70] leading-[1.7] mt-1">
                          Structured transition plan into high-paying domains.
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="absolute right-3.5 top-3.5 text-[#8a989c] group-hover:text-[#0f766e]"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setInputPrompt(
                            'I received a competitive software engineering offer. How can I professionally negotiate for a 15% salary increase or higher equity grant without risking the offer?'
                          )
                        }
                        className="relative border border-[#d2e1dc] rounded-xl p-3.5 sm:p-4 bg-white hover:bg-[#f3f7f4] hover:border-[#14b8a6] hover:-translate-y-[1px] transition-all text-left shadow-2xs group cursor-pointer block w-full"
                      >
                        <ContactRound
                          size={19}
                          className="w-[18px] h-[18px] text-[#0f766e] mb-2.5 group-hover:text-[#0b4f4a] transition-colors"
                        />
                        <strong className="block text-[11px] sm:text-[11.5px] text-[#0b1f24] font-bold">
                          Offer Negotiation Strategy
                        </strong>
                        <span className="block text-[9.5px] sm:text-[10px] text-[#5b6b70] leading-[1.7] mt-1">
                          Scripts and email templates for higher comp.
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="absolute right-3.5 top-3.5 text-[#8a989c] group-hover:text-[#0f766e]"
                        />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setInputPrompt(
                            'Can you summarize the key takeaways and main points from my uploaded document?'
                          )
                        }
                        className="relative border border-[#d2e1dc] rounded-xl p-3.5 sm:p-4 bg-white hover:bg-[#f3f7f4] hover:border-[#14b8a6] hover:-translate-y-[1px] transition-all text-left shadow-2xs group cursor-pointer no-underline block w-full"
                      >
                        <FileText
                          size={19}
                          className="w-[18px] h-[18px] text-[#0f766e] mb-2.5 group-hover:text-[#0b4f4a] transition-colors"
                        />
                        <strong className="block text-[11px] sm:text-[11.5px] text-[#0b1f24] font-bold">
                          Make sense of a document
                        </strong>
                        <span className="block text-[9.5px] sm:text-[10px] text-[#5b6b70] leading-[1.7] mt-1">
                          Find the key ideas, without the overload.
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="absolute right-3.5 top-3.5 text-[#8a989c] group-hover:text-[#0f766e]"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setInputPrompt(
                            'Could you review my resume and suggest improvements for formatting and impact?'
                          )
                        }
                        className="relative border border-[#d2e1dc] rounded-xl p-3.5 sm:p-4 bg-white hover:bg-[#f3f7f4] hover:border-[#14b8a6] hover:-translate-y-[1px] transition-all text-left shadow-2xs group cursor-pointer no-underline block w-full"
                      >
                        <ContactRound
                          size={19}
                          className="w-[18px] h-[18px] text-[#0f766e] mb-2.5 group-hover:text-[#0b4f4a] transition-colors"
                        />
                        <strong className="block text-[11px] sm:text-[11.5px] text-[#0b1f24] font-bold">
                          Give my resume a fresh look
                        </strong>
                        <span className="block text-[9.5px] sm:text-[10px] text-[#5b6b70] leading-[1.7] mt-1">
                          Tell a clearer story about your experience.
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="absolute right-3.5 top-3.5 text-[#8a989c] group-hover:text-[#0f766e]"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setInputPrompt(
                            'What are the key technical skills and trends in software engineering right now?'
                          )
                        }
                        className="relative border border-[#d2e1dc] rounded-xl p-3.5 sm:p-4 bg-white hover:bg-[#f3f7f4] hover:border-[#14b8a6] hover:-translate-y-[1px] transition-all text-left shadow-2xs group cursor-pointer no-underline block w-full"
                      >
                        <BriefcaseBusiness
                          size={19}
                          className="w-[18px] h-[18px] text-[#0f766e] mb-2.5 group-hover:text-[#0b4f4a] transition-colors"
                        />
                        <strong className="block text-[11px] sm:text-[11.5px] text-[#0b1f24] font-bold">
                          Find my next opportunity
                        </strong>
                        <span className="block text-[9.5px] sm:text-[10px] text-[#5b6b70] leading-[1.7] mt-1">
                          Understand what makes a role the right fit.
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="absolute right-3.5 top-3.5 text-[#8a989c] group-hover:text-[#0f766e]"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setInputPrompt(
                            'Give me a mock technical interview question and evaluate my answer step by step.'
                          )
                        }
                        className="relative border border-[#d2e1dc] rounded-xl p-3.5 sm:p-4 bg-white hover:bg-[#f3f7f4] hover:border-[#14b8a6] hover:-translate-y-[1px] transition-all text-left shadow-2xs group cursor-pointer no-underline block w-full"
                      >
                        <TrendingUp
                          size={19}
                          className="w-[18px] h-[18px] text-[#0f766e] mb-2.5 group-hover:text-[#0b4f4a] transition-colors"
                        />
                        <strong className="block text-[11px] sm:text-[11.5px] text-[#0b1f24] font-bold">
                          Prepare for what’s next
                        </strong>
                        <span className="block text-[9.5px] sm:text-[10px] text-[#5b6b70] leading-[1.7] mt-1">
                          Go into your next conversation with clarity.
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="absolute right-3.5 top-3.5 text-[#8a989c] group-hover:text-[#0f766e]"
                        />
                      </button>
                    </>
                  )}
                </div>
              </section>
            )}
          </div>


          <footer className="p-2 sm:p-3 md:px-8 md:py-4 bg-gradient-to-b from-white to-[#faf9fd] border-t border-[#e3ebe8] shrink-0 z-10">
            <div className="max-w-[710px] min-[1450px]:max-w-[760px] mx-auto border border-[#d2e1dc] shadow-[0_4px_18px_rgba(11,79,74,0.05)] focus-within:border-[#14b8a6] focus-within:ring-2 focus-within:ring-[#ccfbf1]/50 rounded-[13px] md:rounded-[15px] p-1.5 sm:p-2 bg-white transition-all">
              <label htmlFor="message-draft" className="sr-only">
                Message Devora
              </label>

              <textarea
                id="message-draft"
                rows={2}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  topic === 'jobs'
                    ? 'Paste a Job Description or ask about interview requirements… (Press Enter to send)'
                    : topic === 'career'
                      ? 'Ask for a mock interview, STAR answers, or career roadmap… (Press Enter to send)'
                      : 'Message Devora… (Press Enter to send)'
                }
                className="w-full block resize-none border-0 bg-transparent outline-none px-2 pt-1.5 pb-1 text-[13px] leading-[1.6] text-[#0b1f24] placeholder:text-[#8a989c] min-h-[50px] sm:min-h-[58px]"
              />

              <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 px-1 pb-1">
                {/* Left Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Tool Selector Dropdown Container */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setModeMenuOpen(!modeMenuOpen)}
                      className={`flex items-center gap-1 sm:gap-1.5 py-1 px-2 rounded-lg text-[8.5px] sm:text-[9.5px] font-bold transition-all cursor-pointer ${topic === 'jobs'
                          ? 'bg-[#ccfbf1] text-[#0b4f4a] border border-[#99f6e4] hover:bg-[#bbf7ed]'
                          : topic === 'career'
                            ? 'bg-[#ccfbf1] text-[#0b4f4a] border border-[#99f6e4] hover:bg-[#bbf7ed]'
                            : 'text-[#0f766e] bg-[#f3f7f4] border border-[#d2e1dc] hover:bg-[#e6f4f0]'
                        }`}
                    >
                      {topic === 'jobs' ? (
                        <BriefcaseBusiness size={13} className="w-[13px] h-[13px] text-[#0f766e]" />
                      ) : topic === 'career' ? (
                        <TrendingUp size={13} className="w-[13px] h-[13px] text-[#0f766e]" />
                      ) : (
                        <Layers2 size={13} className="w-[13px] h-[13px] text-[#0f766e]" />
                      )}
                      <span id="composer-tool-name">
                        {topic === 'jobs'
                          ? 'Job Intelligence Mode'
                          : topic === 'career'
                            ? 'Career Coach Mode'
                            : 'Devora Auto'}
                      </span>
                      <ChevronDown
                        size={11}
                        className={`w-[11px] h-[11px] text-[#8a989c] transition-transform duration-200 ${modeMenuOpen ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    {/* Pop-up Mode Menu */}
                    {modeMenuOpen && (
                      <>
                        {/* Backdrop to close on click outside */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setModeMenuOpen(false)}
                        />

                        <div className="absolute bottom-full left-0 mb-2 w-[245px] bg-white border border-[#d2e1dc] rounded-2xl shadow-[0_12px_36px_rgba(11,79,74,0.14)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                          <span className="block text-[8.5px] font-extrabold uppercase tracking-wider text-[#8a989c] px-2.5 py-1.5">
                            Switch Chat Mode
                          </span>

                          {/* 1. Devora Auto */}
                          <button
                            type="button"
                            onClick={() => handleSwitchMode('auto')}
                            className={`flex items-start gap-2.5 w-full p-2 rounded-xl text-left transition-colors cursor-pointer ${!topic
                                ? 'bg-[#e6f4f0] text-[#0b4f4a] font-bold'
                                : 'hover:bg-[#f3f7f4] text-[#2c3b40]'
                              }`}
                          >
                            <div className="w-6 h-6 rounded-lg bg-[#ccfbf1] grid place-items-center text-[#0f766e] shrink-0 mt-0.5">
                              <Sparkles size={12} className="text-[#0f766e]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <strong className="text-[11px] font-bold">Devora Auto</strong>
                                {!topic && <Check size={12} className="text-[#0f766e]" />}
                              </div>
                              <span className="block text-[9px] text-[#718287] leading-tight mt-0.5">
                                General AI & hybrid doc assistant
                              </span>
                            </div>
                          </button>

                          {/* 2. Job Intelligence */}
                          <button
                            type="button"
                            onClick={() => handleSwitchMode('jobs')}
                            className={`flex items-start gap-2.5 w-full p-2 rounded-xl text-left transition-colors cursor-pointer mt-0.5 ${topic === 'jobs'
                                ? 'bg-[#e6f4f0] text-[#0b4f4a] font-bold'
                                : 'hover:bg-[#f3f7f4] text-[#2c3b40]'
                              }`}
                          >
                            <div className="w-6 h-6 rounded-lg bg-[#ccfbf1] grid place-items-center text-[#0f766e] shrink-0 mt-0.5">
                              <BriefcaseBusiness size={12} className="text-[#0f766e]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <strong className="text-[11px] font-bold">Job Intelligence</strong>
                                {topic === 'jobs' && <Check size={12} className="text-[#0f766e]" />}
                              </div>
                              <span className="block text-[9px] text-[#718287] leading-tight mt-0.5">
                                JD audit & gap analysis
                              </span>
                            </div>
                          </button>

                          {/* 3. Career Coach */}
                          <button
                            type="button"
                            onClick={() => handleSwitchMode('career')}
                            className={`flex items-start gap-2.5 w-full p-2 rounded-xl text-left transition-colors cursor-pointer mt-0.5 ${topic === 'career'
                                ? 'bg-[#e6f4f0] text-[#0b4f4a] font-bold'
                                : 'hover:bg-[#f3f7f4] text-[#2c3b40]'
                              }`}
                          >
                            <div className="w-6 h-6 rounded-lg bg-[#ccfbf1] grid place-items-center text-[#0f766e] shrink-0 mt-0.5">
                              <TrendingUp size={12} className="text-[#0f766e]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <strong className="text-[11px] font-bold">Career Coach</strong>
                                {topic === 'career' && <Check size={12} className="text-[#0f766e]" />}
                              </div>
                              <span className="block text-[9px] text-[#718287] leading-tight mt-0.5">
                                Mock interview & rubric scoring
                              </span>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="hidden min-[420px]:flex items-center gap-1 sm:gap-1.5 text-[8.5px] sm:text-[9.5px] font-semibold text-[#5b6b70]">
                    <Sparkles size={12} className="w-3 h-3 text-[#f59e0b]" />
                    Devora Auto
                  </span>

                  <button
                    type="button"
                    disabled={!inputPrompt.trim() || isStreaming || agentLoading || !user?.id}
                    onClick={handleSendMessage}
                    className="w-[29px] h-[29px] sm:w-[32px] sm:h-[32px] grid place-items-center rounded-[8px] sm:rounded-[9px] bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white shadow-[0_3px_10px_rgba(15,118,110,0.25)] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all cursor-pointer"
                    aria-label="Send message"
                  >
                    {isStreaming || agentLoading ? (
                      <Loader2 size={15} className="animate-spin text-white" />
                    ) : (
                      <ArrowUp size={16} className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="flex items-center justify-center gap-1 text-[7px] sm:text-[8px] md:text-[8.5px] text-[#8a989c] leading-relaxed text-center mt-2 font-medium">
              <Info size={10} className="w-2.5 h-2.5 text-[#0f766e]" />
              AI-generated responses powered by Gemini. Always verify important information.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#fbfaf6] flex items-center justify-center text-[#0f766e]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f766e]" />
        </div>
      }
    >
      <ChatView />
    </Suspense>
  );
}
