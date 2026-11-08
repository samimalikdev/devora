'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import {
  Sparkles,
  Zap,
  Shield,
  Cpu,
  Code2,
  BookOpen,
  Target,
  Users,
  Award,
  ExternalLink,
  Mail,
  ArrowRight,
} from 'lucide-react';

function GithubIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#0b1f24] font-['Manrope',sans-serif] selection:bg-[#ccfbf1] selection:text-[#0f766e] flex flex-col">
      <header className="sticky top-0 z-50 bg-[#fbfaf6]/80 backdrop-blur-md border-b border-[#e3ebe8] h-[68px] sm:h-[72px] transition-all">
        <div className="w-[min(1240px,calc(100%-40px))] md:w-[min(1240px,calc(100%-64px))] mx-auto h-full flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-[9px] text-[25px] sm:text-[27px] font-extrabold tracking-[-0.05em] text-ink select-none no-underline"
            aria-label="Devora home"
          >
            <svg className="shrink-0 drop-shadow-[0_4px_6px_rgba(15,118,110,0.18)]" width="28" height="32">
              <use href="#logo-mark" />
            </svg>
            <span>
              Devora<i className="not-italic text-amber-500 -ml-1">.</i>
            </span>
          </Link>

          <nav className="hidden min-[900px]:flex items-center gap-1" aria-label="Primary">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-full text-[13px] font-bold text-ink-2 hover:bg-tint hover:text-teal-900 transition-colors no-underline"
            >
              Home
            </Link>
            <Link
              href="/#features"
              className="px-3.5 py-2 rounded-full text-[13px] font-bold text-ink-2 hover:bg-tint hover:text-teal-900 transition-colors no-underline"
            >
              Features
            </Link>
            <Link
              href="/#solutions"
              className="px-3.5 py-2 rounded-full text-[13px] font-bold text-ink-2 hover:bg-tint hover:text-teal-900 transition-colors no-underline"
            >
              Solutions
            </Link>
            <Link
              href="/documents"
              className="px-3.5 py-2 rounded-full text-[13px] font-bold text-ink-2 hover:bg-tint hover:text-teal-900 transition-colors no-underline"
            >
              Docs
            </Link>
            <Link
              href="/about"
              className="relative px-3.5 py-2 rounded-full text-[13px] font-bold text-teal-800 no-underline after:content-[''] after:absolute after:left-1/2 after:bottom-px after:w-4 after:h-[3px] after:rounded-full after:-translate-x-1/2 after:bg-gradient-to-r after:from-teal-500 after:to-amber-400"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="px-3.5 py-2 rounded-full text-[13px] font-bold text-ink-2 hover:bg-tint hover:text-teal-900 transition-colors no-underline"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 min-h-[40px] px-4.5 rounded-full text-[12.5px] font-extrabold tracking-[-0.01em] whitespace-nowrap text-white bg-gradient-to-r from-teal-700 to-teal-900 shadow-[0_8px_20px_-8px_rgba(15,118,110,0.6)] hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-10px_rgba(15,118,110,0.65)] transition-all duration-300 no-underline cursor-pointer"
              >
                <span>Dashboard</span>
                <span className="text-[16px] leading-none transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">→</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center justify-center min-h-[40px] px-4 rounded-full text-[12.5px] font-extrabold tracking-[-0.01em] whitespace-nowrap text-ink bg-white/70 border border-line-2 backdrop-blur-sm hover:-translate-y-0.5 hover:border-teal-500 hover:shadow-[0_10px_24px_-12px_rgba(15,118,110,0.35)] transition-all duration-300 no-underline cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 min-h-[40px] px-4 rounded-full text-[12.5px] font-extrabold tracking-[-0.01em] whitespace-nowrap text-white bg-gradient-to-r from-teal-700 to-teal-900 shadow-[0_8px_20px_-8px_rgba(15,118,110,0.6)] hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-10px_rgba(15,118,110,0.65)] transition-all duration-300 no-underline cursor-pointer"
                >
                  <span>Get Started</span>
                  <span className="text-[16px] leading-none transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                </Link>
              </>
            )}

            <button
              id="menu-toggle"
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex min-[900px]:hidden flex-col justify-center gap-1 w-10 h-10 rounded-full border border-line-2 bg-white cursor-pointer px-[11px]"
            >
              <span className={`h-[2px] rounded-full bg-ink transition-all duration-300 ${menuOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
              <span className={`h-[2px] rounded-full bg-ink transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-[2px] rounded-full bg-ink transition-all duration-300 ${menuOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className={`absolute left-0 right-0 top-full flex flex-col gap-1 p-[14px_20px_20px] bg-[#fbfaf6]/95 border-b border-line shadow-lg transition-all duration-300 ${
            menuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-2'
          }`}
        >
          <Link href="/" onClick={closeMenu} className="p-[12px_14px] rounded-r-sm text-[15px] font-bold text-ink hover:bg-tint hover:text-teal-900 no-underline">Home</Link>
          <Link href="/#features" onClick={closeMenu} className="p-[12px_14px] rounded-r-sm text-[15px] font-bold text-ink hover:bg-tint hover:text-teal-900 no-underline">Features</Link>
          <Link href="/#solutions" onClick={closeMenu} className="p-[12px_14px] rounded-r-sm text-[15px] font-bold text-ink hover:bg-tint hover:text-teal-900 no-underline">Solutions</Link>
          <Link href="/documents" onClick={closeMenu} className="p-[12px_14px] rounded-r-sm text-[15px] font-bold text-ink hover:bg-tint hover:text-teal-900 no-underline">Docs</Link>
          <Link href="/about" onClick={closeMenu} className="p-[12px_14px] rounded-r-sm text-[15px] font-bold text-teal-800 bg-tint no-underline">About Us</Link>
          <Link href="/contact" onClick={closeMenu} className="p-[12px_14px] rounded-r-sm text-[15px] font-bold text-ink hover:bg-tint hover:text-teal-900 no-underline">Contact</Link>
          
          {user ? (
            <Link
              href="/dashboard"
              onClick={closeMenu}
              className="group inline-flex items-center justify-center gap-2 min-h-[42px] px-5 rounded-full text-[13px] font-extrabold text-white bg-gradient-to-r from-teal-700 to-teal-900 shadow-[0_8px_20px_-8px_rgba(15,118,110,0.6)] no-underline mt-2"
            >
              <span>Go to Dashboard</span>
              <span className="text-[18px] leading-none transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">→</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={closeMenu}
                className="inline-flex items-center justify-center min-h-[42px] px-5 rounded-full text-[13px] font-extrabold text-ink bg-white/70 border border-line-2 backdrop-blur-sm no-underline mt-2"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={closeMenu}
                className="group inline-flex items-center justify-center gap-2 min-h-[42px] px-5 rounded-full text-[13px] font-extrabold text-white bg-gradient-to-r from-teal-700 to-teal-900 shadow-[0_8px_20px_-8px_rgba(15,118,110,0.6)] no-underline mt-1"
              >
                <span>Get Started</span>
                <span className="text-[18px] leading-none transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </Link>
            </>
          )}
        </nav>
      </header>

      
      <main className="flex-1">
        <section className="relative pt-16 sm:pt-20 pb-12 sm:pb-16 overflow-hidden border-b border-[#e3ebe8]">
          <div className="absolute inset-0 pointer-events-none -z-10">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#ccfbf1]/50 to-[#fde68a]/30 rounded-full blur-3xl opacity-70" />
          </div>

          <div className="w-[min(1240px,calc(100%-36px))] md:w-[min(1240px,calc(100%-60px))] mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-extrabold tracking-wider uppercase bg-[#ccfbf1] border border-[#99f6e4] text-[#0f766e] mb-5 shadow-2xs">
              <Sparkles size={11} className="text-[#f59e0b]" />
              Background & Architecture
            </span>

            <h1 className="text-[34px] sm:text-[46px] lg:text-[54px] font-extrabold tracking-[-0.04em] text-[#0b1f24] leading-[1.12] max-w-[850px] mx-auto mb-6">
              Fast Document Intelligence and Technical Career Tools.
            </h1>

            <p className="text-[14.5px] sm:text-[16px] text-[#5b6b70] max-w-[680px] mx-auto leading-relaxed font-medium mb-8">
              Devora brings fast local document retrieval, realistic mock interviews, and resume analysis into a single, focused workspace.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white text-[13px] font-extrabold shadow-[0_6px_20px_rgba(15,118,110,0.3)] hover:brightness-110 hover:-translate-y-0.5 transition-all no-underline"
              >
                <span>Join Devora Workspace</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-[#d2e1dc] text-[#0b1f24] text-[13px] font-bold hover:bg-[#f3f7f4] hover:border-[#14b8a6] transition-all no-underline"
              >
                <span>Get in Touch</span>
              </Link>
            </div>
          </div>
        </section>

      
        <section className="py-16 sm:py-20 bg-white border-b border-[#e3ebe8]">
          <div className="w-[min(1240px,calc(100%-36px))] md:w-[min(1240px,calc(100%-60px))] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr] gap-10 lg:gap-16 items-center">
              {/* Founder Avatar & Visual Card */}
              <div className="relative">
                <div className="relative mx-auto max-w-[420px] rounded-[24px] p-6 sm:p-8 bg-gradient-to-br from-[#fbfaf6] to-[#f3f7f4] border border-[#d2e1dc] shadow-[0_12px_40px_rgba(11,79,74,0.06)] overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#5eead4]/30 to-transparent rounded-full blur-2xl pointer-events-none" />

                  {/* Initials Banner / Profile Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0d9488] to-[#0b4f4a] text-white flex items-center justify-center text-[22px] font-black tracking-tight shadow-md border border-[#5eead4]/40">
                      SM
                    </div>
                    <div>
                      <h3 className="text-[19px] font-extrabold text-[#0b1f24] m-0">Sami Malik</h3>
                      <p className="text-[12px] font-bold text-[#0f766e] m-0 mt-0.5">Founder & Systems Architect</p>
                    </div>
                  </div>

                  {/* Highlights Pill Grid */}
                  <div className="space-y-2.5 text-[11.5px] font-medium text-[#5b6b70] mb-6">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#e3ebe8]">
                      <Cpu size={14} className="text-[#0f766e] shrink-0" />
                      <span>Local CUDA GPU RAG & Embedding Engineering</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#e3ebe8]">
                      <Code2 size={14} className="text-[#0f766e] shrink-0" />
                      <span>Full-Stack Next.js 15, FastAPI & Vector Retrieval</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#e3ebe8]">
                      <Target size={14} className="text-[#0f766e] shrink-0" />
                      <span>Document RAG, Mock Interviews & Resume Auditing</span>
                    </div>
                  </div>

                  {/* Social Buttons */}
                  <div className="pt-4 border-t border-[#e3ebe8] flex items-center gap-2">
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-[#d2e1dc] text-[#0b1f24] text-[11px] font-bold hover:bg-[#f3f7f4] hover:text-[#0f766e] transition-colors no-underline"
                    >
                      <GithubIcon />
                      <span>GitHub</span>
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-[#d2e1dc] text-[#0b1f24] text-[11px] font-bold hover:bg-[#f3f7f4] hover:text-[#0f766e] transition-colors no-underline"
                    >
                      <LinkedinIcon />
                      <span>LinkedIn</span>
                    </a>
                    <Link
                      href="/contact"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#ccfbf1] border border-[#99f6e4] text-[#0f766e] text-[11px] font-bold hover:bg-[#99f6e4] transition-colors no-underline"
                    >
                      <Mail size={13} />
                      <span>Message</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Founder Narrative */}
              <div>
                <span className="text-[10px] tracking-[1.5px] uppercase font-extrabold text-[#0f766e] mb-2 block">
                  ARCHITECTURE & PURPOSE
                </span>
                <h2 className="text-[26px] sm:text-[34px] font-extrabold text-[#0b1f24] tracking-[-0.03em] leading-tight mb-5">
                  Built for Engineers Who Need Fast, Verifiable Answers.
                </h2>

                <div className="space-y-4 text-[13.5px] sm:text-[14px] leading-[1.7] text-[#5b6b70] font-medium">
                  <p>
                    Devora was founded by <strong>Sami Malik</strong> to give software engineers and students tools that provide verifiable, sub-second responses without switching between separate utilities.
                  </p>
                  <p>
                    Most AI workflows are fragmented across separate tools—one tab for PDF search, another for interview prep, and disconnected chat windows with no memory. Devora integrates these tasks into a single platform backed by local GPU embeddings, page-level citations, and interactive technical interview simulations.
                  </p>
                  <p>
                    &ldquo;When studying a 400-page systems textbook or preparing for a technical interview, guessing and hallucinations waste time. Devora provides answers grounded in exact page references so you can verify claims instantly.&rdquo;
                  </p>
                </div>

                <div className="mt-7 pt-6 border-t border-[#e3ebe8] flex flex-wrap items-center gap-6 text-[12px] text-[#0b1f24] font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]" />
                    <span>Active System Development</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                    <span>Real-Time Citations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0f766e]" />
                    <span>Privacy & Local Acceleration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-[#fbfaf6]">
          <div className="w-[min(1240px,calc(100%-36px))] md:w-[min(1240px,calc(100%-60px))] mx-auto">
            <div className="text-center max-w-[620px] mx-auto mb-12 sm:mb-16">
              <span className="text-[10px] tracking-[1.5px] uppercase font-extrabold text-[#0f766e] mb-2 block">
                CORE CAPABILITIES
              </span>
              <h2 className="text-[26px] sm:text-[34px] font-extrabold text-[#0b1f24] tracking-[-0.03em] leading-tight mb-3">
                Core Architecture Principles
              </h2>
              <p className="text-[13px] sm:text-[14px] text-[#5b6b70] font-medium leading-relaxed">
                Designed for fast retrieval, source verification, and practical interview preparation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1 */}
              <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-[#d2e1dc] shadow-xs hover:border-[#14b8a6] hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#ccfbf1] border border-[#99f6e4] text-[#0f766e] flex items-center justify-center mb-5 shadow-2xs">
                  <Zap size={22} className="stroke-[2.2]" />
                </div>
                <h3 className="text-[16px] font-extrabold text-[#0b1f24] mb-2">
                  Sub-Second Vector Search
                </h3>
                <p className="text-[12.5px] text-[#5b6b70] leading-[1.7] font-medium">
                  Harnesses local GPU embeddings (`BAAI/bge-base-en-v1.5` in CUDA FP16) to vectorize hundreds of text chunks in milliseconds, eliminating queue delays and third-party rate limits.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-[#d2e1dc] shadow-xs hover:border-[#14b8a6] hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#ccfbf1] border border-[#99f6e4] text-[#0f766e] flex items-center justify-center mb-5 shadow-2xs">
                  <BookOpen size={22} className="stroke-[2.2]" />
                </div>
                <h3 className="text-[16px] font-extrabold text-[#0b1f24] mb-2">
                  Page-Level Source Citations
                </h3>
                <p className="text-[12.5px] text-[#5b6b70] leading-[1.7] font-medium">
                  Every document answer includes clickable page tags (`[Page X]`). Selecting a citation jumps directly to the highlighted source excerpt in the PDF viewer.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-[#d2e1dc] shadow-xs hover:border-[#14b8a6] hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#ccfbf1] border border-[#99f6e4] text-[#0f766e] flex items-center justify-center mb-5 shadow-2xs">
                  <Shield size={22} className="stroke-[2.2]" />
                </div>
                <h3 className="text-[16px] font-extrabold text-[#0b1f24] mb-2">
                  Realistic Technical Preparation
                </h3>
                <p className="text-[12.5px] text-[#5b6b70] leading-[1.7] font-medium">
                  Practice interactive system design and behavioral interviews, audit your resume against target job requirements, and identify missing technical competencies.
                </p>
              </div>
            </div>
          </div>
        </section>

       
        <section className="py-14 sm:py-16 bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white text-center">
          <div className="w-[min(1240px,calc(100%-36px))] md:w-[min(1240px,calc(100%-60px))] mx-auto max-w-[700px]">
            <h2 className="text-[26px] sm:text-[34px] font-extrabold tracking-[-0.03em] mb-3">
              Ready to explore Devora?
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#ccfbf1] leading-relaxed mb-6 font-medium">
              Search technical papers, run practice interviews, and optimize your resume in minutes.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0b4f4a] text-[13px] font-extrabold shadow-lg hover:bg-[#fbfaf6] hover:-translate-y-0.5 transition-all no-underline"
              >
                <span>Get Started for Free</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      
      <footer className="py-8 bg-[#fbfaf6] border-t border-[#e3ebe8] text-[12px] text-[#5b6b70]">
        <div className="w-[min(1240px,calc(100%-36px))] md:w-[min(1240px,calc(100%-60px))] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="m-0">© {new Date().getFullYear()} Devora. Developed by Sami Malik.</p>
          <div className="flex items-center gap-5 font-semibold">
            <Link href="/" className="hover:text-[#0f766e] transition-colors no-underline">Home</Link>
            <Link href="/about" className="hover:text-[#0f766e] transition-colors no-underline">About Us</Link>
            <Link href="/contact" className="hover:text-[#0f766e] transition-colors no-underline">Contact</Link>
            <Link href="/documents" className="hover:text-[#0f766e] transition-colors no-underline">Workspace</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
