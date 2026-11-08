'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useResumeStore, ResumeTab } from '@/store/useResumeStore';
import { useAuthStore } from '@/store';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  FileText,
  Plus,
  RotateCcw,
  ShieldCheck,
  Zap,
  Layers,
  ScanText,
  Focus,
  LayoutDashboard,
  PenLine,
  Tags,
  CheckCircle2,
  Lightbulb,
  Copy,
  Check,
  BadgeCheck,
  FileCheck2,
  Loader2,
  Briefcase,
  AlertTriangle,
  UploadCloud,
  Download,
} from 'lucide-react';

export default function ResumeIntelligencePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    file,
    fileName,
    jobDescription,
    isAnalyzing,
    analysis,
    error,
    activeTab,
    builderData,
    isBuildingData,
    isDownloadingPdf,
    setFile,
    setJobDescription,
    setActiveTab,
    analyzeResume,
    reset,
    buildResumeData,
    downloadPdf,
    downloadTex
  } = useResumeStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const parseFinding = (text: string) => {
    const splitIndex = text.indexOf(':');
    if (splitIndex !== -1) {
      return {
        title: text.substring(0, splitIndex).trim(),
        body: text.substring(splitIndex + 1).trim(),
      };
    }
    return { title: text, body: '' };
  };

  const score = analysis?.match_score ?? 0;
  const dashOffset = 264 * (1 - score / 100);

  const getScoreHeadline = (val: number) => {
    if (val >= 85) return 'Strong Candidate Match.\nReady to Apply.';
    if (val >= 70) return 'Solid Alignment.\nMinor Tailoring Recommended.';
    if (val >= 50) return 'Partial Fit.\nKey Job Requirements Missing.';
    return 'Low Alignment.\nMajor Skill Gaps Detected.';
  };

  const getScoreBadge = (val: number) => {
    if (val >= 85) return 'High Job Fit';
    if (val >= 70) return 'Competitive Applicant';
    return 'Significant Skill Gap';
  };

  const categoryScores = analysis?.category_scores || {
    skills_match: 0,
    experience_depth: 0,
    impact_score: 0,
    readability: 0,
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#111827] font-['Manrope',sans-serif] text-[13px] antialiased selection:bg-[#ccfbf1] selection:text-[#0b4f4a]">
      {/* Skip Navigation */}
      <a
        href="#resume-main"
        className="fixed -top-24 left-5 bg-white p-3 z-40 focus:top-3 transition-all text-[#0f766e] font-bold shadow-md rounded-lg"
      >
        Skip to resume studio
      </a>

      {/* Header */}
      <header className="h-[70px] px-6 sm:px-9 flex items-center justify-between gap-5 bg-white border-b border-[#e3ebe8] sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-[26px] font-extrabold tracking-[-1.2px] text-[#111827] no-underline"
          >
            <Image src="/images/favicon.svg" alt="" width={29} height={33} />
            <span>Devora</span>
            <span className="-ml-2 text-[#0f766e]">.</span>
          </Link>
          <span className="w-px h-[23px] bg-[#e5e7eb] hidden sm:block"></span>
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold text-[#4b5563] hover:text-[#0f766e] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Workspace</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 border border-[#ccfbf1] rounded-full text-[11px] font-bold text-[#0f766e] bg-[#e6f4f0]">
            <Sparkles size={13} />
            <span>Resume vs Job Description Matcher</span>
          </span>
          <span
            className="hidden sm:grid place-items-center w-[34px] h-[34px] text-[11px] font-bold bg-[#ccfbf1] text-[#0f766e] border-2 border-white shadow-sm rounded-full"
            aria-label="Profile"
          >
            {user?.email ? user.email.slice(0, 2).toUpperCase() : 'JD'}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1310px] mx-auto px-5 sm:px-9 pt-8 pb-12" id="resume-main">
        {/* Intro Banner */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <span className="inline-block text-[11px] font-bold tracking-[1.5px] text-[#0f766e] uppercase bg-[#e6f4f0] px-2.5 py-0.5 rounded-md border border-[#ccfbf1]">
              TARGETED APPLICANT INTELLIGENCE
            </span>
            <h1 className="text-[26px] sm:text-[32px] leading-[1.25] tracking-[-1.2px] font-extrabold mt-2.5 text-[#111827]">
              Tailor your experience.<br className="block sm:hidden" />{' '}
              <em className="not-italic font-semibold text-[#0f766e]">
                Match the exact job post.
              </em>
            </h1>
            <p className="text-[13px] text-[#4b5563] mt-2 font-medium leading-[1.8]">
              Upload your PDF resume and paste the Job Description (JD) to evaluate match percentage, detect missing requirements, and optimize bullet points.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[#0f766e] text-[11px] bg-[#e6f4f0]/60 border border-[#ccfbf1] px-4 py-2.5 rounded-2xl shadow-sm">
            <Sparkles size={22} className="text-[#0d9488] shrink-0" />
            <span className="leading-snug">
              JD-Targeted Audit.<br />
              <strong className="font-bold text-[#1f2937]">Pass the recruiter filter.</strong>
            </span>
          </div>
        </section>

        {/* Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] items-start gap-7">
          {/* Left Column: Upload & JD Input */}
          <aside className="lg:sticky lg:top-[94px] min-w-0 space-y-4">
            <section className="bg-white border border-[#e3ebe8] rounded-[18px] p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)] space-y-4">
              {/* Heading */}
              <div className="flex items-center gap-3">
                <span className="w-[40px] h-[40px] bg-[#e6f4f0] border border-[#ccfbf1] rounded-[12px] grid place-items-center text-[#0f766e] shrink-0">
                  <Briefcase size={20} />
                </span>
                <div>
                  <h2 className="text-[16px] font-bold text-[#111827] tracking-tight">
                    Job Description Match
                  </h2>
                  <p className="text-[11px] font-medium text-[#6b7280]">Compare resume with the real post.</p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                id="resume-file"
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                aria-label="Select a PDF resume"
                onChange={handleFileChange}
              />

              {/* Dropzone */}
              <button
                type="button"
                className={`flex flex-col items-center justify-center gap-2 w-full min-h-[160px] p-4 border-2 border-dashed rounded-[14px] transition-all cursor-pointer ${
                  isDragging || file
                    ? 'border-[#0f766e] bg-[#e6f4f0]'
                    : 'border-[#ccfbf1] bg-[#f8fafc] hover:bg-[#e6f4f0]/60 hover:border-[#0d9488]'
                }`}
                id="resume-dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <span className="relative w-[44px] h-[48px] grid place-items-center border border-[#ccfbf1] bg-white rounded-[10px] shadow-sm text-[#0f766e]">
                  <FileText size={22} />
                  <span className="absolute -right-2 -bottom-1 w-[20px] h-[20px] grid place-items-center bg-[#0f766e] border-2 border-white rounded-full text-white">
                    <Plus size={11} />
                  </span>
                </span>
                <strong className="text-[12.5px] font-bold text-[#111827] break-all max-w-full">
                  {file ? fileName : 'Upload Resume (PDF)'}
                </strong>
                <span className="text-[11px] text-[#4b5563]">
                  {file ? (
                    `${(file.size / 1024 / 1024).toFixed(2)} MB · Click to replace`
                  ) : (
                    <>
                      Drag & drop or <b className="font-bold text-[#0f766e]">browse files</b>
                    </>
                  )}
                </span>
              </button>

              {/* Job Description Textarea */}
              <div className="space-y-1.5">
                <label
                  htmlFor="job-description"
                  className="flex items-center gap-1.5 text-[12px] font-bold text-[#1f2937]"
                >
                  <Briefcase size={13} className="text-[#0f766e]" />
                  <span>Target Job Description</span>
                  <span className="ml-auto text-[10px] font-bold text-[#ef4444] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                    Required
                  </span>
                </label>
                <textarea
                  id="job-description"
                  rows={6}
                  placeholder="Paste the target job post here (responsibilities, required tech stack, qualifications)..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full p-3 border border-[#e3ebe8] rounded-[10px] bg-white text-[#111827] text-[11.5px] outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#ccfbf1]/50 placeholder:text-[#9ca3af] resize-y transition-all leading-relaxed"
                />
                <p className="text-[10px] text-[#6b7280] leading-normal">
                  Gemini extracts role title, required competencies, and hard qualifications directly from this post.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <p className="border border-red-200 rounded-[10px] p-3 text-red-700 bg-red-50 text-[11px] leading-relaxed flex items-start gap-1.5">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </p>
              )}

              {/* Primary Action Button */}
              <button
                type="button"
                disabled={!file || !jobDescription.trim() || isAnalyzing}
                onClick={() => analyzeResume(user?.id)}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-gradient-to-r from-[#0f766e] to-[#0b4f4a] hover:from-[#0d9488] hover:to-[#0f766e] text-white border border-[#0b4f4a] rounded-full text-[12.5px] font-bold py-2.5 px-4 shadow-[0_4px_14px_rgba(11,79,74,0.25)] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all mt-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Matching against Job Post...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} className="mr-auto" />
                    <span>{analysis ? 'Re-Analyze Match' : 'Match Resume to JD'}</span>
                    <ArrowRight size={15} className="ml-auto" />
                  </>
                )}
              </button>

              {/* Reset Button */}
              {(analysis || file || jobDescription) && (
                <button
                  type="button"
                  onClick={reset}
                  className="w-full flex items-center justify-center gap-1.5 pt-2 text-[11px] font-semibold text-[#4b5563] hover:text-[#111827] transition-colors"
                >
                  <RotateCcw size={12} /> Reset & start fresh
                </button>
              )}

              {/* Local note */}
              <p className="flex items-start justify-center gap-1.5 border-t border-[#e3ebe8] pt-3 text-[10.5px] text-[#6b7280]">
                <ShieldCheck size={14} className="shrink-0 text-[#10b981] mt-0.5" />
                <span>AI analysis powered by Google Gemini</span>
              </p>
            </section>
          </aside>

          {/* Right Column: Results / Report */}
          <section className="min-w-0" aria-label="Resume review results">
            {isAnalyzing ? (
              /* Loading State */
              <section className="text-center min-h-[420px] p-8 sm:p-12 bg-white border border-[#e3ebe8] rounded-[18px] flex flex-col items-center justify-center shadow-sm">
                <span className="w-[68px] h-[68px] border border-[#ccfbf1] rounded-[20px] bg-[#e6f4f0] text-[#0f766e] grid place-items-center mb-6">
                  <Loader2 size={32} className="animate-spin text-[#0f766e]" />
                </span>
                <span className="text-[11px] font-bold tracking-[1.5px] text-[#0f766e] uppercase">
                  JOB MATCH EVALUATION ENGINE
                </span>
                <h2 className="text-[24px] font-extrabold text-[#111827] mt-3">
                  Comparing Resume Against Job Post...
                </h2>
                <p className="text-[12.5px] text-[#4b5563] max-w-[460px] mt-2.5 leading-relaxed">
                  Extracting required competencies from the JD, scoring candidate experience depth, and tailoring bullet points.
                </p>
              </section>
            ) : analysis ? (
              /* Results Report */
              <div className="space-y-6">
                {/* Caption Bar */}
                <div className="flex items-center justify-between gap-3 text-[10px] tracking-[1.2px] text-[#4b5563] uppercase font-bold px-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                    <span>TARGET JOB AUDIT</span>
                  </span>
                  <span className="text-[9px] font-bold tracking-wider border border-[#ccfbf1] rounded-full px-2.5 py-0.5 text-[#0f766e] bg-[#e6f4f0]">
                    ROLE: {analysis.job_title_detected.toUpperCase()}
                  </span>
                </div>

                {/* Score & Category Panel */}
                <section className="bg-white border border-[#e3ebe8] rounded-[18px] p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.03)] grid grid-cols-1 sm:grid-cols-[150px_minmax(0,1fr)] gap-7 items-center">
                  {/* Gauge */}
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className="relative w-[124px] h-[124px] grid place-items-center"
                      role="img"
                      aria-label={`Job match score: ${score} out of 100`}
                    >
                      <svg className="absolute inset-0 -rotate-90 w-full h-full" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          className="stroke-[#e5e7eb] fill-none"
                          strokeWidth="7"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          className="stroke-[#0f766e] fill-none transition-all duration-700"
                          strokeWidth="7"
                          strokeDasharray="264"
                          strokeLinecap="round"
                          style={{ strokeDashoffset: dashOffset }}
                        />
                      </svg>
                      <div className="flex flex-col items-center justify-center text-center">
                        <strong className="text-[36px] font-extrabold tracking-tight text-[#111827] leading-none">
                          {score}%
                        </strong>
                        <span className="text-[9px] font-bold text-[#6b7280] tracking-wider mt-1">
                          MATCH RATE
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-[#0f766e] uppercase mt-2.5">
                      JOB ALIGNMENT
                    </span>
                  </div>

                  {/* Summary Text */}
                  <div className="space-y-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#0f766e] bg-[#e6f4f0] border border-[#ccfbf1] rounded-full px-3 py-1">
                      <Sparkles size={12} />
                      <span>{getScoreBadge(score)}</span>
                    </span>
                    <h2 className="text-[22px] sm:text-[25px] font-extrabold leading-tight tracking-tight text-[#111827] whitespace-pre-line">
                      {getScoreHeadline(score)}
                    </h2>
                    <p className="text-[12.5px] text-[#374151] leading-relaxed font-medium">
                      {analysis.summary}
                    </p>
                  </div>

                  {/* 4 Category Bars */}
                  <div className="col-span-full grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-4 pt-5 border-t border-[#e3ebe8]">
                    <div>
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#374151]">
                        <Zap size={13} className="text-[#0f766e]" />
                        <span>Skills Match</span>
                        <b className="ml-auto text-[12px] font-bold text-[#111827]">
                          {categoryScores.skills_match}
                          <span className="text-[9px] font-normal text-[#6b7280]">/100</span>
                        </b>
                      </span>
                      <div className="h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden mt-2">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-[#14b8a6] to-[#0f766e] transition-all duration-500"
                          style={{ width: `${categoryScores.skills_match}%` }}
                        ></span>
                      </div>
                    </div>

                    <div>
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#374151]">
                        <Layers size={13} className="text-[#0f766e]" />
                        <span>Seniority & Depth</span>
                        <b className="ml-auto text-[12px] font-bold text-[#111827]">
                          {categoryScores.experience_depth}
                          <span className="text-[9px] font-normal text-[#6b7280]">/100</span>
                        </b>
                      </span>
                      <div className="h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden mt-2">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-[#14b8a6] to-[#0f766e] transition-all duration-500"
                          style={{ width: `${categoryScores.experience_depth}%` }}
                        ></span>
                      </div>
                    </div>

                    <div>
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#374151]">
                        <ScanText size={13} className="text-[#0f766e]" />
                        <span>Quantified Impact</span>
                        <b className="ml-auto text-[12px] font-bold text-[#111827]">
                          {categoryScores.impact_score}
                          <span className="text-[9px] font-normal text-[#6b7280]">/100</span>
                        </b>
                      </span>
                      <div className="h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden mt-2">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-[#14b8a6] to-[#0f766e] transition-all duration-500"
                          style={{ width: `${categoryScores.impact_score}%` }}
                        ></span>
                      </div>
                    </div>

                    <div>
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#374151]">
                        <Focus size={13} className="text-[#0f766e]" />
                        <span>ATS Readability</span>
                        <b className="ml-auto text-[12px] font-bold text-[#111827]">
                          {categoryScores.readability}
                          <span className="text-[9px] font-normal text-[#6b7280]">/100</span>
                        </b>
                      </span>
                      <div className="h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden mt-2">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-[#14b8a6] to-[#0f766e] transition-all duration-500"
                          style={{ width: `${categoryScores.readability}%` }}
                        ></span>
                      </div>
                    </div>
                  </div>
                </section>


                <section className="bg-gradient-to-r from-[#e6f4f0] to-[#f3f7f4] border border-[#ccfbf1] rounded-[18px] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#0f766e] uppercase tracking-wider mb-1">
                      <Sparkles size={13} />
                      <span>1-Page Harvard ATS Format</span>
                    </div>
                    <h3 className="text-[16px] font-extrabold text-[#111827]">
                      Make Harvard ATS Resume Matched to this JD
                    </h3>
                    <p className="text-[12px] text-[#4b5563] mt-1 max-w-[550px] leading-relaxed">
                      AI will tailor your background and project bullet points to match target job keywords in a verified 1-page Harvard LaTeX format.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {!builderData ? (
                      <button
                        type="button"
                        disabled={isBuildingData}
                        onClick={buildResumeData}
                        className="flex items-center gap-2 bg-[#0f766e] text-white px-5 py-2.5 rounded-xl text-[12.5px] font-bold hover:bg-[#0b4f4a] transition-all shadow-md disabled:opacity-50"
                      >
                        {isBuildingData ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>Tailoring with AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={15} />
                            <span>Make Harvard Resume</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isDownloadingPdf}
                          onClick={downloadPdf}
                          className="flex items-center gap-2 bg-[#10b981] text-white px-5 py-2.5 rounded-xl text-[12.5px] font-bold hover:bg-[#059669] transition-all shadow-md disabled:opacity-50"
                        >
                          {isDownloadingPdf ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              <span>Compiling PDF...</span>
                            </>
                          ) : (
                            <>
                              <Download size={15} />
                              <span>Download ATS PDF</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={downloadTex}
                          className="flex items-center gap-1.5 bg-white border border-[#ccfbf1] text-[#0f766e] px-3.5 py-2.5 rounded-xl text-[12px] font-bold hover:bg-[#e6f4f0] transition-all"
                        >
                          <FileText size={14} />
                          <span>.tex</span>
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                

                {/* Tabs Bar */}
                <div className="flex items-center gap-6 border-b border-[#e3ebe8] mt-6 mb-5">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 text-[13px] font-bold pb-3.5 border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === 'overview'
                        ? 'text-[#0f766e] border-[#0f766e]'
                        : 'text-[#6b7280] hover:text-[#111827] border-transparent'
                    }`}
                  >
                    <LayoutDashboard size={15} />
                    <span>Fit Analysis & Gaps</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'rewrites'}
                    onClick={() => setActiveTab('rewrites')}
                    className={`flex items-center gap-2 text-[13px] font-bold pb-3.5 border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === 'rewrites'
                        ? 'text-[#0f766e] border-[#0f766e]'
                        : 'text-[#6b7280] hover:text-[#111827] border-transparent'
                    }`}
                  >
                    <PenLine size={15} />
                    <span>JD-Tailored Rewrites</span>
                    <span className="text-[10px] font-bold bg-[#e6f4f0] border border-[#ccfbf1] text-[#0f766e] rounded-md px-1.5 py-0.5 min-w-[18px] text-center">
                      {analysis.bullet_rewrites?.length || 0}
                    </span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'skills'}
                    onClick={() => setActiveTab('skills')}
                    className={`flex items-center gap-2 text-[13px] font-bold pb-3.5 border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === 'skills'
                        ? 'text-[#0f766e] border-[#0f766e]'
                        : 'text-[#6b7280] hover:text-[#111827] border-transparent'
                    }`}
                  >
                    <Tags size={15} />
                    <span>Skills Match vs Missing</span>
                  </button>
                </div>

                {/* Tab Panel 1: Overview */}
                {activeTab === 'overview' && (
                  <section className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Strengths Card */}
                      <article className="p-5 sm:p-6 bg-white border border-[#e3ebe8] rounded-[16px] shadow-sm">
                        <div className="flex items-center gap-2.5 mb-4">
                          <span className="w-[32px] h-[32px] rounded-[10px] bg-emerald-50 border border-emerald-200 grid place-items-center text-emerald-600 shrink-0">
                            <CheckCircle2 size={16} />
                          </span>
                          <h3 className="text-[14px] font-bold text-[#111827]">
                            Strong Alignment with JD
                          </h3>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full ml-auto">
                            {String(analysis.strengths?.length || 0).padStart(2, '0')} Points
                          </span>
                        </div>
                        <ul className="space-y-4">
                          {analysis.strengths?.map((item, idx) => {
                            const { title, body } = parseFinding(item);
                            return (
                              <li key={idx} className="flex items-start gap-2.5">
                                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                                <div>
                                  <strong className="block text-[12.5px] font-bold text-[#111827]">
                                    {title}
                                  </strong>
                                  {body && (
                                    <p className="text-[11.5px] text-[#4b5563] leading-relaxed mt-1">
                                      {body}
                                    </p>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </article>

                      {/* Weaknesses Card */}
                      <article className="p-5 sm:p-6 bg-white border border-[#e3ebe8] rounded-[16px] shadow-sm">
                        <div className="flex items-center gap-2.5 mb-4">
                          <span className="w-[32px] h-[32px] rounded-[10px] bg-amber-50 border border-amber-200 grid place-items-center text-amber-600 shrink-0">
                            <AlertTriangle size={16} />
                          </span>
                          <h3 className="text-[14px] font-bold text-[#111827]">
                            Gaps Against Job Requirements
                          </h3>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full ml-auto">
                            {String(analysis.weaknesses?.length || 0).padStart(2, '0')} Gaps
                          </span>
                        </div>
                        <ul className="space-y-4">
                          {analysis.weaknesses?.map((item, idx) => {
                            const { title, body } = parseFinding(item);
                            return (
                              <li key={idx} className="flex items-start gap-2.5">
                                <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                                <div>
                                  <strong className="block text-[12.5px] font-bold text-[#111827]">
                                    {title}
                                  </strong>
                                  {body && (
                                    <p className="text-[11.5px] text-[#4b5563] leading-relaxed mt-1">
                                      {body}
                                    </p>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </article>
                    </div>

                    {/* Tailoring Tips Card */}
                    {analysis.tailoring_tips && analysis.tailoring_tips.length > 0 && (
                      <div className="border border-[#ccfbf1] border-l-4 border-l-[#0f766e] rounded-[14px] bg-[#e6f4f0]/40 p-5 shadow-sm space-y-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-[32px] h-[32px] rounded-[10px] bg-[#e6f4f0] border border-[#ccfbf1] grid place-items-center text-[#0f766e] shrink-0">
                            <Lightbulb size={16} />
                          </span>
                          <h3 className="text-[13px] font-bold text-[#111827]">
                            How to Tailor Your Resume for This Specific Job Post
                          </h3>
                        </div>
                        <ul className="space-y-2.5 pl-2">
                          {analysis.tailoring_tips.map((tip, idx) => (
                            <li key={idx} className="text-[12px] text-[#374151] flex items-start gap-2 leading-relaxed">
                              <span className="text-[#0f766e] font-bold mt-0.5">✓</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}

                {/* Tab Panel 2: Rewrites */}
                {activeTab === 'rewrites' && (
                  <section className="space-y-4">
                    <div className="mb-4">
                      <h3 className="text-[16px] font-bold text-[#111827]">
                        Bullet Points Rewritten for This Job
                      </h3>
                      <p className="text-[12px] text-[#4b5563] leading-relaxed mt-1">
                        Devora aligned your actual contributions with the keywords and responsibilities stated in the target job post.
                      </p>
                    </div>

                    {analysis.bullet_rewrites?.map((rw, idx) => (
                      <article
                        key={idx}
                        className="p-5 bg-white border border-[#e3ebe8] rounded-[16px] space-y-3.5 shadow-sm"
                      >
                        {/* Before Box */}
                        <div className="p-3.5 rounded-[10px] border border-[#e3ebe8] bg-[#f9fafb]">
                          <span className="text-[9.5px] font-bold tracking-wider text-[#6b7280] uppercase">
                            ORIGINAL BULLET
                          </span>
                          <p className="text-[12px] text-[#4b5563] italic leading-relaxed mt-1">
                            &ldquo;{rw.before}&rdquo;
                          </p>
                        </div>

                        {/* After Box */}
                        <div className="p-4 rounded-[10px] border border-[#ccfbf1] bg-[#e6f4f0]/60">
                          <div className="flex items-center justify-between gap-2.5">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-[#0f766e] uppercase">
                              <Sparkles size={12} />
                              <span>TAILORED FOR TARGET JD</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(rw.after, idx)}
                              className="flex items-center gap-1.5 text-[11px] font-bold text-[#0f766e] hover:text-[#0b4f4a] bg-white border border-[#ccfbf1] px-3 py-1 rounded-md shadow-sm transition-all"
                            >
                              {copiedIdx === idx ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                              <span>{copiedIdx === idx ? 'Copied to Clipboard!' : 'Copy Bullet'}</span>
                            </button>
                          </div>
                          <p className="text-[13px] text-[#111827] leading-relaxed font-bold mt-2">
                            {rw.after}
                          </p>
                        </div>

                        {/* Explanation */}
                        {rw.explanation && (
                          <div className="flex items-start gap-2 text-[#4b5563] text-[11px] leading-relaxed pt-1">
                            <Lightbulb size={14} className="shrink-0 mt-0.5 text-[#f59e0b]" />
                            <span><strong>JD Alignment:</strong> {rw.explanation}</span>
                          </div>
                        )}
                      </article>
                    ))}
                  </section>
                )}

                {/* Tab Panel 3: Skills & Keywords */}
                {activeTab === 'skills' && (
                  <section className="space-y-5">
                    {/* Missing Skills from JD */}
                    <article className="p-5 sm:p-6 bg-white border border-[#e3ebe8] rounded-[16px] shadow-sm">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="w-[32px] h-[32px] rounded-[10px] bg-red-50 border border-red-200 grid place-items-center text-red-600 shrink-0">
                          <AlertTriangle size={16} />
                        </span>
                        <h3 className="text-[14px] font-bold text-[#111827]">
                          Missing Job Requirements & Tech Stack
                        </h3>
                        <span className="text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full ml-auto uppercase tracking-wider">
                          Critical Gaps
                        </span>
                      </div>
                      <p className="text-[12px] text-[#4b5563] leading-relaxed">
                        The job description explicitly mentions these skills or technologies, but they were not detected in your resume:
                      </p>
                      <div className="flex flex-wrap gap-2.5 mt-4">
                        {analysis.missing_skills?.map((kw, idx) => (
                          <span
                            key={idx}
                            className="text-[11.5px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-[8px] px-3 py-1.5"
                          >
                            ✗ {kw}
                          </span>
                        ))}
                      </div>
                    </article>

                    {/* Matched Skills */}
                    <article className="p-5 sm:p-6 bg-white border border-[#e3ebe8] rounded-[16px] shadow-sm">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="w-[32px] h-[32px] rounded-[10px] bg-emerald-50 border border-emerald-200 grid place-items-center text-emerald-600 shrink-0">
                          <BadgeCheck size={16} />
                        </span>
                        <h3 className="text-[14px] font-bold text-[#111827]">
                          Matched Qualifications & Requirements
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full ml-auto">
                          {String(analysis.matched_skills?.length || 0).padStart(2, '0')} Matched
                        </span>
                      </div>
                      <p className="text-[12px] text-[#4b5563] leading-relaxed">
                        These requirements from the job description are successfully represented in your profile:
                      </p>
                      <div className="flex flex-wrap gap-2.5 mt-4">
                        {analysis.matched_skills?.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[11.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-[8px] px-3 py-1.5"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </article>
                  </section>
                )}
              </div>
            ) : (
              /* Empty State / Welcome Guide */
              <section className="text-center min-h-[480px] p-8 sm:p-12 bg-white border border-[#e3ebe8] rounded-[18px] shadow-sm flex flex-col items-center justify-center">
                <span className="w-[68px] h-[68px] border border-[#ccfbf1] rounded-[20px] bg-[#e6f4f0] text-[#0f766e] grid place-items-center mx-auto mb-6 shadow-sm">
                  <FileCheck2 size={32} />
                </span>
                <span className="text-[11px] font-bold tracking-[1.5px] text-[#0f766e] uppercase bg-[#e6f4f0] border border-[#ccfbf1] px-3 py-1 rounded-md">
                  TARGETED APPLICATION INTELLIGENCE
                </span>
                <h2 className="text-[25px] sm:text-[28px] font-extrabold text-[#111827] leading-[1.3] tracking-tight mt-4">
                  Match your resume to the exact job post.
                </h2>
                <p className="text-[13px] leading-relaxed max-w-[480px] text-[#4b5563] mx-auto mt-3 font-medium">
                  Upload your PDF resume and paste the target Job Description on the left panel to calculate your ATS match score and discover missing requirements.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-10 text-left w-full">
                  <div className="p-4 border border-[#e3ebe8] rounded-[12px] bg-[#fafafa]">
                    <Zap size={20} className="text-[#0f766e] mb-2.5" />
                    <strong className="block text-[12px] font-bold text-[#111827]">
                      JD Match Rate %
                    </strong>
                    <p className="text-[11px] text-[#4b5563] mt-1 leading-relaxed">
                      Computes your overall fit percentage against the post requirements.
                    </p>
                  </div>
                  <div className="p-4 border border-[#e3ebe8] rounded-[12px] bg-[#fafafa]">
                    <AlertTriangle size={20} className="text-[#0f766e] mb-2.5" />
                    <strong className="block text-[12px] font-bold text-[#111827]">
                      Missing Requirements
                    </strong>
                    <p className="text-[11px] text-[#4b5563] mt-1 leading-relaxed">
                      Flags critical technologies demanded in the post that are missing in your CV.
                    </p>
                  </div>
                  <div className="p-4 border border-[#e3ebe8] rounded-[12px] bg-[#fafafa]">
                    <PenLine size={20} className="text-[#0f766e] mb-2.5" />
                    <strong className="block text-[12px] font-bold text-[#111827]">
                      Targeted Bullet Rewrites
                    </strong>
                    <p className="text-[11px] text-[#4b5563] mt-1 leading-relaxed">
                      Rewrites your experience using the exact keywords from the job description.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between text-[11px] font-medium text-[#6b7280] py-6 mt-8 border-t border-[#e3ebe8]">
          <span>
            <b className="text-[13px] text-[#0f766e] mr-1.5">✦</b>
            Better stories. Targeted next chapters.
          </span>
          <span>Devora Resume Intelligence Studio</span>
        </footer>
      </main>
    </div>
  );
}
