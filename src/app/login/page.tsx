'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';

import {
  ArrowLeft,
  ArrowRight,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  Info,
  Code2,
  FileText,
  Briefcase,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const {
    loginEmail: email,
    setLoginEmail: setEmail,
    loginPassword: password,
    setLoginPassword: setPassword,
    loginShowPassword: showPassword,
    setLoginShowPassword: setShowPassword,
    rememberMe,
    setRememberMe,

    loading,
    setLoading,
    error,
    setError,
    setUser,
    setToken,
  } = useAuthStore();

  const [showMfaModal, setShowMfaModal] = React.useState(false);
  const [mfaFactorId, setMfaFactorId] = React.useState<string | null>(null);
  const [mfaTempToken, setMfaTempToken] = React.useState<string | null>(null);
  const [totpCode, setTotpCode] = React.useState('');
  const [mfaLoading, setMfaLoading] = React.useState(false);
  const [mfaError, setMfaError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Invalid email or password');
      }

      if (data.mfa_required) {
        setMfaFactorId(data.factor_id);
        setMfaTempToken(data.temp_token);
        setShowMfaModal(true);
        setLoading(false);
        return;
      }

      setUser({
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
      });
      setToken(data.access_token);
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      document.cookie = `devora_token=${data.access_token}; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = totpCode.trim();
    if (cleanCode.length !== 6) {
      setMfaError('Please enter a 6-digit verification code.');
      return;
    }

    setMfaLoading(true);
    setMfaError(null);

    try {
      const challengeRes = await fetch('http://127.0.0.1:8000/api/v1/auth/mfa/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mfaTempToken}`,
        },
        body: JSON.stringify({ factor_id: mfaFactorId }),
      });

      const challengeData = await challengeRes.json();
      if (!challengeRes.ok) {
        throw new Error(challengeData.detail || 'Failed to initialize MFA challenge.');
      }

      const verifyRes = await fetch('http://127.0.0.1:8000/api/v1/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mfaTempToken}`,
        },
        body: JSON.stringify({
          factor_id: mfaFactorId,
          challenge_id: challengeData.id,
          code: cleanCode,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.detail || 'Invalid verification code. Please check your authenticator app.');
      }

      const finalToken = verifyData.access_token;
      if (!finalToken) {
        throw new Error('MFA verification did not return an upgraded session token. Please try again.');
      }
      const verifiedUser = verifyData.user || {};

      setUser({
        id: verifiedUser.id || 'devora-user',
        email: verifiedUser.email || email,
        full_name: verifiedUser.user_metadata?.full_name || null,
      });
      setToken(finalToken);
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      document.cookie = `devora_token=${finalToken}; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      setShowMfaModal(false);
      router.push('/dashboard');
    } catch (err: any) {
      setMfaError(err.message || 'MFA verification failed');
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <div className="bg-[#fbfaf6] min-h-[100svh] text-[#0b1f24] font-sans">
      <div className="max-w-[1800px] min-h-[100svh] mx-auto p-0 md:p-3 xl:p-4 grid grid-cols-1 md:grid-cols-[56%_44%] lg:grid-cols-[55%_45%]">
        {/* Left Side Content */}
        <section
          className="flex flex-col min-w-0 bg-white rounded-none md:rounded-l-[20px] min-h-[100svh] md:min-h-0 border-r border-[#e3ebe8]"
          aria-label="Sign in to Devora"
        >
          {/* Header */}
          <header className="flex items-center justify-between px-6 sm:px-7 md:px-6 lg:px-[38px] py-5 gap-4">
            <Link
              className="flex items-center gap-[9px] text-[26px] sm:text-[28px] font-extrabold text-[#0b1f24] tracking-tight no-underline"
              href="/"
              aria-label="Devora home"
            >
              <svg className="w-[30px] height-[34px] shrink-0" width="30" height="34">
                <use href="#logo-mark" />
              </svg>
              <span>
                Devora<i className="brand-dot not-italic text-[#f59e0b] -ml-[3px]">.</i>
              </span>
            </Link>
            <Link
              className="inline-flex items-center gap-[7px] text-[11px] font-bold text-[#5b6b70] hover:text-[#0f766e] transition-colors no-underline"
              href="/"
            >
              <ArrowLeft size={14} /> Back to website
            </Link>
          </header>

          {/* Main Form Body */}
          <main
            className="w-[calc(100%-56px)] sm:w-[calc(100%-80px)] max-w-[380px] mx-auto my-auto py-8 sm:py-[34px]"
            id="auth-main"
          >
            <span className="flex items-center gap-[7px] text-[10px] font-extrabold tracking-[1.3px] text-[#0f766e] mb-4 uppercase">
              <span className="text-[#f59e0b] text-[17px] leading-none">✦</span> YOUR NEXT CHAPTER CONTINUES
            </span>
            <h1 className="text-[36px] sm:text-[40px] font-extrabold tracking-[-1.8px] leading-[1.15] text-[#0b1f24] m-0">
              Welcome <em className="accent-word not-italic text-[#0f766e]">back.</em>
            </h1>
            <p className="mt-[14px] text-[13px] leading-[1.8] text-[#5b6b70]">
              Your ideas, your work, your next big thing.
              <br />
              Let’s pick up where you left off.
            </p>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3 mt-[27px]">
              <button
                type="button"
                className="min-h-[45px] border border-[#d2e1dc] rounded-[12px] flex items-center justify-center gap-[10px] bg-white text-[12px] font-bold text-[#1c3238] hover:bg-[#f3f7f4] hover:border-[#14b8a6] hover:-translate-y-[1px] transition-all cursor-pointer shadow-sm"
                onClick={() => router.push('/dashboard')}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.93c-2.95 0-5.35-2.4-5.35-5.35S8.05 6.23 11 6.23c1.45 0 2.67.53 3.6 1.41l-1.46 1.41c-.4-.38-1.09-.83-2.14-.83-1.84 0-3.34 1.52-3.34 3.39 0 1.87 1.5 3.39 3.34 3.39 2.13 0 2.93-1.53 3.06-2.33H11v-1.92h5.07c.05.28.09.57.09.92 0 3.07-2.06 5.25-5.16 5.25z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="min-h-[45px] border border-[#d2e1dc] rounded-[12px] flex items-center justify-center gap-[10px] bg-white text-[12px] font-bold text-[#1c3238] hover:bg-[#f3f7f4] hover:border-[#14b8a6] hover:-translate-y-[1px] transition-all cursor-pointer shadow-sm"
                onClick={() => router.push('/dashboard')}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-[15px] my-5 before:content-[''] before:h-[1px] before:flex-1 before:bg-[#e3ebe8] after:content-[''] after:h-[1px] after:flex-1 after:bg-[#e3ebe8]">
              <span className="text-[10px] font-semibold text-[#8a989c] whitespace-nowrap">or continue with email</span>
            </div>

            <p className="text-[10px] leading-[1.7] text-[#5b6b70] flex items-center gap-[6px] mb-[18px]">
              <Info size={13} className="shrink-0 text-[#0f766e]" /> Enter your credentials to access your workspace.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="p-3 mb-4 text-[11px] text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg font-semibold">
                  {error}
                </div>
              )}
              <div className="mb-[18px]">
                <label className="block text-[11.5px] font-bold mb-2 text-[#1c3238]" htmlFor="email">
                  Email address
                </label>
                <div className="min-h-[46px] relative flex items-center border border-[#d2e1dc] bg-white rounded-[10px] focus-within:border-[#14b8a6] focus-within:ring-4 focus-within:ring-[#ccfbf1] transition-all">
                  <Mail className="w-4 h-4 text-[#8a989c] absolute left-[14px] pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full min-w-0 h-[46px] border-0 rounded-[10px] bg-transparent pl-[41px] pr-[43px] text-[#0b1f24] text-[12px] placeholder:text-[#8a989c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mb-[18px]">
                <label className="block text-[11.5px] font-bold mb-2 text-[#1c3238]" htmlFor="password">
                  Password
                </label>
                <div className="min-h-[46px] relative flex items-center border border-[#d2e1dc] bg-white rounded-[10px] focus-within:border-[#14b8a6] focus-within:ring-4 focus-within:ring-[#ccfbf1] transition-all">
                  <LockKeyhole className="w-4 h-4 text-[#8a989c] absolute left-[14px] pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full min-w-0 h-[46px] border-0 rounded-[10px] bg-transparent pl-[41px] pr-[43px] text-[#0b1f24] text-[12px] placeholder:text-[#8a989c] focus:outline-none"
                  />
                  <button
                    type="button"
                    className="inline-flex items-center justify-center absolute right-[3px] w-[39px] h-[40px] text-[#8a989c] hover:bg-[#e6f4f0] hover:text-[#0f766e] rounded-[8px] transition-colors cursor-pointer border-0 bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-[10px] my-4">
                <label className="flex items-center gap-2 text-[11px] leading-[1.7] text-[#5b6b70] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-[#0f766e] w-[14px] h-[14px] m-0 shrink-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-[11px] p-0 text-[#0f766e] font-bold hover:underline underline-offset-[3px] bg-transparent border-0 cursor-pointer"
                  onClick={() => alert('Password reset requested.')}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] px-5 flex items-center justify-center gap-3 border border-transparent rounded-full bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white shadow-[0_8px_20px_-8px_rgba(15,118,110,0.6)] text-[13px] font-extrabold hover:-translate-y-[1px] hover:shadow-[0_14px_28px_-8px_rgba(15,118,110,0.7)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  'Signing In... '
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-[#5b6b70] text-[11.5px] mt-6">
              New to Devora?{' '}
              <Link className="text-[#0f766e] font-extrabold ml-1 hover:underline underline-offset-4" href="/signup">
                Create an account <span>↗</span>
              </Link>
            </p>

            <p className="flex items-center justify-center gap-[5px] mt-[15px] text-[#8a989c] text-[10px]">
              <ShieldCheck size={12} className="text-[#0f766e]" /> Secure sign-in experience
            </p>
          </main>

          {/* Footer */}
          <footer className="flex justify-between items-center gap-4 px-6 sm:px-7 md:px-6 lg:px-[38px] pt-[17px] pb-[21px] text-[#8a989c] text-[10px] mt-auto border-t border-[#e3ebe8]">
            <span>© 2025 Devora</span>
            <div className="flex gap-5 items-center">
              <Link className="text-[#5b6b70] hover:text-[#0f766e] transition-colors no-underline" href="/">
                Privacy
              </Link>
              <Link className="text-[#5b6b70] hover:text-[#0f766e] transition-colors no-underline" href="/">
                Terms
              </Link>
              <Link className="text-[#5b6b70] hover:text-[#0f766e] transition-colors no-underline" href="/">
                Home <span>↗</span>
              </Link>
            </div>
          </footer>
        </section>

        {/* Right Side Story Panel */}
        <aside
          className="hidden md:flex relative overflow-hidden isolate rounded-[22px] bg-[#0b4f4a] min-w-0 min-h-[710px] text-white flex-col justify-between p-7 lg:p-10 xl:p-[50px_40px_30px] shadow-lg"
          aria-label="Your connected workspace"
        >
          <Image
            className="absolute -z-30 inset-0 w-full h-full object-cover object-[50%_57%] saturate-[0.6] opacity-100"
            src="/images/workspace.jpg"
            alt="A calm mountain-view workspace"
            fill
            priority
          />
          <div className="absolute inset-0 -z-20 bg-gradient-to-b from-[#083a36f5] via-[#0b4f4acc] to-[#05211f]"></div>
          <div
            className="absolute -left-[18%] top-[12%] w-[132%] h-[70%] border border-[#5eead420] rounded-full -rotate-[24deg] pointer-events-none -z-10"
            aria-hidden="true"
          ></div>

          <div className="relative">
            <span className="flex items-center gap-2 text-[9px] tracking-[1.4px] text-[#ccfbf1] font-bold uppercase">
              <span className="text-[#f59e0b] text-[17px] leading-none">✦</span> ONE PLATFORM. MORE POSSIBILITY.
            </span>
            <h2 className="text-[34px] lg:text-[42px] xl:text-[49px] leading-[1.15] tracking-[-1.8px] mt-[27px] font-extrabold text-white">
              Back to your
              <br />
              next{' '}
              <span className="font-serif italic font-normal text-[#5eead4] drop-shadow-sm">breakthrough.</span>
            </h2>
            <p className="text-[#d4ece5] text-[12px] leading-[1.9] mt-[18px]">
              Less switching. More creating.
              <br />
              Everything you need to move forward, together.
            </p>
          </div>

        

          <div className="relative z-10 mt-36">
            <p className="font-handwriting text-[#fde7c2] text-[34px] leading-[1.1] -rotate-[4deg] mb-8 drop-shadow-sm">
              Your ambition.
              <br />
              Our intelligence.
            </p>
            <div className="flex gap-[7px] flex-wrap">
              <span className="text-[10px] font-semibold text-[#ccfbf1] px-[12px] py-[6px] border border-[#5eead435] rounded-full bg-white/[0.06] backdrop-blur-sm">
                Build with AI
              </span>
              <span className="text-[10px] font-semibold text-[#ccfbf1] px-[12px] py-[6px] border border-[#5eead435] rounded-full bg-white/[0.06] backdrop-blur-sm">
                Find clarity
              </span>
              <span className="text-[10px] font-semibold text-[#ccfbf1] px-[12px] py-[6px] border border-[#5eead435] rounded-full bg-white/[0.06] backdrop-blur-sm">
                Grow your career
              </span>
            </div>
            <div className="flex justify-between gap-[10px] mt-[26px] pt-[19px] border-t border-[#5eead420] text-[8px] font-bold tracking-[1.1px] text-[#9ec7bd]">
              <span>BUILT FOR YOUR NEXT CHAPTER</span>
              <span>01 / 02</span>
            </div>
          </div>

         
        </aside>
      </div>

     
      {showMfaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1f24]/50 backdrop-blur-[3px] animate-fade-in">
          <div className="w-full max-w-[420px] bg-white rounded-2xl border border-[#d2e1dc] shadow-[0_16px_40px_rgba(11,79,74,0.16)] p-6 sm:p-7 relative animate-in fade-in zoom-in-95 duration-150">
            {/* Header Icon */}
            <div className="w-12 h-12 rounded-2xl bg-[#ccfbf1] text-[#0f766e] border border-[#99f6e4] grid place-items-center mb-4">
              <ShieldCheck size={24} />
            </div>

            <h3 className="text-[17px] font-extrabold text-[#0b1f24] tracking-tight">
              Two-Factor Authentication
            </h3>
            <p className="text-[11.5px] text-[#5b6b70] mt-1.5 leading-relaxed">
              Your account is protected by 2-step verification. Enter the 6-digit sync code from your Authenticator app to authorize this session.
            </p>

            {mfaError && (
              <div className="mt-3.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold flex items-center gap-2">
                <Info size={14} className="shrink-0 text-red-500" />
                <span>{mfaError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyMfa} className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#0b4f4a] uppercase tracking-wider mb-2">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  autoFocus
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center font-mono text-[22px] tracking-[8px] py-3 px-4 bg-[#fbfaf6] border border-[#d2e1dc] rounded-xl outline-none focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#ccfbf1]/50 text-[#0b1f24] font-bold transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={totpCode.length !== 6 || mfaLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white rounded-xl text-[12px] font-bold shadow-[0_4px_14px_rgba(15,118,110,0.25)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mfaLoading ? 'Verifying Code...' : 'Verify & Sign In'}
                {!mfaLoading && <ArrowRight size={14} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMfaModal(false);
                  setTotpCode('');
                  setMfaError(null);
                }}
                className="w-full py-2 text-center text-[11px] font-semibold text-[#5b6b70] hover:text-[#0b1f24] transition-colors cursor-pointer"
              >
                Cancel and return to sign in
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
