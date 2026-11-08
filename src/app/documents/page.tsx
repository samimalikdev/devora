'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAuthStore } from '@/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { documentService } from '@/services/documentService';

import {
  FileText,
  ArrowLeft,
  Search,
  ChevronDown,
  BookOpen,
  Paperclip,
  Sparkles,
  Lightbulb,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Plus,
  ArrowUp,
  Info,
  Upload,
  Loader2,
  Square,
  FolderOpen,
  Check,
} from 'lucide-react';

function DocumentIntelligenceContent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const {
    visiblePage,
    currentDocument,
    setCurrentDocument,
    setPages,
    isUploading,
    setIsUploading,
    uploadError,
    setUploadError,
    messages,
    addMessage,
    isSearching,
    setIsSearching,
    setVisiblePage,
    clearMessages,
  } = useDocumentStore();

  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingDocDetails, setIsLoadingDocDetails] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectDocument = async (docId: string) => {
    setIsLoadingDocDetails(true);
    setIsDropdownOpen(false);
    clearMessages();
    try {
      const res = await documentService.getDocumentById(docId);
      if (res && res.document) {
        setCurrentDocument(res.document);
        setPages(res.pages || []);
        setVisiblePage(1);
      }
    } catch (err: any) {
      console.error('Failed to load document details:', err);
    } finally {
      setIsLoadingDocDetails(false);
    }
  };

  const loadUserDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await documentService.getDocuments();
      const list = Array.isArray(docs) ? docs : [];
      setRecentDocs(list);

      const urlDocId = searchParams?.get('id');
      if (urlDocId) {
        const found = list.find((d: any) => d.id === urlDocId);
        if (found) {
          await selectDocument(found.id);
          return;
        }
      }

      if (!currentDocument && list.length > 0) {
        await selectDocument(list[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch user documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadUserDocuments();
  }, [user?.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are supported.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (user?.id) {
      formData.append('user_id', user.id);
    }

    try {
      const data = await documentService.uploadPDF(file);

      setCurrentDocument(data.document);
      setPages(data.pages || []);
      setVisiblePage(1);
      clearMessages();
      setRecentDocs((prev) => [data.document, ...prev.filter((d: any) => d.id !== data.document.id)]);

    } catch (err: any) {
      setUploadError(err.message || 'Error uploading document');

    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const [inputQuery, setInputQuery] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStopSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsSearching(false);
  };

  const handleSendMessgae = async () => {
    if (!inputQuery.trim() || !currentDocument || isSearching) return;

    const userText = inputQuery.trim();

    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: userText,
    });

    setInputQuery('');
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsSearching(true);

    try {
      const data = await documentService.searchDocument(currentDocument.id, userText, 3, controller.signal);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer?.answer || 'No answer found.',
        sources: data.answer?.sources,
      });

    } catch (err: any) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        return;
      }
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Search error: ${err.message || 'Failed to search document'}`,
      });

    } finally {
      abortControllerRef.current = null;
      setIsSearching(false);
    }
  }

  const renderFormattedText = (text: string) => {
    const formattedMarkdown = text.replace(/\[page\s+(\d+)\]/gi, '[Page $1](#page-$1)');

    return (
      <div className="space-y-2 text-[#0b1f24]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ ...props }) => <h1 className="text-sm font-bold text-[#0b1f24] mt-2 mb-1" {...props} />,
            h2: ({ ...props }) => <h2 className="text-xs font-bold text-[#0b1f24] mt-1.5 mb-1" {...props} />,
            h3: ({ ...props }) => <h3 className="text-xs font-bold text-[#0b1f24] mt-1 mb-0.5" {...props} />,
            p: ({ ...props }) => <p className="mb-1.5 leading-relaxed text-[12px] sm:text-[12.5px]" {...props} />,
            ul: ({ ...props }) => (
              <ul className="list-disc list-outside space-y-1.5 my-2 ml-4 text-[12px] sm:text-[12.5px]" {...props} />
            ),
            ol: ({ ...props }) => (
              <ol className="list-decimal list-outside space-y-1.5 my-2 ml-4 text-[12px] sm:text-[12.5px]" {...props} />
            ),
            li: ({ ...props }) => <li className="pl-1 leading-relaxed" {...props} />,
            strong: ({ ...props }) => <strong className="font-bold text-[#0b1f24]" {...props} />,
            a: ({ href, children, ...props }: any) => {
              const match = href?.match(/#page-(\d+)/);
              if (match) {
                const pageNum = parseInt(match[1], 10);
                return (
                  <button
                    type="button"
                    onClick={() => setVisiblePage(pageNum)}
                    className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-[#ccfbf1] hover:bg-[#99f6e4] border border-[#5eead4] text-[#0b4f4a] font-bold text-[10.5px] transition-colors cursor-pointer shadow-2xs align-middle"
                    title={`Jump to Page ${pageNum}`}
                  >
                    <BookOpen size={10} className="w-2.5 h-2.5 text-[#0f766e]" />
                    <span>Page {pageNum}</span>
                  </button>
                );
              }
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#0f766e] underline" {...props}>
                  {children}
                </a>
              );
            },
            pre: ({ children, ...props }: any) => (
              <pre
                className="bg-[#0b1f24] text-[#ccfbf1] p-2.5 rounded-lg overflow-x-auto my-1.5 text-[11.5px] font-mono"
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
                  className="bg-[#e6f4f0] text-[#0f766e] px-1 py-0.5 rounded text-[11px] font-mono"
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
          {formattedMarkdown}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="h-screen h-[100dvh] overflow-hidden bg-[#fbfaf6] text-[#0b1f24] font-['Manrope',sans-serif] text-[13px] antialiased select-auto flex flex-col">
      {/* Skip to reading space accessibility link */}
      <a
        href="#reading-space"
        className="fixed -top-[100px] left-5 p-3 bg-white z-50 focus:top-2.5 text-[#0b1f24] font-bold rounded-lg shadow-md border border-[#d2e1dc] transition-all"
      >
        Skip to reading space
      </a>

     
      <header className="h-[68px] max-sm:h-[62px] flex items-center justify-between gap-5 px-5 sm:px-7 lg:px-[30px] bg-white border-b border-[#e3ebe8] shrink-0 z-20">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-[9px] text-[24px] sm:text-[25px] font-extrabold tracking-[-1.2px] text-[#0b1f24] no-underline whitespace-nowrap"
            aria-label="Devora home"
          >
            <svg className="w-[28px] h-[32px] shrink-0" width="28" height="32">
              <use href="#logo-mark" />
            </svg>
            <span>
              Devora<i className="brand-dot not-italic text-[#f59e0b] -ml-[2px]">.</i>
            </span>
          </Link>

          <span className="h-[23px] w-px bg-[#e3ebe8] mx-1.5 hidden sm:block" />

          <Link
            href="/dashboard"
            className="text-[11px] font-semibold text-[#5b6b70] hover:text-[#0f766e] transition-colors hidden sm:block no-underline"
          >
            Workspace
          </Link>

          <span className="text-[#8a989c] text-[12px] hidden sm:block">/</span>

          <h1 className="text-[12px] font-bold text-[#0b1f24] whitespace-nowrap m-0 max-sm:border-l max-sm:border-[#e3ebe8] max-sm:pl-3">
            Document Intelligence
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-[8.5px] font-bold text-[#0f766e] border border-[#99f6e4] bg-[#ccfbf1]/50 px-2.5 py-1 rounded-[6px] whitespace-nowrap">
            Live Workspace
          </span>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-[10.5px] font-semibold text-[#5b6b70] hover:text-[#0f766e] transition-colors whitespace-nowrap no-underline"
          >
            <ArrowLeft size={13} className="w-[13px] h-[13px] shrink-0" />
            <span className="hidden sm:inline">Back to dashboard</span>
          </Link>
        </div>
      </header>

    
      <section
        className="h-[76px] max-sm:h-[72px] bg-white flex items-center justify-between gap-5 px-5 sm:px-7 lg:px-[31px] border-b border-[#e3ebe8] shrink-0 z-10"
        aria-label="Current file context"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="application/pdf"
          className="hidden"
        />

        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span className="w-[34px] h-[38px] max-sm:w-[30px] max-sm:h-[34px] grid place-items-center border border-[#d2e1dc] rounded-[10px] bg-[#f3f7f4] text-[#0f766e] shrink-0">
            <FileText size={18} className="w-[18px] h-[18px]" />
          </span>
          <div className="min-w-0">
            <h2 className="text-[13px] sm:text-[14px] font-bold tracking-tight text-[#0b1f24] m-0 truncate">
              {currentDocument ? currentDocument.title : 'No document selected'}
            </h2>
            <p className="flex items-center gap-1.5 text-[9.5px] text-[#5b6b70] mt-1 m-0 font-medium">
              <span>{currentDocument ? `${currentDocument.total_pages} pages` : '0 pages'}</span>
              <span className="text-[#8a989c]">·</span>
              <span>{currentDocument ? 'Active Document' : 'Waiting for upload'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Recent Documents Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d2e1dc] hover:border-[#14b8a6] hover:bg-[#f3f7f4] text-[#0b1f24] text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
              title="View recent uploaded documents"
            >
              <FileText size={13} className="text-[#0f766e]" />
              <span className="hidden sm:inline">Recent Documents</span>
              <span className="sm:hidden">Recent</span>
              {recentDocs.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#ccfbf1] text-[#0f766e] text-[9.5px] font-bold">
                  {recentDocs.length}
                </span>
              )}
              <ChevronDown size={12} className={`text-[#5b6b70] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-[#d2e1dc] rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-3.5 py-2.5 bg-[#fbfaf6] border-b border-[#e3ebe8] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#0b1f24]">Your Uploaded Documents</span>
                  <span className="text-[9.5px] text-[#5b6b70]">{recentDocs.length} total</span>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-[#f3f7f4]">
                  {isLoadingDocs ? (
                    <div className="py-6 flex items-center justify-center gap-2 text-[#5b6b70] text-[11px]">
                      <Loader2 size={13} className="animate-spin text-[#0f766e]" />
                      <span>Loading documents...</span>
                    </div>
                  ) : recentDocs.length === 0 ? (
                    <div className="py-6 text-center text-[#5b6b70] text-[11px]">
                      No documents uploaded yet.
                    </div>
                  ) : (
                    recentDocs.map((doc) => {
                      const isActive = currentDocument?.id === doc.id;
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => selectDocument(doc.id)}
                          className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-[#f3f7f4] transition-colors cursor-pointer ${
                            isActive ? 'bg-[#f0fdfa]' : ''
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 border ${
                            isActive ? 'bg-[#ccfbf1] border-[#5eead4] text-[#0f766e]' : 'bg-[#f3f7f4] border-[#d2e1dc] text-[#5b6b70]'
                          }`}>
                            <FileText size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-[11.5px] font-semibold truncate ${isActive ? 'text-[#0f766e]' : 'text-[#0b1f24]'}`}>
                              {doc.title}
                            </p>
                            <p className="text-[9.5px] text-[#5b6b70] flex items-center gap-1.5 mt-0.5">
                              <span>{doc.total_pages || 0} pages</span>
                              <span>·</span>
                              <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recent'}</span>
                            </p>
                          </div>
                          {isActive && (
                            <Check size={14} className="text-[#0f766e] shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="p-2 bg-[#fbfaf6] border-t border-[#e3ebe8]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-[#e6f4f0] border border-[#d2e1dc] text-[#0f766e] text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Upload New PDF</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {uploadError && (
            <span className="text-[10px] text-red-600 font-semibold">{uploadError}</span>
          )}
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] hover:brightness-110 text-white text-[10px] sm:text-[10.5px] font-bold transition-all shadow-[0_4px_12px_rgba(15,118,110,0.25)] hover:shadow-[0_6px_18px_rgba(15,118,110,0.35)] cursor-pointer disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <Loader2 size={13} className="w-[13px] h-[13px] animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Upload size={13} className="w-[13px] h-[13px] shrink-0" />
                <span>Upload PDF</span>
              </>
            )}
          </button>
        </div>
      </section>

     
      <main
        id="reading-space"
        className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] gap-5 lg:gap-[25px] p-4 sm:p-5 lg:p-[20px_27px_23px] max-w-[1740px] w-full mx-auto"
      >
      
        <section
          className="grid grid-rows-[24px_minmax(0,1fr)] min-h-[500px] lg:min-h-0 min-w-0 h-full"
          aria-labelledby="document-preview-title"
        >
          {/* Caption */}
          <div className="flex items-start justify-between gap-2.5 px-0.5 mb-1">
            <h2
              id="document-preview-title"
              className="text-[8.5px] tracking-[1.25px] text-[#0f766e] font-extrabold uppercase m-0"
            >
              YOUR DOCUMENT
            </h2>
            <span className="text-[9px] text-[#5b6b70] font-medium">Keep the context in view</span>
          </div>

          {/* Document Card Shell */}
          <div className="min-h-0 grid grid-rows-[47px_minmax(0,1fr)_30px] border border-[#d2e1dc] rounded-[14px] overflow-hidden bg-[#fbfaf6] shadow-[0_4px_16px_rgba(11,79,74,0.03)]">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2.5 px-4 bg-white border-b border-[#e3ebe8]">
              <span className="text-[10px] text-[#5b6b70] font-medium whitespace-nowrap">
                Page{' '}
                <strong
                  id="visible-page"
                  className="text-[10.5px] text-[#0f766e] font-extrabold px-1.5 py-0.5 bg-[#ccfbf1]/60 border border-[#99f6e4] rounded mx-1"
                >
                  {visiblePage}
                </strong>{' '}
                <span className="text-[#8a989c]">
                  of {currentDocument ? currentDocument.total_pages : 1}
                </span>
              </span>

              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-1.5 text-[9.5px] text-[#5b6b70] select-none cursor-default font-medium"
                  aria-label="Search document"
                >
                  <Search size={12} className="w-3 h-3 text-[#8a989c]" />
                  <span className="hidden sm:inline">Search document</span>
                </div>
                <span className="h-[15px] w-px bg-[#e3ebe8]" />
                <button
                  type="button"
                  disabled
                  className="flex items-center gap-1 text-[#5b6b70] text-[9.5px] font-semibold opacity-80 cursor-default"
                  aria-label="Zoom level"
                >
                  100% <ChevronDown size={11} className="w-[11px] h-[11px]" />
                </button>
              </div>
            </div>

            {isLoadingDocDetails ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white/70 backdrop-blur-xs">
                <Loader2 size={24} className="animate-spin text-[#0f766e] mb-2" />
                <p className="text-[12px] font-semibold text-[#0b1f24]">Opening document...</p>
              </div>
            ) : currentDocument?.file_path ? (
              <div className="w-full h-full min-h-0 bg-[#374151] relative overflow-hidden">
                <iframe
                  src={`${currentDocument.file_path}#page=${visiblePage}&#toolbar=0&navpanes=0&pagemode=none&view=FitH`}
                  className="w-full h-full border-0 block"
                  title={currentDocument.title}
                />
              </div>
            ) : recentDocs.length > 0 ? (
              <div className="h-full flex flex-col justify-center p-6 sm:p-8 bg-white/70 backdrop-blur-xs overflow-y-auto">
                <div className="max-w-md mx-auto w-full">
                  <div className="text-center mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#ccfbf1] border border-[#99f6e4] flex items-center justify-center text-[#0f766e] mx-auto mb-2.5 shadow-xs">
                      <FolderOpen size={24} className="stroke-[1.75]" />
                    </div>
                    <h3 className="text-[14px] sm:text-[15px] font-bold text-[#0b1f24] mb-1">
                      Recent Documents
                    </h3>
                    <p className="text-[11px] text-[#5b6b70] leading-relaxed">
                      Pick a document to start reading and chatting with citations:
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    {recentDocs.slice(0, 5).map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => selectDocument(doc.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#d2e1dc] bg-white hover:border-[#14b8a6] hover:bg-[#f3f7f4] hover:shadow-xs transition-all text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#f3f7f4] group-hover:bg-[#ccfbf1] border border-[#d2e1dc] text-[#0f766e] grid place-items-center shrink-0 transition-colors">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-bold text-[#0b1f24] group-hover:text-[#0f766e] truncate transition-colors">
                            {doc.title}
                          </p>
                          <p className="text-[10px] text-[#5b6b70] mt-0.5 flex items-center gap-1.5">
                            <span>{doc.total_pages || 0} pages</span>
                            <span>·</span>
                            <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recent'}</span>
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-[#0f766e] px-2 py-1 rounded-md bg-[#ccfbf1]/60 border border-[#99f6e4] shrink-0">
                          Open
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white text-[11px] font-bold shadow-[0_4px_14px_rgba(15,118,110,0.25)] hover:shadow-[0_6px_18px_rgba(15,118,110,0.35)] transition-all cursor-pointer disabled:opacity-60"
                    >
                      <Upload size={14} />
                      <span>Upload Another PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white/70 backdrop-blur-xs">
                <div className="w-16 h-16 rounded-2xl bg-[#ccfbf1] border border-[#99f6e4] flex items-center justify-center text-[#0f766e] mb-4 shadow-xs">
                  <Upload size={28} className="stroke-[1.75]" />
                </div>
                <h3 className="text-[15px] font-bold text-[#0b1f24] mb-1.5">
                  Upload a PDF Document
                </h3>
                <p className="text-[11px] text-[#5b6b70] max-w-[280px] leading-relaxed mb-5">
                  Select a research paper, report, or book to view it here and chat with AI citations.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white text-[11px] font-bold shadow-[0_4px_14px_rgba(15,118,110,0.25)] hover:shadow-[0_6px_18px_rgba(15,118,110,0.35)] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
                >
                  <Upload size={14} />
                  <span>Choose PDF File</span>
                </button>
              </div>
            )}

            {/* Bottom Note */}
            <div className="flex items-center justify-center gap-1.5 text-[8.5px] text-[#5b6b70] bg-white border-t border-[#e3ebe8] px-2 font-medium">
              <BookOpen size={11} className="w-[11px] h-[11px] text-[#0f766e]" />
              <span>A little less searching. A little more understanding.</span>
            </div>
          </div>
        </section>

        
        <section
          className="grid grid-rows-[58px_minmax(0,1fr)_auto] border border-[#d2e1dc] bg-white rounded-[15px] overflow-hidden min-w-0 min-h-[550px] lg:min-h-0 h-full shadow-[0_4px_16px_rgba(11,79,74,0.03)] lg:mt-6"
          aria-labelledby="document-chat-title"
        >
          {/* Conversation Header */}
          <header className="flex items-center gap-2.5 px-5 border-b border-[#e3ebe8]">
            <div className="w-[32px] h-[34px] grid place-items-center rounded-[10px] bg-[#f3f7f4] border border-[#d2e1dc] shrink-0">
              <svg className="w-[20px] h-[24px] shrink-0" width="20" height="24">
                <use href="#logo-mark" />
              </svg>
            </div>
            <div>
              <h2
                id="document-chat-title"
                className="text-[13px] sm:text-[14px] tracking-[-0.2px] font-bold text-[#0b1f24] leading-tight m-0"
              >
                Devora <span className="text-[#f59e0b] font-normal">✦</span>
              </h2>
              <p className="text-[8.5px] text-[#5b6b70] mt-0.5 m-0 font-medium">
                Your reading companion
              </p>
            </div>

            <span className="flex items-center gap-1 border border-[#99f6e4] bg-[#ccfbf1]/50 text-[#0f766e] rounded-full px-2.5 py-1 text-[8px] font-bold ml-auto whitespace-nowrap">
              <Paperclip size={10} className="w-2.5 h-2.5 text-[#0f766e]" />
              {currentDocument ? '1 document loaded' : 'No document'}
            </span>
          </header>

          {/* Conversation Scroll */}
          <div
            tabIndex={0}
            aria-label="Document conversation space"
            className="min-h-0 overflow-y-auto overflow-x-hidden p-5 sm:p-6 lg:p-[20px_24px_21px] [scrollbar-width:thin] [scrollbar-color:#d2e1dc_transparent] overscroll-contain"
          >
            {/* Tag & Intro */}
            <div className="mb-7">
              <span className="text-[7.5px] tracking-[1.3px] font-extrabold uppercase text-[#0f766e] border border-[#99f6e4] bg-[#ccfbf1]/40 px-2.5 py-1 rounded">
                AI DOCUMENT INTELLIGENCE
              </span>
              <p className="text-[10px] sm:text-[11px] leading-[1.8] text-[#5b6b70] mt-2 m-0 font-medium">
                The context stays beside you.
                <br />
                The conversation moves you forward.
              </p>
            </div>

            {/* Assistant Welcome Response */}
            {messages.length === 0 ? (
              /* Initial Welcome Card */
              <article className="mt-4" aria-label="Devora AI Welcome">
                <div className="flex items-center gap-2 text-[9px] mb-3">
                  <strong className="text-[11.5px] font-bold text-[#0b1f24]">Devora</strong>
                  <span className="text-[7px] font-extrabold tracking-[0.7px] bg-[#ccfbf1] border border-[#99f6e4] text-[#0b4f4a] px-1.5 py-0.5 rounded">
                    AI ASSISTANT
                  </span>
                </div>
                <div id="assistant-response" className="space-y-3">
                  <h3 className="text-[17px] tracking-[-0.3px] text-[#0b1f24] font-extrabold m-0">
                    {currentDocument
                      ? `Ready to analyze "${currentDocument.title}"`
                      : 'Upload a document to begin.'}
                  </h3>
                  <p className="text-[11.5px] sm:text-[12px] leading-[1.85] text-[#5b6b70] m-0">
                    {currentDocument
                      ? `Your document (${currentDocument.total_pages} pages) is indexed. Ask any question below to extract insights with grounded page citations.`
                      : 'When you upload a PDF, I will index its contents to give you accurate answers with grounded page numbers.'}
                  </p>
                </div>
              </article>
            ) : (
              /* Real Dynamic Chat Messages */
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[9px] text-[#8a989c] mb-1 font-semibold">
                      <span>{msg.role === 'user' ? 'You' : 'Devora AI'}</span>
                    </div>

                    <div
                      className={`p-3 sm:p-3.5 rounded-2xl max-w-[90%] text-[12px] sm:text-[12.5px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white rounded-tr-none shadow-xs'
                          : 'bg-[#f3f7f4] text-[#0b1f24] border border-[#d2e1dc] rounded-tl-none'
                      }`}
                    >
                      {msg.role === 'assistant'
                        ? renderFormattedText(msg.content)
                        : msg.content}
                    </div>
                  </div>
                ))}

                {/* Searching Loader Bubble */}
                {isSearching && (
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] text-[#8a989c] mb-1 font-semibold">Devora AI</span>
                    <div className="p-3 rounded-2xl bg-[#f3f7f4] border border-[#d2e1dc] text-[11.5px] text-[#0f766e] flex items-center gap-2">
                      <Loader2 size={13} className="animate-spin text-[#0f766e]" />
                      <span>Reading document and fetching citations...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Composer Footer */}
          <footer className="p-3 sm:p-3.5 bg-white border-t border-[#e3ebe8] shrink-0">
            <div className="border border-[#d2e1dc] shadow-xs focus-within:border-[#14b8a6] focus-within:ring-2 focus-within:ring-[#ccfbf1]/50 rounded-xl p-1.5 sm:p-2 bg-white transition-all">
              <label htmlFor="document-question" className="sr-only">
                Ask a question about this document
              </label>

              <textarea
                id="document-question"
                rows={2}
                disabled={!currentDocument || isSearching}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessgae();
                  }
                }}
                placeholder={
                  currentDocument
                    ? isSearching
                      ? 'Devora is thinking and finding citations...'
                      : 'Ask a question about this document (Press Enter)...'
                    : 'Upload a PDF first to ask questions…'
                }
                className="w-full block resize-none border-0 bg-transparent outline-none px-2 pt-1.5 pb-1 text-[12px] sm:text-[12.5px] leading-[1.6] text-[#0b1f24] placeholder:text-[#8a989c] min-h-[56px] disabled:opacity-60 disabled:cursor-not-allowed"
              />

              <div className="flex items-center justify-between gap-2 px-1 pb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-[26px] h-[26px] grid place-items-center rounded-lg text-[#5b6b70] hover:bg-[#e6f4f0] hover:text-[#0f766e] transition-colors cursor-pointer shrink-0"
                    title="Upload or change PDF"
                  >
                    <Plus size={16} className="w-4 h-4" />
                  </button>
                  <span className="w-px h-3 bg-[#d2e1dc] shrink-0" />
                  <span className="flex items-center gap-1.5 text-[8.5px] font-bold text-[#0f766e] truncate max-w-[200px]">
                    <FileText size={12} className="w-3 h-3 text-[#0f766e] shrink-0" />
                    <span className="truncate">
                      {currentDocument ? currentDocument.title : 'No PDF selected'}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:flex items-center gap-1 text-[8.5px] font-semibold text-[#5b6b70]">
                    <Sparkles size={11} className="w-[11px] h-[11px] text-[#f59e0b]" />
                    Devora RAG
                  </span>
                  {isSearching ? (
                    <button
                      type="button"
                      onClick={handleStopSearch}
                      className="w-[28px] h-[28px] grid place-items-center rounded-[8px] bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all cursor-pointer"
                      title="Stop generation"
                      aria-label="Stop generation"
                    >
                      <Square size={13} className="fill-current text-white" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendMessgae}
                      disabled={!currentDocument || !inputQuery.trim()}
                      className="w-[28px] h-[28px] grid place-items-center rounded-[8px] bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white shadow-xs hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      <ArrowUp size={15} className="w-[15px] h-[15px] text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <p className="flex items-center justify-center gap-1 text-[8.5px] text-[#8a989c] text-center mt-2 font-medium">
              <Info size={10} className="w-2.5 h-2.5 text-[#0f766e]" />
              Hybrid Search (BM25 + Semantic Vector) with Grounded Citations.
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default function DocumentIntelligencePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#fbfaf6] flex items-center justify-center text-[#0f766e]">
          <Loader2 size={32} className="animate-spin text-[#0f766e]" />
        </div>
      }
    >
      <DocumentIntelligenceContent />
    </Suspense>
  );
}
