'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import {
  ArrowLeft,
  ArrowRight,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  Info,
  Code2,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const {
    signupFullName: fullName,
    setSignupFullName: setFullName,
    signupEmail: email,
    setSignupEmail: setEmail,
    signupPassword: password,
    setSignupPassword: setPassword,
    signupShowPassword: showPassword,
    setSignupShowPassword: setShowPassword,
    acceptTerms,
    setAcceptTerms,

    loading,
    setLoading,
    error,
    setError,
    setUser,
    setToken,
  } = useAuthStore();

  const getPasswordScore = (pass: string): number => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordScore = getPasswordScore(password);

  const getStrengthLabel = (score: number): string => {
    switch (score) {
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const getBarColor = (index: number): string => {
    if (passwordScore === 0) return 'bg-[#e3ebe8]';
    if (passwordScore === 1) return index === 0 ? 'bg-[#f59e0b]' : 'bg-[#e3ebe8]';
    if (passwordScore === 2) return index <= 1 ? 'bg-[#5eead4]' : 'bg-[#e3ebe8]';
    if (passwordScore === 3) return index <= 2 ? 'bg-[#14b8a6]' : 'bg-[#e3ebe8]';
    return 'bg-[#0f766e]';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      setError('Please accept the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Signup failed');
      }

      setUser({
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
      });

      setToken(data.access_token);
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fbfaf6] min-h-[100svh] text-[#0b1f24] font-sans">
      <div className="max-w-[1800px] min-h-[100svh] mx-auto p-0 md:p-3 xl:p-4 grid grid-cols-1 md:grid-cols-[56%_44%] lg:grid-cols-[55%_45%]">
        {/* Left Side Content */}
        <section
          className="flex flex-col min-w-0 bg-white rounded-none md:rounded-l-[20px] min-h-[100svh] md:min-h-0 border-r border-[#e3ebe8]"
          aria-label="Create a Devora account"
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
            className="w-[calc(100%-56px)] sm:w-[calc(100%-80px)] max-w-[380px] mx-auto my-auto py-6 sm:py-[28px]"
            id="auth-main"
          >
            <span className="flex items-center gap-[7px] text-[10px] font-extrabold tracking-[1.3px] text-[#0f766e] mb-3 uppercase">
              <span className="text-[#f59e0b] text-[17px] leading-none">✦</span> A LITTLE AI. A LOT OF POSSIBILITY.
            </span>
            <h1 className="text-[34px] sm:text-[38px] font-extrabold tracking-[-1.8px] leading-[1.15] text-[#0b1f24] m-0">
              Your next chapter
              <br />
              <em className="accent-word not-italic text-[#0f766e]">starts here.</em>
            </h1>
            <p className="mt-[13px] text-[12.5px] leading-[1.8] text-[#5b6b70]">
              One place to build, learn, and grow.
              <br />
              Create your Devora account to get started.
            </p>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3 mt-[24px]">
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
              <span className="text-[11px] font-medium text-[#8a989c] whitespace-nowrap">or sign up with email</span>
            </div>

            <p className="text-[10px] leading-[1.7] text-[#5b6b70] flex items-center gap-[6px] mb-4">
              <Info size={13} className="shrink-0 text-[#0f766e]" /> Create your account to start exploring Devora.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="p-3 mb-4 text-[11px] text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg font-semibold">
                  {error}
                </div>
              )}
              <div className="mb-[14px]">
                <label className="block text-[11px] font-bold mb-2 text-[#1c3238]" htmlFor="full-name">
                  Full name
                </label>
                <div className="min-h-[46px] relative flex items-center border border-[#d2e1dc] bg-white rounded-[10px] focus-within:border-[#14b8a6] focus-within:ring-4 focus-within:ring-[#ccfbf1]/50 transition-all">
                  <UserRound className="w-4 h-4 text-[#8a989c] absolute left-[14px] pointer-events-none" />
                  <input
                    id="full-name"
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full min-w-0 h-[46px] border-0 rounded-[10px] bg-transparent pl-[41px] pr-[43px] text-[#0b1f24] text-[12px] placeholder:text-[#8a989c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mb-[14px]">
                <label className="block text-[11px] font-bold mb-2 text-[#1c3238]" htmlFor="email">
                  Email address
                </label>
                <div className="min-h-[46px] relative flex items-center border border-[#d2e1dc] bg-white rounded-[10px] focus-within:border-[#14b8a6] focus-within:ring-4 focus-within:ring-[#ccfbf1]/50 transition-all">
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

              <div className="mb-[14px]">
                <label className="block text-[11px] font-bold mb-2 text-[#1c3238]" htmlFor="password">
                  Password
                </label>
                <div className="min-h-[46px] relative flex items-center border border-[#d2e1dc] bg-white rounded-[10px] focus-within:border-[#14b8a6] focus-within:ring-4 focus-within:ring-[#ccfbf1]/50 transition-all">
                  <LockKeyhole className="w-4 h-4 text-[#8a989c] absolute left-[14px] pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
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

                {/* Password Strength Meter */}
                <div className="grid grid-cols-4 gap-[5px] mt-[10px]" aria-hidden="true">
                  <span className={`h-[3px] rounded-[3px] transition-colors duration-200 ${getBarColor(0)}`} />
                  <span className={`h-[3px] rounded-[3px] transition-colors duration-200 ${getBarColor(1)}`} />
                  <span className={`h-[3px] rounded-[3px] transition-colors duration-200 ${getBarColor(2)}`} />
                  <span className={`h-[3px] rounded-[3px] transition-colors duration-200 ${getBarColor(3)}`} />
                </div>
                <div className="flex justify-between gap-2 mt-[6px] text-[10px] leading-[1.7] text-[#8a989c]">
                  <span>Use 8+ characters with numbers and symbols.</span>
                  <span className="text-[#0f766e] whitespace-nowrap font-bold">{getStrengthLabel(passwordScore)}</span>
                </div>
              </div>

              <label className="flex items-start gap-2 text-[11px] leading-[1.8] text-[#5b6b70] mt-[16px] mb-0 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                  className="accent-[#0f766e] w-[14px] h-[14px] mt-[3px] shrink-0 cursor-pointer"
                />
                <span>
                  I agree to the{' '}
                  <button
                    type="button"
                    className="text-[11px] p-0 text-[#0f766e] font-bold hover:underline underline-offset-[3px] bg-transparent border-0 cursor-pointer inline"
                    onClick={() => alert('Devora Terms of Service')}
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    className="text-[11px] p-0 text-[#0f766e] font-bold hover:underline underline-offset-[3px] bg-transparent border-0 cursor-pointer inline"
                    onClick={() => alert('Devora Privacy Policy')}
                  >
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] px-5 flex items-center justify-center gap-3 border border-transparent rounded-full bg-gradient-to-r from-[#0d9488] to-[#0b4f4a] text-white shadow-[0_8px_20px_-8px_rgba(15,118,110,0.6)] text-[13px] font-extrabold hover:-translate-y-[1px] hover:shadow-[0_14px_28px_-8px_rgba(15,118,110,0.7)] transition-all cursor-pointer mt-[22px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  'Creating Account...'
                ) : (
                  <>
                    Create Account <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-[#5b6b70] text-[11.5px] mt-6">
              Already have an account?{' '}
              <Link className="text-[#0f766e] font-extrabold ml-1 hover:underline underline-offset-4" href="/login">
                Sign in <span>↗</span>
              </Link>
            </p>

            <p className="flex items-center justify-center gap-[5px] mt-[15px] text-[#8a989c] text-[10px]">
              <ShieldCheck size={12} className="text-[#0f766e]" /> Secure sign-up experience
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
          aria-label="A brighter tomorrow"
        >
          <Image
            className="absolute -z-30 inset-0 w-full h-full object-cover object-[60%_center] saturate-[0.5] opacity-100"
            src="/images/mountains.jpg"
            alt="A hiker looking out over an inspiring mountain landscape"
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
              <span className="text-[#f59e0b] text-[17px] leading-none">✦</span> YOUR AMBITION, MEET YOUR ADVANTAGE.
            </span>
            <h2 className="text-[34px] lg:text-[42px] xl:text-[49px] leading-[1.15] tracking-[-1.8px] mt-[27px] font-extrabold text-white">
              A smarter you.
              <br />
              A <span className="font-serif italic font-normal text-[#5eead4] drop-shadow-sm">brighter</span>
              <br />
              tomorrow.
            </h2>
            <p className="text-[#d4ece5] text-[12px] leading-[1.9] mt-[18px]">
              Big ideas deserve room to grow.
              <br />
              Make your next move with Devora.
            </p>
          </div>

         

          <div className="relative z-10 mt-36">
            <p className="font-handwriting text-[#fde7c2] text-[34px] leading-[1.1] -rotate-[4deg] mb-8 drop-shadow-sm">
              Build. Learn. Grow.
              <br />
              Your way.
            </p>
            <div className="flex gap-[7px] flex-wrap">
              <span className="text-[10px] font-semibold text-[#ccfbf1] px-[12px] py-[6px] border border-[#5eead435] rounded-full bg-white/[0.06] backdrop-blur-sm">
                AI for developers
              </span>
              <span className="text-[10px] font-semibold text-[#ccfbf1] px-[12px] py-[6px] border border-[#5eead435] rounded-full bg-white/[0.06] backdrop-blur-sm">
                AI for documents
              </span>
              <span className="text-[10px] font-semibold text-[#ccfbf1] px-[12px] py-[6px] border border-[#5eead435] rounded-full bg-white/[0.06] backdrop-blur-sm">
                AI for careers
              </span>
            </div>
            <div className="flex justify-between gap-[10px] mt-[26px] pt-[19px] border-t border-[#5eead420] text-[8px] font-bold tracking-[1.1px] text-[#9ec7bd]">
              <span>ONE WORKSPACE. ENDLESS POSSIBILITY.</span>
              <span>02 / 02</span>
            </div>
          </div>

          
        </aside>
      </div>
    </div>
  );
}
