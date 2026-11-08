'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Sparkles,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Phone,
  HelpCircle,
  ChevronDown,
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

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    }, 800);
  };

  const faqs = [
    {
      q: 'How does Devora’s Document Intelligence RAG work?',
      a: 'Devora embeds your uploaded PDF chunks using local CUDA GPU models (BAAI/bge-base-en-v1.5) and stores vector and full-text representations in PostgreSQL. Queries retrieve the most relevant passages in milliseconds and generate grounded answers with exact [Page X] clickable citations.',
    },
    {
      q: 'Can I use Devora for university handouts and research papers?',
      a: 'Yes. Devora indexes long technical PDFs, textbooks, lecture slides, and research papers, providing page-referenced citations across documents of any length.',
    },
    {
      q: 'Who built Devora and how can I collaborate?',
      a: 'Devora was founded and architected by Sami Malik. For technical partnerships, feature requests, or contributor inquiries, feel free to submit the contact form or connect via GitHub and LinkedIn.',
    },
    {
      q: 'How soon can I expect a reply to my inquiry?',
      a: 'We review all incoming inquiries daily and typically respond within 12 to 24 hours.',
    },
  ];

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
              className="px-3.5 py-2 rounded-full text-[13px] font-bold text-ink-2 hover:bg-tint hover:text-teal-900 transition-colors no-underline"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="relative px-3.5 py-2 rounded-full text-[13px] font-bold text-teal-800 no-underline after:content-[''] after:absolute after:left-1/2 after:bottom-px after:w-4 after:h-[3px] after:rounded-full after:-translate-x-1/2 after:bg-gradient-to-r after:from-teal-500 after:to-amber-400"
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
          <Link href="/about" onClick={closeMenu} className="p-[12px_14px] rounded-r-sm text-[15px] font-bold text-ink hover:bg-tint hover:text-teal-900 no-underline">About Us</Link>
          <Link href="/contact" onClick={closeMenu} className="p-[12px_14px] rounded-r-sm text-[15px] font-bold text-teal-800 bg-tint no-underline">Contact</Link>
          
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

    
      <main className="flex-1 py-14 sm:py-18">
        <div className="w-[min(1240px,calc(100%-36px))] md:w-[min(1240px,calc(100%-60px))] mx-auto">
          {/* Header */}
          <div className="text-center max-w-[650px] mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-extrabold tracking-wider uppercase bg-[#ccfbf1] border border-[#99f6e4] text-[#0f766e] mb-4 shadow-2xs">
              <Mail size={12} className="text-[#0f766e]" />
              Inquiries & Feedback
            </span>
            <h1 className="text-[32px] sm:text-[44px] font-extrabold tracking-[-0.035em] text-[#0b1f24] leading-tight mb-4">
              Get in Touch with Devora.
            </h1>
            <p className="text-[13.5px] sm:text-[15px] text-[#5b6b70] leading-relaxed font-medium">
              Have questions about document search, feedback on features, or partnership ideas? Send a note directly below.
            </p>
          </div>

          {/* Main Form & Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-8 lg:gap-12 items-start mb-20">
            {/* Contact Form Card */}
            <div className="bg-white rounded-[22px] border border-[#d2e1dc] p-6 sm:p-9 shadow-[0_10px_35px_rgba(11,79,74,0.05)]">
              <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#0b1f24] mb-1">
                Send a Message
              </h2>
              <p className="text-[12.5px] text-[#5b6b70] mb-6 font-medium">
                Fill in the details below and we&apos;ll get back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="py-12 text-center animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-[#ccfbf1] border border-[#99f6e4] text-[#0f766e] flex items-center justify-center mx-auto mb-4 shadow-xs">
                    <CheckCircle2 size={28} className="stroke-[2.2]" />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#0b1f24] mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-[13px] text-[#5b6b70] max-w-sm mx-auto mb-6 leading-relaxed">
                    Thank you for reaching out. Sami Malik and the Devora team will review your note and respond shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f3f7f4] border border-[#d2e1dc] text-[#0b1f24] text-[12px] font-bold hover:bg-[#e6f4f0] hover:text-[#0f766e] transition-colors cursor-pointer"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-[11px] font-bold text-[#0b1f24] mb-1.5">
                        Your Name <span className="text-[#0d9488]">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Alex Henderson"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2e1dc] text-[12.5px] text-[#0b1f24] outline-none focus:border-[#14b8a6] focus:ring-2 focus:ring-[#ccfbf1]/50 transition-all bg-[#fbfaf6]/50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-[11px] font-bold text-[#0b1f24] mb-1.5">
                        Your Email <span className="text-[#0d9488]">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@company.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2e1dc] text-[12.5px] text-[#0b1f24] outline-none focus:border-[#14b8a6] focus:ring-2 focus:ring-[#ccfbf1]/50 transition-all bg-[#fbfaf6]/50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-[11px] font-bold text-[#0b1f24] mb-1.5">
                      Inquiry Subject
                    </label>
                    <select
                      id="contact-subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2e1dc] text-[12.5px] text-[#0b1f24] outline-none focus:border-[#14b8a6] focus:ring-2 focus:ring-[#ccfbf1]/50 transition-all bg-[#fbfaf6]/50 focus:bg-white cursor-pointer"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Devora RAG & Document Intelligence">Devora RAG & Document Intelligence</option>
                      <option value="Partnership & Collaboration">Partnership & Collaboration</option>
                      <option value="Feature Request & Feedback">Feature Request & Feedback</option>
                      <option value="Bug Report">Bug Report</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-[11px] font-bold text-[#0b1f24] mb-1.5">
                      Your Message <span className="text-[#0d9488]">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us what you are working on, questions about Devora, or how we can help..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2e1dc] text-[12.5px] text-[#0b1f24] outline-none focus:border-[#14b8a6] focus:ring-2 focus:ring-[#ccfbf1]/50 transition-all bg-[#fbfaf6]/50 focus:bg-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white text-[12.5px] font-extrabold shadow-[0_4px_16px_rgba(15,118,110,0.25)] hover:brightness-110 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span>Sending message...</span>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Details Card */}
            <div className="space-y-5">
              {/* Direct Info Card */}
              <div className="rounded-[22px] bg-white border border-[#d2e1dc] p-6 sm:p-7 shadow-xs">
                <h3 className="text-[16px] font-extrabold text-[#0b1f24] mb-4">
                  Direct Contact
                </h3>

                <div className="space-y-4 text-[12.5px]">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#ccfbf1] border border-[#99f6e4] text-[#0f766e] flex items-center justify-center shrink-0 mt-0.5">
                      <Mail size={15} />
                    </div>
                    <div>
                      <p className="font-bold text-[#0b1f24] m-0">Direct Email</p>
                      <a href="mailto:contact@devora.ai" className="text-[#0f766e] hover:underline no-underline font-medium">
                        contact@devora.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#ccfbf1] border border-[#99f6e4] text-[#0f766e] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={15} />
                    </div>
                    <div>
                      <p className="font-bold text-[#0b1f24] m-0">Response Window</p>
                      <p className="text-[#5b6b70] font-medium m-0">Within 12 - 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#ccfbf1] border border-[#99f6e4] text-[#0f766e] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={15} />
                    </div>
                    <div>
                      <p className="font-bold text-[#0b1f24] m-0">Leadership</p>
                      <p className="text-[#5b6b70] font-medium m-0">Sami Malik · Founder</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Channels Card */}
              <div className="rounded-[22px] bg-gradient-to-br from-[#0b4f4a] to-[#0b1f24] text-white p-6 sm:p-7 shadow-md">
                <h3 className="text-[16px] font-extrabold mb-1.5">
                  Developer Channels
                </h3>
                <p className="text-[12px] text-[#ccfbf1] mb-5 font-medium leading-relaxed">
                  Track development updates, contribute feedback, and follow feature releases.
                </p>

                <div className="flex gap-2.5">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[11.5px] font-bold transition-all no-underline"
                  >
                    <GithubIcon />
                    <span>GitHub</span>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[11.5px] font-bold transition-all no-underline"
                  >
                    <LinkedinIcon />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div className="max-w-[780px] mx-auto pt-8 border-t border-[#e3ebe8]">
            <div className="text-center mb-8">
              <span className="text-[10px] tracking-[1.5px] uppercase font-extrabold text-[#0f766e] mb-1.5 block">
                FAQ
              </span>
              <h2 className="text-[22px] sm:text-[28px] font-extrabold text-[#0b1f24] tracking-[-0.03em]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#d2e1dc] bg-white overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-[13px] sm:text-[14px] text-[#0b1f24] hover:text-[#0f766e] transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={16}
                        className={`text-[#5b6b70] transition-transform shrink-0 ${isOpen ? 'rotate-180 text-[#0f766e]' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 text-[12.5px] text-[#5b6b70] leading-relaxed border-t border-[#f3f7f4] pt-3 animate-in fade-in duration-200">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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
