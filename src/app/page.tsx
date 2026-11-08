'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

function Counter({ target, duration = 1400 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setCount(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          let start: number | null = null;
          const step = (ts: number) => {
            if (start === null) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(target * eased));
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCount(target);
            }
          };
          requestAnimationFrame(step);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className="counter font-extrabold tracking-tight" data-target={target}>
      {count}
    </span>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const sectionIds = ['home', 'features', 'solutions', 'how-it-works', 'get-started', 'community'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if ('IntersectionObserver' in window && sections.length) {
      const navObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveNav(entry.target.id);
            }
          });
        },
        { rootMargin: '-30% 0px -55% 0px', threshold: 0 }
      );
      sections.forEach((s) => navObserver.observe(s));
      return () => navObserver.disconnect();
    }
  }, []);

  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
      return () => revealObserver.disconnect();
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        id="site-header"
        className={`sticky top-0 z-50 bg-[#fbfaf6]/80 backdrop-blur-md border-b transition-all duration-300 ${
          isScrolled
            ? 'h-[66px] border-line shadow-[0_10px_30px_-22px_rgba(11,31,36,0.25)]'
            : 'h-[76px] border-transparent'
        }`}
      >
        <div className="w-[min(1240px,calc(100%-40px))] md:w-[min(1240px,calc(100%-64px))] mx-auto h-full flex items-center justify-between gap-4">
          <a
            href="#home"
            aria-label="Devora home"
            onClick={() => setActiveNav('home')}
            className="inline-flex items-center gap-[9px] text-[27px] font-extrabold tracking-[-0.05em] text-ink select-none no-underline"
          >
            <svg className="shrink-0 drop-shadow-[0_4px_6px_rgba(15,118,110,0.18)]" width="30" height="34">
              <use href="#logo-mark" />
            </svg>
            <span>
              Devora<i className="not-italic text-amber-500 -ml-1">.</i>
            </span>
          </a>

          <nav className="hidden min-[900px]:flex items-center gap-1" id="main-navigation" aria-label="Primary">
            {[
              { id: 'home', label: 'Home' },
              { id: 'features', label: 'Features' },
              { id: 'solutions', label: 'Solutions' },
              { id: 'get-started', label: 'Pricing' },
              { id: 'community', label: 'Community' },
            ].map(({ id, label }) => {
              const isActive = activeNav === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  data-nav={id}
                  onClick={() => setActiveNav(id)}
                  className={`relative px-3.5 py-2 rounded-full text-[13px] font-bold transition-colors no-underline ${
                    isActive
                      ? 'text-teal-800 after:content-[""] after:absolute after:left-1/2 after:bottom-px after:w-4 after:h-[3px] after:rounded-full after:-translate-x-1/2 after:bg-gradient-to-r after:from-teal-500 after:to-amber-400'
                      : 'text-ink-2 hover:bg-tint hover:text-teal-900'
                  }`}
                >
                  {label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
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
            <button
              id="menu-toggle"
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex min-[900px]:hidden flex-col justify-center gap-1 w-10 h-10 rounded-full border border-line-2 bg-white cursor-pointer px-[11px]"
            >
              <span className={`h-[2px] rounded-full bg-ink transition-all duration-300 ${menuOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
              <span className={`h-[2px] rounded-full bg-ink transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-[2px] rounded-full bg-ink transition-all duration-300 ${menuOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
            </button>
          </div>
        </div>

        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className={`absolute left-0 right-0 top-full flex flex-col gap-1 p-[14px_20px_20px] bg-[#fbfaf6]/95 border-b border-line shadow-lg transition-all duration-300 ${
            menuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-2'
          }`}
        >
          <a href="#home" onClick={closeMenu} className="p-[12px_14px] rounded-r-sm text-[15px] font-bold text-ink hover:bg-tint hover:text-teal-900 no-underline">Home</a>
          <a href="#features" onClick={closeMenu} className="p-[12px_14px] rounded-r-sm text-[15px] font-bold text-ink hover:bg-tint hover:text-teal-900 no-underline">Features</a>
          <a href="#solutions" onClick={closeMenu} className="p-[12px_14px] rounded-r-sm text-[15px] font-bold text-ink hover:bg-tint hover:text-teal-900 no-underline">Solutions</a>
          <a href="#get-started" onClick={closeMenu} className="p-[12px_14px] rounded-r-sm text-[15px] font-bold text-ink hover:bg-tint hover:text-teal-900 no-underline">Pricing</a>
          <a href="#community" onClick={closeMenu} className="p-[12px_14px] rounded-r-sm text-[15px] font-bold text-ink hover:bg-tint hover:text-teal-900 no-underline">Community</a>
          <Link href="/about" onClick={closeMenu} className="p-[12px_14px] rounded-r-sm text-[15px] font-bold text-ink hover:bg-tint hover:text-teal-900 no-underline">About Us</Link>
          <Link href="/contact" onClick={closeMenu} className="p-[12px_14px] rounded-r-sm text-[15px] font-bold text-ink hover:bg-tint hover:text-teal-900 no-underline">Contact</Link>
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
        </nav>
      </header>

      <main id="main">
        <section
          id="home"
          className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 [background:linear-gradient(160deg,#fff_0%,#fbfaf6_45%,#e6f4f0_100%)]"
        >
          <div
            className="absolute -z-10 rounded-full blur-[70px] pointer-events-none animate-orb w-[520px] h-[520px] -top-[200px] -right-[120px] [background:radial-gradient(circle,rgba(94,234,212,0.55),rgba(94,234,212,0)_70%)]"
            aria-hidden="true"
          />
          <div
            className="absolute -z-10 rounded-full blur-[70px] pointer-events-none animate-orb w-[420px] h-[420px] -bottom-[80px] -left-[140px] [background:radial-gradient(circle,rgba(253,231,194,0.9),rgba(253,231,194,0)_70%)]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 -z-20 opacity-30 pointer-events-none [background-image:linear-gradient(rgba(15,118,110,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,.07)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,#000_20%,transparent_75%)] [-webkit-mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,#000_20%,transparent_75%)]"
            aria-hidden="true"
          />

          <div className="w-[min(1240px,calc(100%-40px))] md:w-[min(1240px,calc(100%-64px))] mx-auto grid grid-cols-1 min-[900px]:grid-cols-[46%_54%] min-[900px]:gap-0 min-[900px]:min-h-[540px] items-center gap-10">
            <div>
             
              <h1 className="text-[clamp(50px,7.4vw,92px)] font-extrabold leading-[1.02] tracking-[-0.055em] text-ink animate-hero-up [animation-delay:0.08s]">
                From Ideas
                <br />
                to Impact,
                <br />
                <em className="relative inline-block text-[1.04em] bg-gradient-to-r from-teal-800 via-teal-500 to-amber-500 bg-clip-text text-transparent font-serif italic font-normal tracking-tight after:content-[''] after:absolute after:left-[2%] after:right-[4%] after:-bottom-1 after:h-[7px] after:rounded-full after:bg-gradient-to-r after:from-amber-400 after:to-teal-300 after:opacity-75 after:origin-left after:animate-underline-in after:-rotate-2">Faster.</em>
              </h1>

              <p className="mt-6 text-[15.5px] leading-[1.8] text-muted max-w-[460px] animate-hero-up [animation-delay:0.18s]">
                Devora brings your code, documents, and career tools together with AI — so you can plan, build, and
                grow without switching between dozens of apps.
              </p>

              <div className="flex flex-wrap gap-3 mt-7 animate-hero-up [animation-delay:0.28s]">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 min-h-[50px] px-[26px] rounded-full text-[14px] font-extrabold tracking-[-0.01em] whitespace-nowrap text-white bg-gradient-to-r from-teal-700 to-teal-900 shadow-[0_8px_20px_-8px_rgba(15,118,110,0.6)] hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-10px_rgba(15,118,110,0.65)] transition-all duration-300 no-underline cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <span className="text-[18px] leading-none transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 min-h-[50px] px-[26px] rounded-full text-[14px] font-extrabold tracking-[-0.01em] whitespace-nowrap text-ink bg-white/70 border border-line-2 backdrop-blur-sm hover:-translate-y-0.5 hover:border-teal-500 hover:shadow-[0_10px_24px_-12px_rgba(15,118,110,0.35)] transition-all duration-300 no-underline cursor-pointer"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m10 8 6 4-6 4Z" fill="currentColor" />
                  </svg>
                  <span>Watch Demo</span>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-9 pt-6 border-t border-line animate-hero-up [animation-delay:0.38s]">
                <div className="flex -space-x-2.5" aria-hidden="true">
                  <span className="inline-grid place-items-center w-8 h-8 rounded-full text-[9px] font-extrabold border-2 border-white shadow-sm bg-gradient-to-br from-[#ccfbf1] to-[#5eead4] text-[#0b4f4a]">AR</span>
                  <span className="inline-grid place-items-center w-8 h-8 rounded-full text-[9px] font-extrabold border-2 border-white shadow-sm bg-gradient-to-br from-[#fde7c2] to-[#fbbf24] text-[#7c3f00]">SK</span>
                  <span className="inline-grid place-items-center w-8 h-8 rounded-full text-[9px] font-extrabold border-2 border-white shadow-sm bg-gradient-to-br from-[#d4ece5] to-[#7fb8ab] text-[#0b3a35]">HM</span>
                  <span className="inline-grid place-items-center w-8 h-8 rounded-full text-[9px] font-extrabold border-2 border-white shadow-sm bg-gradient-to-br from-[#ffe4e6] to-[#fda4af] text-[#881337]">JL</span>
                  <span className="inline-grid place-items-center w-8 h-8 rounded-full text-[9px] font-extrabold border-2 border-white shadow-sm bg-gradient-to-br from-[#e0f2fe] to-[#7dd3fc] text-[#0c4a6e]">MN</span>
                </div>
                <div>
                  <strong className="block text-[15px] font-extrabold tracking-[-0.02em] leading-tight text-ink">
                    <Counter target={10} />K+
                  </strong>
                  <small className="text-[11px] text-muted font-medium">Developers &amp; Professionals trust Devora</small>
                </div>
                <div className="flex flex-col pl-6 border-l border-line-2 max-sm:hidden">
                  <span className="text-amber-500 tracking-[2px] text-[14px] leading-tight block" aria-label="Rated 4.9 out of 5">
                    ★★★★★
                  </span>
                  <small className="text-[11px] text-muted font-medium">4.9 / 5 average rating</small>
                </div>
              </div>
            </div>

            {/* Art scene */}
            <div
              className="relative h-[clamp(360px,60vw,540px)] max-w-[620px] mx-auto w-full min-[900px]:ml-5 min-[900px]:max-w-none flex items-center justify-center animate-hero-scale"
              aria-hidden="true"
            >
              <div className="absolute inset-[10%_-10%] rounded-full blur-[24px] pointer-events-none [background:radial-gradient(ellipse_at_center,rgba(94,234,212,0.4),transparent_65%)]" />
              <div className="absolute inset-[-6px_-14px_4px_-10px] border-[1.5px] border-dashed border-teal-800/25 rounded-[48%] animate-spin-slow pointer-events-none -rotate-12" />

              <div className="absolute z-20 font-hand text-[23px] leading-[1.05] font-semibold text-teal-900 whitespace-nowrap select-none -top-[22px] left-[26%] -rotate-6 max-[899px]:left-[22%] max-[899px]:-top-[16px] max-[899px]:text-[20px]">
                All Your Tools
                <br />
                In One Place
                <svg className="absolute w-[46px] h-auto text-amber-500 -left-[46px] top-[14px] rotate-[87deg]" viewBox="0 0 90 70">
                  <use href="#curved-arrow" />
                </svg>
              </div>

              <div className="relative z-10 w-full h-full flex items-center justify-center select-none">
                <Image
                  src="/images/dev.png"
                  alt="Devora AI Mascot"
                  width={600}
                  height={600}
                  priority
                  className="w-auto h-auto max-h-[86%] max-w-[90%] object-contain drop-shadow-[0_24px_48px_rgba(11,79,74,0.30)] select-none pointer-events-none"
                />
              </div>

              {/* floating tiles */}
              <div className="absolute z-10 grid place-items-center w-[58px] h-[58px] max-[899px]:w-[48px] max-[899px]:h-[48px] rounded-[17px] max-[899px]:rounded-[14px] bg-white/95 border border-white/90 shadow-[0_14px_30px_-10px_rgba(11,79,74,0.3)] text-ink-2 transition-transform hover:scale-110 left-[7%] top-0 -rotate-12 animate-float" title="GitHub">
                <svg className="w-[27px] h-[27px] max-[899px]:w-[23px] max-[899px]:h-[23px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </div>
              <div className="absolute z-10 grid place-items-center w-[58px] h-[58px] max-[899px]:w-[48px] max-[899px]:h-[48px] rounded-[17px] max-[899px]:rounded-[14px] bg-white/95 border border-white/90 shadow-[0_14px_30px_-10px_rgba(11,79,74,0.3)] text-ink-2 transition-transform hover:scale-110 -left-[2%] top-[36%] -rotate-6 animate-float-b" title="Notion">
                <span className="font-serif font-extrabold text-[27px] max-[899px]:text-[22px] leading-none px-1 border-[1.5px] border-current rounded shadow-[2px_2px_0_currentColor]">N</span>
              </div>
              <div className="absolute z-10 grid place-items-center w-[58px] h-[58px] max-[899px]:w-[48px] max-[899px]:h-[48px] rounded-[17px] max-[899px]:rounded-[14px] bg-white/95 border border-white/90 shadow-[0_14px_30px_-10px_rgba(11,79,74,0.3)] text-teal-700 transition-transform hover:scale-110 right-[4%] top-[3%] rotate-12 animate-float-c" title="Google Drive">
                <svg className="w-[27px] h-[27px] max-[899px]:w-[23px] max-[899px]:h-[23px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.74 3.5 1.5 14.25l4.5 7.75 6.25-10.75zm8.52 0H7.74l6.25 10.75h8.51zm.74 1.25L10.75 15.5 13 19.5h8.5l2.25-4z" />
                </svg>
              </div>
              <div className="absolute z-10 grid place-items-center w-[58px] h-[58px] max-[899px]:w-[48px] max-[899px]:h-[48px] rounded-[17px] max-[899px]:rounded-[14px] bg-white/95 border border-white/90 shadow-[0_14px_30px_-10px_rgba(11,79,74,0.3)] text-coral transition-transform hover:scale-110 -right-[3%] top-[40%] rotate-12 animate-float" title="Slack">
                <svg className="w-[27px] h-[27px] max-[899px]:w-[23px] max-[899px]:h-[23px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                </svg>
              </div>
              <div className="absolute z-10 grid place-items-center w-[58px] h-[58px] max-[899px]:w-[48px] max-[899px]:h-[48px] rounded-[17px] max-[899px]:rounded-[14px] bg-white/95 border border-white/90 shadow-[0_14px_30px_-10px_rgba(11,79,74,0.3)] text-amber-500 transition-transform hover:scale-110 right-[14%] bottom-[2%] rotate-12 animate-float-b" title="Figma">
                <svg className="w-[27px] h-[27px] max-[899px]:w-[23px] max-[899px]:h-[23px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4zM4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4zm0-8c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4zm8-4h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0zm0 8h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V8z" />
                </svg>
              </div>
              <div className="absolute z-10 grid place-items-center w-[58px] h-[58px] max-[899px]:w-[48px] max-[899px]:h-[48px] rounded-[17px] max-[899px]:rounded-[14px] bg-white/95 border border-white/90 shadow-[0_14px_30px_-10px_rgba(11,79,74,0.3)] text-teal-800 transition-transform hover:scale-110 left-[3%] bottom-[3%] -rotate-12 animate-float-c" title="VS Code">
                <svg className="w-[27px] h-[27px] max-[899px]:w-[23px] max-[899px]:h-[23px]" viewBox="0 0 32 32" fill="currentColor">
                  <path d="m23 2 8 4v20l-8 4L10 19l-6 5-4-2V10l4-2 6 5Zm0 7-9 7 9 7ZM4 12v8l4-4Z" />
                </svg>
              </div>

              <div className="absolute z-20 font-hand text-[23px] leading-[1.05] font-semibold text-teal-900 whitespace-nowrap select-none -bottom-[48px] right-[4%] -rotate-6 max-[899px]:bottom-[-40px] max-[899px]:text-[20px]">
                Code, Docs, &
                <br />
                Career in Sync
                <svg className="absolute w-[46px] h-auto text-amber-500 -left-[52px] -top-[12px] rotate-[169deg]" viewBox="0 0 90 70">
                  <use href="#curved-arrow" />
                </svg>
              </div>
            </div>
          </div>

          {/* Waves */}
          <svg className="block w-full h-[60px] sm:h-[90px] min-[900px]:h-[120px] -mt-px" viewBox="0 0 1440 150" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 55C190 150 320 120 535 74S853 5 1070 65s270 30 370-25v110H0Z" fill="#e6f4f0" />
            <path
              d="M0 85c230-58 312 87 555 13S823 56 1048 89s320-38 392-70v131H0Z"
              fill="#c9ece3"
              fillOpacity=".7"
            />
            <path
              d="M0 83c208 102 329 14 551 27s316 40 503 0 256-52 386-28v68H0Z"
              fill="#fde7c2"
              fillOpacity=".45"
            />
            <path
              d="M0 124c180-50 332 43 582-8s309-7 524 7 244-65 334-52v79H0Z"
              fill="#5eead4"
              fillOpacity=".28"
            />
            <path d="M0 119c249 51 385-13 598 6s300 13 511-3 249-13 331-7v35H0Z" fill="#fbfaf6" />
          </svg>
        </section>

        <section className="py-7 border-b border-line text-center bg-bg" aria-label="Trusted by professionals">
          <div className="w-[min(1240px,calc(100%-40px))] md:w-[min(1240px,calc(100%-64px))] mx-auto">
            <p className="text-[10.5px] tracking-[0.18em] uppercase font-extrabold text-muted-2">Trusted by developers, engineers and professionals worldwide</p>
          </div>
          <div className="relative overflow-hidden mt-5 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]" aria-hidden="true">
            <div className="flex items-center gap-16 shrink-0 animate-marquee min-w-full hover:[animation-play-state:paused]" id="marquee-track">
              {/* Set 1 */}
              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <b className="text-[23px] font-bold tracking-[-0.04em] text-[#4285f4]">G</b>
                <b className="text-[23px] font-bold tracking-[-0.04em] text-[#ea4335]">o</b>
                <b className="text-[23px] font-bold tracking-[-0.04em] text-[#fbbc05]">o</b>
                <b className="text-[23px] font-bold tracking-[-0.04em] text-[#4285f4]">g</b>
                <b className="text-[23px] font-bold tracking-[-0.04em] text-[#34a853]">l</b>
                <b className="text-[23px] font-bold tracking-[-0.04em] text-[#ea4335]">e</b>
              </span>
              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z" />
                </svg>
                Microsoft
              </span>
              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <svg viewBox="0 0 24 24" width="30" height="22" fill="currentColor">
                  <path d="M18.794 13.906c-1.396 1.045-3.414 1.636-5.184 1.636-2.484 0-4.733-.943-6.43-2.517-.134-.124-.145-.333-.023-.468.121-.135.328-.146.467-.024 1.583 1.458 3.682 2.333 6.002 2.333 1.65 0 3.535-.55 4.843-1.528.21-.157.488.04.325.268zm.972-.27c-.179-.23-.974-.11-1.353-.06-.118.016-.135-.079-.029-.153.684-.482 1.808-.343 2.02-.078.211.265-.054 1.408-.702 1.94-.1.082-.195.039-.148-.07.151-.353.39-1.349.212-1.579z" />
                </svg>
                AWS
              </span>
              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </span>
              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <b className="font-normal text-[22px]">▲</b>Vercel
              </span>
              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <b className="font-serif text-[20px] border border-current px-[3px] leading-none">N</b>Notion
              </span>
              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4zM4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4zm0-8c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4zm8-4h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0zm0 8h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V8z" />
                </svg>
                Figma
              </span>
              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <svg viewBox="0 0 32 32" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <ellipse cx="16" cy="16" rx="7" ry="13" />
                  <ellipse cx="16" cy="16" rx="7" ry="13" transform="rotate(60 16 16)" />
                  <ellipse cx="16" cy="16" rx="7" ry="13" transform="rotate(120 16 16)" />
                </svg>
                OpenAI
              </span>

              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <b className="text-[23px] font-bold tracking-[-0.04em] text-[#4285f4]">G</b>
                <b className="text-[23px] font-bold tracking-[-0.04em] text-[#ea4335]">o</b>
                <b className="text-[23px] font-bold tracking-[-0.04em] text-[#fbbc05]">o</b>
                <b className="text-[23px] font-bold tracking-[-0.04em] text-[#4285f4]">g</b>
                <b className="text-[23px] font-bold tracking-[-0.04em] text-[#34a853]">l</b>
                <b className="text-[23px] font-bold tracking-[-0.04em] text-[#ea4335]">e</b>
              </span>
              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z" />
                </svg>
                Microsoft
              </span>
              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <svg viewBox="0 0 24 24" width="30" height="22" fill="currentColor">
                  <path d="M18.794 13.906c-1.396 1.045-3.414 1.636-5.184 1.636-2.484 0-4.733-.943-6.43-2.517-.134-.124-.145-.333-.023-.468.121-.135.328-.146.467-.024 1.583 1.458 3.682 2.333 6.002 2.333 1.65 0 3.535-.55 4.843-1.528.21-.157.488.04.325.268zm.972-.27c-.179-.23-.974-.11-1.353-.06-.118.016-.135-.079-.029-.153.684-.482 1.808-.343 2.02-.078.211.265-.054 1.408-.702 1.94-.1.082-.195.039-.148-.07.151-.353.39-1.349.212-1.579z" />
                </svg>
                AWS
              </span>
              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </span>
              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <b className="font-normal text-[22px]">▲</b>Vercel
              </span>
              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <b className="font-serif text-[20px] border border-current px-[3px] leading-none">N</b>Notion
              </span>
              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4zM4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4zm0-8c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4zm8-4h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0zm0 8h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V8z" />
                </svg>
                Figma
              </span>
              <span className="inline-flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.03em] text-[#6c7a7e] opacity-85 hover:text-ink hover:opacity-100 transition-all whitespace-nowrap">
                <svg viewBox="0 0 32 32" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <ellipse cx="16" cy="16" rx="7" ry="13" />
                  <ellipse cx="16" cy="16" rx="7" ry="13" transform="rotate(60 16 16)" />
                  <ellipse cx="16" cy="16" rx="7" ry="13" transform="rotate(120 16 16)" />
                </svg>
                OpenAI
              </span>
            </div>
          </div>
        </section>

        <section className="py-[clamp(64px,8vw,96px)]" id="features">
          <div className="w-[min(1240px,calc(100%-40px))] md:w-[min(1240px,calc(100%-64px))] mx-auto">
            <div className="mb-11 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 reveal">
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.14em] uppercase text-teal-800 mb-4 before:content-[''] before:w-[22px] before:h-[2px] before:rounded-full before:bg-gradient-to-r before:from-teal-500 before:to-amber-400">What you can do</span>
                <h2 className="text-[clamp(32px,4.4vw,46px)] font-extrabold tracking-[-0.035em] leading-[1.12] text-ink">
                  Everything You Need,
                  <br />
                  <em className="font-serif italic font-normal text-teal-800 tracking-tight">In One Place.</em>
                </h2>
                <p className="mt-3.5 text-[15px] leading-[1.75] text-muted max-w-[520px]">Search documents, tailor resumes, and prepare for interviews in one focused workspace.</p>
              </div>
              <a
                href="#how-it-works"
                className="group hidden sm:inline-flex items-center justify-center gap-2 min-h-[42px] px-5 rounded-full text-[13px] font-extrabold tracking-[-0.01em] whitespace-nowrap text-ink bg-white/70 border border-line-2 backdrop-blur-sm hover:-translate-y-0.5 hover:border-teal-500 hover:shadow-[0_10px_24px_-12px_rgba(15,118,110,0.35)] transition-all duration-300 no-underline cursor-pointer"
              >
                <span>Explore All Features</span>
                <span className="text-[18px] leading-none transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </a>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <article className="group relative flex flex-col p-[28px_24px_22px] rounded-r-lg bg-white border border-line shadow-xs overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-300 hover:shadow-md reveal">
                <span className="absolute top-[22px] right-[22px] font-serif italic text-[22px] text-teal-300">01</span>
                <span className="relative grid place-items-center w-[50px] h-[50px] rounded-[15px] bg-gradient-to-br from-teal-100 to-tint text-teal-800 border border-line-2 mb-[22px] transition-all duration-300 group-hover:-rotate-6 group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-teal-700 group-hover:to-teal-900 group-hover:text-white">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="M10 9H8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                  </svg>
                </span>
                <h3 className="text-[19px] font-extrabold leading-[1.3] tracking-[-0.025em] mb-3 text-ink">
                  Document
                  <br />
                  Intelligence
                </h3>
                <p className="text-[13.5px] leading-[1.8] text-muted flex-1 mb-[22px]">Upload PDFs, specs, and papers to extract verified answers with direct page citations.</p>
                <a
                  href="#how-it-works"
                  className="group/link relative flex items-center justify-between pt-3.5 border-t border-line text-[12px] font-extrabold text-teal-800 hover:text-teal-900 no-underline"
                >
                  <span>Learn More</span>
                  <span className="text-[18px] leading-none transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">↗</span>
                </a>
              </article>

              <article className="group relative flex flex-col p-[28px_24px_22px] rounded-r-lg bg-white border border-line shadow-xs overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-300 hover:shadow-md reveal delay-1">
                <span className="absolute top-[22px] right-[22px] font-serif italic text-[22px] text-teal-300">02</span>
                <span className="relative grid place-items-center w-[50px] h-[50px] rounded-[15px] bg-gradient-to-br from-teal-100 to-tint text-teal-800 border border-line-2 mb-[22px] transition-all duration-300 group-hover:-rotate-6 group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-teal-700 group-hover:to-teal-900 group-hover:text-white">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 2v2" />
                    <path d="M17.915 22a6 6 0 0 0-12 0" />
                    <path d="M8 2v2" />
                    <circle cx="12" cy="12" r="4" />
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                  </svg>
                </span>
                <h3 className="text-[19px] font-extrabold leading-[1.3] tracking-[-0.025em] mb-3 text-ink">
                  Resume
                  <br />
                  Intelligence
                </h3>
                <p className="text-[13.5px] leading-[1.8] text-muted flex-1 mb-[22px]">Analyze resumes against job descriptions, highlight missing keywords, and tailor bullet points.</p>
                <a
                  href="#how-it-works"
                  className="group/link relative flex items-center justify-between pt-3.5 border-t border-line text-[12px] font-extrabold text-teal-800 hover:text-teal-900 no-underline"
                >
                  <span>Learn More</span>
                  <span className="text-[18px] leading-none transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">↗</span>
                </a>
              </article>

              <article className="group relative flex flex-col p-[28px_24px_22px] rounded-r-lg bg-white border border-line shadow-xs overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-300 hover:shadow-md reveal delay-2">
                <span className="absolute top-[22px] right-[22px] font-serif italic text-[22px] text-teal-300">03</span>
                <span className="relative grid place-items-center w-[50px] h-[50px] rounded-[15px] bg-gradient-to-br from-teal-100 to-tint text-teal-800 border border-line-2 mb-[22px] transition-all duration-300 group-hover:-rotate-6 group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-teal-700 group-hover:to-teal-900 group-hover:text-white">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    <rect width="20" height="14" x="2" y="6" rx="2" />
                  </svg>
                </span>
                <h3 className="text-[19px] font-extrabold leading-[1.3] tracking-[-0.025em] mb-3 text-ink">
                  Job
                  <br />
                  Intelligence
                </h3>
                <p className="text-[13.5px] leading-[1.8] text-muted flex-1 mb-[22px]">Match your technical profile against role requirements and identify skill gaps before applying.</p>
                <a
                  href="#how-it-works"
                  className="group/link relative flex items-center justify-between pt-3.5 border-t border-line text-[12px] font-extrabold text-teal-800 hover:text-teal-900 no-underline"
                >
                  <span>Learn More</span>
                  <span className="text-[18px] leading-none transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">↗</span>
                </a>
              </article>

              <article className="group relative flex flex-col p-[28px_24px_22px] rounded-r-lg bg-white border border-line shadow-xs overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-300 hover:shadow-md reveal delay-3">
                <span className="absolute top-[22px] right-[22px] font-serif italic text-[22px] text-teal-300">04</span>
                <span className="relative grid place-items-center w-[50px] h-[50px] rounded-[15px] bg-gradient-to-br from-teal-100 to-tint text-teal-800 border border-line-2 mb-[22px] transition-all duration-300 group-hover:-rotate-6 group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-teal-700 group-hover:to-teal-900 group-hover:text-white">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 7h6v6" />
                    <path d="m22 7-8.5 8.5-5-5L2 17" />
                  </svg>
                </span>
                <h3 className="text-[19px] font-extrabold leading-[1.3] tracking-[-0.025em] mb-3 text-ink">
                  Career
                  <br />
                  Assistant
                </h3>
                <p className="text-[13.5px] leading-[1.8] text-muted flex-1 mb-[22px]">Run realistic technical mock interviews, track applications, and draft tailored cover letters.</p>
                <a
                  href="#how-it-works"
                  className="group/link relative flex items-center justify-between pt-3.5 border-t border-line text-[12px] font-extrabold text-teal-800 hover:text-teal-900 no-underline"
                >
                  <span>Learn More</span>
                  <span className="text-[18px] leading-none transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">↗</span>
                </a>
              </article>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="py-[clamp(64px,8vw,96px)] bg-bg-2 border-y border-line [background:radial-gradient(900px_400px_at_15%_0%,rgba(94,234,212,0.18),transparent_60%),radial-gradient(700px_360px_at_90%_100%,rgba(253,231,194,0.55),transparent_60%),#f3f7f4]"
        >
          <div className="w-[min(1240px,calc(100%-40px))] md:w-[min(1240px,calc(100%-64px))] mx-auto grid gap-11 items-center md:grid-cols-2 lg:grid-cols-[1.05fr_1fr_0.95fr] lg:gap-12">
            <div className="reveal">
              <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.14em] uppercase text-teal-800 mb-4 before:content-[''] before:w-[22px] before:h-[2px] before:rounded-full before:bg-gradient-to-r before:from-teal-500 before:to-amber-400">How it works</span>
              <h2 className="text-[clamp(32px,4.4vw,46px)] font-extrabold tracking-[-0.035em] leading-[1.12] text-ink">
                From Raw Files
                <br />
                <em className="font-serif italic font-normal text-teal-800 tracking-tight">to Verified Answers.</em>
              </h2>
              <p className="mt-3.5 text-[15px] leading-[1.75] text-muted max-w-[340px] mb-6">
                Upload your materials, ask questions, and get precise results backed by page-level citations.
              </p>
              <a
                href="#get-started"
                className="group inline-flex items-center justify-center gap-2 min-h-[42px] px-5 rounded-full text-[13px] font-extrabold tracking-[-0.01em] whitespace-nowrap text-white bg-gradient-to-r from-teal-700 to-teal-900 shadow-[0_8px_20px_-8px_rgba(15,118,110,0.6)] hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-10px_rgba(15,118,110,0.65)] transition-all duration-300 no-underline cursor-pointer"
              >
                <span>See How It Works</span>
                <span className="text-[18px] leading-none transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </a>
              <div className="flex items-center gap-2 mt-5 text-[11.5px] text-muted-2">
                <svg
                  className="text-amber-500"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                </svg>
                <span>Grounded in your actual documents and code.</span>
              </div>
            </div>

            <ol className="relative before:content-[''] before:absolute before:left-[21px] before:top-[22px] before:bottom-[30px] before:w-[2px] before:rounded-full before:bg-gradient-to-b before:from-[#14b8a6] before:via-[#5eead4] before:via-60% before:to-[#fbbf24] reveal delay-1">
              <li className="group/step relative flex items-start gap-4 mb-5 last:mb-0">
                <span className="shrink-0 grid place-items-center w-11 h-11 rounded-full text-[12px] font-extrabold bg-gradient-to-br from-teal-700 to-teal-900 text-white border-transparent shadow-[0_0_0_6px_rgba(94,234,212,0.3),0_8px_16px_-6px_rgba(15,118,110,0.5)] transition-all duration-300">01</span>
                <div>
                  <h3 className="text-[15px] font-extrabold mb-1 mt-1.5 text-ink">Index</h3>
                  <p className="text-[12.5px] leading-[1.7] text-muted max-w-[230px]">Parses documents and extracts vector embeddings.</p>
                </div>
              </li>
              {[
                { num: '02', title: 'Retrieve', desc: 'Finds the most relevant passages in milliseconds.' },
                { num: '03', title: 'Generate', desc: 'Synthesizes answers grounded strictly in context.' },
                { num: '04', title: 'Verify', desc: 'Links claims back to exact page numbers.' },
                { num: '05', title: 'Apply', desc: 'Export answers or continue in chat and interview mode.' },
              ].map((step) => (
                <li key={step.num} className="group/step relative flex items-start gap-4 mb-5 last:mb-0">
                  <span className="shrink-0 grid place-items-center w-11 h-11 rounded-full bg-white border-[1.5px] border-line-2 text-[12px] font-extrabold text-teal-800 shadow-sm transition-all duration-300 group-hover/step:scale-105 group-hover/step:shadow-[0_0_0_6px_rgba(94,234,212,0.25)]">{step.num}</span>
                  <div>
                    <h3 className="text-[15px] font-extrabold mb-1 mt-1.5 text-ink">{step.title}</h3>
                    <p className="text-[12.5px] leading-[1.7] text-muted max-w-[230px]">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="hidden lg:flex relative flex-col items-center justify-center min-h-[360px] reveal-scale delay-2">
              <div className="absolute z-20 font-hand -top-1 right-[18px] text-[24px] rotate-6 leading-[1.05] font-semibold text-teal-900 select-none">
                Your Always-On
                <br />
                AI Teammate
                <svg className="absolute -left-[34px] top-[18px] rotate-[60deg] w-12 h-auto text-amber-500" viewBox="0 0 90 70">
                  <use href="#curved-arrow" />
                </svg>
              </div>

              <svg
                className="w-full max-h-[400px] mt-4 animate-float"
                viewBox="0 0 380 440"
                role="img"
                aria-label="Friendly white AI robot with teal highlights and glowing eyes"
              >
                <defs>
                  <linearGradient id="shell" x1="0" y1="0" x2="1" y2=".7">
                    <stop stopColor="#ffffff" />
                    <stop offset=".5" stopColor="#f4faf8" />
                    <stop offset="1" stopColor="#c7dcd6" />
                  </linearGradient>
                  <linearGradient id="face" x2=".8" y2="1">
                    <stop stopColor="#1f3a44" />
                    <stop offset="1" stopColor="#07151c" />
                  </linearGradient>
                  <linearGradient id="joint" x2="1" y2="1">
                    <stop stopColor="#5eead4" />
                    <stop offset="1" stopColor="#0f766e" />
                  </linearGradient>
                  <radialGradient id="glow">
                    <stop stopColor="#99f6e4" stopOpacity=".6" />
                    <stop offset="1" stopColor="#e6f4f0" stopOpacity="0" />
                  </radialGradient>
                  <filter id="robotShadow">
                    <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#0f3d3a" floodOpacity=".14" />
                  </filter>
                  <filter id="eyeGlow">
                    <feGaussianBlur stdDeviation="4" />
                  </filter>
                </defs>
                <ellipse cx="190" cy="257" rx="182" ry="160" fill="url(#glow)" />
                <ellipse cx="199" cy="398" rx="89" ry="11" fill="#9ec7bd" opacity=".25" />
                <g filter="url(#robotShadow)">
                  <rect x="157" y="323" width="32" height="62" rx="16" fill="url(#joint)" transform="rotate(5 173 353)" />
                  <rect x="212" y="323" width="32" height="62" rx="16" fill="url(#joint)" transform="rotate(-5 228 353)" />
                  <path d="M150 354q18-7 37 4l-2 31q-20 11-42 2Z" fill="url(#shell)" />
                  <path d="M214 357q17-8 34-1l10 34q-22 9-41-2Z" fill="url(#shell)" />
                  <path d="M145 243q-31-4-38 31l-8 34q1 18 15 20t23-17l12-29Z" fill="url(#shell)" />
                  <circle cx="133" cy="257" r="13" fill="url(#joint)" />
                  <path d="M252 245q18-17 26-47l10-28q8-14 19-7t9 20l-9 39q-12 40-43 48Z" fill="url(#shell)" />
                  <circle cx="260" cy="255" r="13" fill="url(#joint)" />
                  <path
                    d="m285 177-6-25q-2-10 5-12t12 9l6 20m-1-4 2-27q1-8 8-7t6 12l-1 31"
                    fill="url(#shell)"
                    stroke="#cfe3dd"
                    strokeWidth="2"
                  />
                  <path d="M150 237q48-18 95 0l18 72q1 24-28 31-32 10-68-2-25-9-23-34Z" fill="url(#shell)" />
                  <path d="M164 290q37 13 76-1" fill="none" stroke="#d3e6e0" strokeWidth="2" />
                  <rect x="182" y="260" width="29" height="9" rx="4.5" fill="#f59e0b" />
                  <circle cx="221" cy="264" r="3" fill="#fbbf24" />
                  <rect x="178" y="212" width="37" height="25" rx="9" fill="url(#joint)" />
                  <rect x="114" y="123" width="167" height="105" rx="43" fill="url(#shell)" transform="rotate(-6 197 175)" />
                  <rect x="129" y="137" width="139" height="72" rx="29" fill="url(#face)" transform="rotate(-6 197 175)" />
                  <g transform="rotate(-6 197 175)">
                    <g fill="#2dd4bf" filter="url(#eyeGlow)">
                      <rect x="157" y="160" width="19" height="26" rx="9" />
                      <rect x="220" y="160" width="19" height="26" rx="9" />
                    </g>
                    <rect x="159" y="160" width="15" height="24" rx="7.5" fill="#99f6e4" />
                    <rect x="222" y="160" width="15" height="24" rx="7.5" fill="#99f6e4" />
                    <path d="M187 188q10 8 21-1" fill="none" stroke="#5eead4" strokeWidth="3" strokeLinecap="round" />
                    <path d="M147 147q40-10 83-6" fill="none" stroke="#fff" opacity=".1" strokeWidth="3" />
                  </g>
                  <rect x="105" y="154" width="10" height="29" rx="5" fill="url(#joint)" />
                  <rect x="278" y="140" width="9" height="28" rx="4" fill="url(#joint)" />
                  <path d="m192 121-2-19" stroke="#9fc4bb" strokeWidth="5" strokeLinecap="round" />
                  <circle cx="190" cy="98" r="7" fill="#f59e0b" />
                </g>
                <g fill="#f59e0b" opacity=".7">
                  <path d="m80 235 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" />
                  <path d="m294 304 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" />
                </g>
              </svg>
              <span className="absolute bottom-0 text-[11px] tracking-[0.04em] text-muted-2">Focused tools for daily engineering work.</span>
            </div>
          </div>
        </section>

        <section className="py-[clamp(64px,8vw,96px)]" id="solutions">
          <div className="w-[min(1240px,calc(100%-40px))] md:w-[min(1240px,calc(100%-64px))] mx-auto">
            <div className="mb-11 text-center reveal">
              <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.14em] uppercase text-teal-800 mb-4 before:content-[''] before:w-[22px] before:h-[2px] before:rounded-full before:bg-gradient-to-r before:from-teal-500 before:to-amber-400">Use cases</span>
              <h2 className="text-[clamp(32px,4.4vw,46px)] font-extrabold tracking-[-0.035em] leading-[1.12] text-ink">
                Tailored for Developers, Students, and <em className="font-serif italic font-normal text-teal-800 tracking-tight">Teams.</em>
              </h2>
              <p className="mt-3.5 text-[15px] leading-[1.75] text-muted max-w-[520px] mx-auto">
                Whether you are parsing technical papers, preparing for interviews, or sharing team knowledge, Devora fits your workflow.
              </p>
            </div>

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <article className="group/uc flex flex-col p-[8px_8px_14px] rounded-r-lg bg-white border border-line shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-teal-300 reveal">
                <div className="relative h-[180px] overflow-hidden rounded-[20px]">
                  <Image
                    src="/images/developer.jpg"
                    alt="Developer writing code on a laptop"
                    loading="lazy"
                    width={400}
                    height={260}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/uc:scale-105"
                  />
                  <span className="absolute z-10 left-3.5 bottom-3.5 grid place-items-center w-9 h-9 rounded-[11px] bg-white text-teal-800 shadow-md">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m16 18 6-6-6-6" />
                      <path d="m8 6-6 6 6 6" />
                    </svg>
                  </span>
                </div>
                <div className="p-[20px_16px_10px] flex-1">
                  <h3 className="text-[17px] font-extrabold tracking-tight text-ink">Developers</h3>
                  <ul className="mt-3 grid gap-1.5">
                    {[
                      'Code faster with AI',
                      'Understand complex codebases',
                      'Generate documentation',
                      'Build and ship with confidence',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[12.5px] text-muted before:content-['✓'] before:grid before:place-items-center before:w-[17px] before:h-[17px] before:rounded-full before:bg-teal-100 before:text-teal-800 before:text-[10px] before:font-extrabold before:shrink-0">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="#how-it-works"
                  className="group/link relative flex items-center justify-between pt-3.5 mx-4 border-t border-line text-[12px] font-extrabold text-teal-800 hover:text-teal-900 no-underline"
                >
                  <span>Explore this path</span>
                  <span className="text-[18px] leading-none transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">↗</span>
                </a>
              </article>

              <article className="group/uc flex flex-col p-[8px_8px_14px] rounded-r-lg bg-white border border-line shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-teal-300 reveal delay-1">
                <div className="relative h-[180px] overflow-hidden rounded-[20px]">
                  <Image
                    src="/images/student.jpg"
                    alt="Student studying with a laptop"
                    loading="lazy"
                    width={400}
                    height={260}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/uc:scale-105"
                  />
                  <span className="absolute z-10 left-3.5 bottom-3.5 grid place-items-center w-9 h-9 rounded-[11px] bg-white text-teal-800 shadow-md">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
                      <path d="M22 10v6" />
                      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
                    </svg>
                  </span>
                </div>
                <div className="p-[20px_16px_10px] flex-1">
                  <h3 className="text-[17px] font-extrabold tracking-tight text-ink">Students</h3>
                  <ul className="mt-3 grid gap-1.5">
                    {[
                      'Learn new technologies',
                      'Summarize research papers',
                      'Organize study materials',
                      'Get career guidance',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[12.5px] text-muted before:content-['✓'] before:grid before:place-items-center before:w-[17px] before:h-[17px] before:rounded-full before:bg-teal-100 before:text-teal-800 before:text-[10px] before:font-extrabold before:shrink-0">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="#how-it-works"
                  className="group/link relative flex items-center justify-between pt-3.5 mx-4 border-t border-line text-[12px] font-extrabold text-teal-800 hover:text-teal-900 no-underline"
                >
                  <span>Explore this path</span>
                  <span className="text-[18px] leading-none transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">↗</span>
                </a>
              </article>

              <article className="group/uc flex flex-col p-[8px_8px_14px] rounded-r-lg bg-white border border-line shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-teal-300 reveal delay-2">
                <div className="relative h-[180px] overflow-hidden rounded-[20px]">
                  <Image
                    src="/images/professional.jpg"
                    alt="Professional smiling in an office"
                    loading="lazy"
                    width={400}
                    height={260}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/uc:scale-105"
                  />
                  <span className="absolute z-10 left-3.5 bottom-3.5 grid place-items-center w-9 h-9 rounded-[11px] bg-white text-teal-800 shadow-md">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      <rect width="20" height="14" x="2" y="6" rx="2" />
                    </svg>
                  </span>
                </div>
                <div className="p-[20px_16px_10px] flex-1">
                  <h3 className="text-[17px] font-extrabold tracking-tight text-ink">Job Seekers</h3>
                  <ul className="mt-3 grid gap-1.5">
                    {[
                      'Optimize your resume',
                      'Find relevant opportunities',
                      'Prepare for interviews',
                      'Track applications',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[12.5px] text-muted before:content-['✓'] before:grid before:place-items-center before:w-[17px] before:h-[17px] before:rounded-full before:bg-teal-100 before:text-teal-800 before:text-[10px] before:font-extrabold before:shrink-0">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="#how-it-works"
                  className="group/link relative flex items-center justify-between pt-3.5 mx-4 border-t border-line text-[12px] font-extrabold text-teal-800 hover:text-teal-900 no-underline"
                >
                  <span>Explore this path</span>
                  <span className="text-[18px] leading-none transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">↗</span>
                </a>
              </article>

              <article className="group/uc flex flex-col p-[8px_8px_14px] rounded-r-lg bg-white border border-line shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-teal-300 reveal delay-3">
                <div className="relative h-[180px] overflow-hidden rounded-[20px]">
                  <Image
                    src="/images/team.jpg"
                    alt="Team collaborating around a table"
                    loading="lazy"
                    width={400}
                    height={260}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/uc:scale-105"
                  />
                  <span className="absolute z-10 left-3.5 bottom-3.5 grid place-items-center w-9 h-9 rounded-[11px] bg-white text-teal-800 shadow-md">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </span>
                </div>
                <div className="p-[20px_16px_10px] flex-1">
                  <h3 className="text-[17px] font-extrabold tracking-tight text-ink">Teams &amp; Enterprises</h3>
                  <ul className="mt-3 grid gap-1.5">
                    {[
                      'Share knowledge securely',
                      'Automate workflows',
                      'Custom integrations',
                      'Built for scale',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[12.5px] text-muted before:content-['✓'] before:grid before:place-items-center before:w-[17px] before:h-[17px] before:rounded-full before:bg-teal-100 before:text-teal-800 before:text-[10px] before:font-extrabold before:shrink-0">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="#how-it-works"
                  className="group/link relative flex items-center justify-between pt-3.5 mx-4 border-t border-line text-[12px] font-extrabold text-teal-800 hover:text-teal-900 no-underline"
                >
                  <span>Explore this path</span>
                  <span className="text-[18px] leading-none transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">↗</span>
                </a>
              </article>
            </div>
          </div>
        </section>

        <section
          id="community"
          className="py-[clamp(64px,8vw,96px)] bg-bg-2 border-y border-line [background:radial-gradient(900px_400px_at_15%_0%,rgba(94,234,212,0.18),transparent_60%),radial-gradient(700px_360px_at_90%_100%,rgba(253,231,194,0.55),transparent_60%),#f3f7f4]"
        >
          <div className="w-[min(1240px,calc(100%-40px))] md:w-[min(1240px,calc(100%-64px))] mx-auto">
            <div className="mb-11 text-center reveal">
              <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.14em] uppercase text-teal-800 mb-4 before:content-[''] before:w-[22px] before:h-[2px] before:rounded-full before:bg-gradient-to-r before:from-teal-500 before:to-amber-400">Loved by users</span>
              <h2 className="text-[clamp(32px,4.4vw,46px)] font-extrabold tracking-[-0.035em] leading-[1.12] text-ink">
                Trusted by Developers. <em className="font-serif italic font-normal text-teal-800 tracking-tight">Built for Results.</em>
              </h2>
              <p className="mt-3.5 text-[15px] leading-[1.75] text-muted max-w-[520px] mx-auto">See how engineers and job seekers use Devora to accelerate their daily work.</p>
            </div>

            <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
              <article className="relative flex flex-col p-[28px_28px_24px] rounded-r-lg bg-white border border-line shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md reveal">
                <div className="text-amber-500 tracking-[2px] text-[14px] leading-tight block mb-4" aria-label="5 out of 5 stars">
                  ★★★★★
                </div>
                <blockquote className="relative font-serif text-[19px] leading-[1.55] text-ink-2 flex-1 mb-6">
                  “Devora has completely changed how I work. It&apos;s like having a senior developer, career coach, and
                  research assistant in one.”
                </blockquote>
                <footer className="flex items-center gap-3 pt-4 border-t border-line">
                  <span className="inline-grid place-items-center w-[38px] h-[38px] rounded-full text-[11px] font-extrabold border-2 border-white shadow-sm bg-gradient-to-br from-[#ccfbf1] to-[#5eead4] text-[#0b4f4a]">AR</span>
                  <div>
                    <h3 className="text-[13px] font-extrabold text-ink">Ali Raza</h3>
                    <p className="text-[11px] text-muted">Full Stack Developer</p>
                  </div>
                </footer>
              </article>

              <article className="relative flex flex-col p-[28px_28px_24px] rounded-r-lg bg-gradient-to-br from-teal-800 to-teal-900 text-white border-transparent shadow-[0_30px_60px_-30px_rgba(11,79,74,0.6)] md:-translate-y-3 hover:md:-translate-y-4 transition-all duration-300 reveal delay-1">
                <div className="text-amber-400 tracking-[2px] text-[14px] leading-tight block mb-4" aria-label="5 out of 5 stars">
                  ★★★★★
                </div>
                <blockquote className="relative font-serif text-[19px] leading-[1.55] text-white flex-1 mb-6">
                  “The resume and job intelligence features are incredible. I landed 3× more interviews after using
                  Devora.”
                </blockquote>
                <footer className="flex items-center gap-3 pt-4 border-t border-white/20">
                  <span className="inline-grid place-items-center w-[38px] h-[38px] rounded-full text-[11px] font-extrabold border-2 border-white shadow-sm bg-gradient-to-br from-[#fde7c2] to-[#fbbf24] text-[#7c3f00]">SK</span>
                  <div>
                    <h3 className="text-[13px] font-extrabold text-white">Sarah Khan</h3>
                    <p className="text-[11px] text-white/70">Software Engineer</p>
                  </div>
                </footer>
              </article>

              <article className="relative flex flex-col p-[28px_28px_24px] rounded-r-lg bg-white border border-line shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md reveal delay-2">
                <div className="text-amber-500 tracking-[2px] text-[14px] leading-tight block mb-4" aria-label="5 out of 5 stars">
                  ★★★★★
                </div>
                <blockquote className="relative font-serif text-[19px] leading-[1.55] text-ink-2 flex-1 mb-6">
                  “From coding to career growth, this platform actually understands my projects and gives meaningful
                  help.”
                </blockquote>
                <footer className="flex items-center gap-3 pt-4 border-t border-line">
                  <span className="inline-grid place-items-center w-[38px] h-[38px] rounded-full text-[11px] font-extrabold border-2 border-white shadow-sm bg-gradient-to-br from-[#d4ece5] to-[#7fb8ab] text-[#0b3a35]">HM</span>
                  <div>
                    <h3 className="text-[13px] font-extrabold text-ink">Hamza Malik</h3>
                    <p className="text-[11px] text-muted">ML Engineer</p>
                  </div>
                </footer>
              </article>
            </div>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mt-12 p-[28px_24px] rounded-r-lg bg-white border border-line shadow-xs reveal">
              <div className="text-center">
                <strong className="block text-[clamp(28px,3.5vw,40px)] font-extrabold tracking-tight leading-tight bg-gradient-to-r from-teal-800 to-teal-500 bg-clip-text text-transparent">
                  <Counter target={10} />K+
                </strong>
                <span className="text-[12px] text-muted font-semibold">Active users</span>
              </div>
              <div className="text-center border-l border-line">
                <strong className="block text-[clamp(28px,3.5vw,40px)] font-extrabold tracking-tight leading-tight bg-gradient-to-r from-teal-800 to-teal-500 bg-clip-text text-transparent">
                  <Counter target={2} />M+
                </strong>
                <span className="text-[12px] text-muted font-semibold">Documents analyzed</span>
              </div>
              <div className="text-center border-l border-line">
                <strong className="block text-[clamp(28px,3.5vw,40px)] font-extrabold tracking-tight leading-tight bg-gradient-to-r from-teal-800 to-teal-500 bg-clip-text text-transparent">
                  <Counter target={98} />%
                </strong>
                <span className="text-[12px] text-muted font-semibold">Would recommend</span>
              </div>
              <div className="text-center border-l border-line">
                <strong className="block text-[clamp(28px,3.5vw,40px)] font-extrabold tracking-tight leading-tight bg-gradient-to-r from-teal-800 to-teal-500 bg-clip-text text-transparent">
                  <Counter target={40} />+
                </strong>
                <span className="text-[12px] text-muted font-semibold">Integrations</span>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-5 pt-[clamp(64px,8vw,96px)]" id="get-started">
          <div className="w-[min(1240px,calc(100%-40px))] md:w-[min(1240px,calc(100%-64px))] mx-auto">
            <div className="relative min-h-[380px] rounded-[30px] overflow-hidden bg-teal-900 shadow-[0_40px_90px_-40px_rgba(11,79,74,0.6)] isolate reveal-scale">
              <Image
                src="/images/mountains.jpg"
                alt=""
                fill
                sizes="100vw"
                className="absolute inset-0 -z-30 w-full h-full object-cover opacity-70"
                priority={false}
              />
              <div className="absolute inset-0 -z-20 bg-gradient-to-r from-[#08322f]/95 via-teal-900/85 to-teal-900/25 max-sm:bg-gradient-to-b" />
              <div className="absolute -z-10 w-[380px] h-[380px] -left-[120px] -bottom-[200px] rounded-full blur-[30px] pointer-events-none [background:radial-gradient(circle,rgba(251,191,36,0.35),transparent_70%)]" />

              <div className="relative p-[clamp(32px,5vw,56px)] max-w-[600px] text-white">
                <span className="inline-block text-[10px] tracking-[0.2em] uppercase font-extrabold text-amber-400 mb-3.5">Start in seconds</span>
                <h2 className="text-[clamp(32px,4.6vw,48px)] font-extrabold leading-[1.12] tracking-tight">
                  Work Smarter Across
                  <br />
                  Code, Docs, & Careers.
                </h2>
                <p className="mt-3.5 text-[14px] leading-[1.8] text-white/80 max-w-[400px]">Join thousands of developers and students using Devora to analyze documents, practice interviews, and speed up technical work.</p>
                <div className="flex flex-wrap items-center gap-4 mt-6">
                  <Link
                    href="/signup"
                    className="group inline-flex items-center justify-center gap-2 min-h-[50px] px-[26px] rounded-full text-[14px] font-extrabold tracking-[-0.01em] whitespace-nowrap text-teal-900 bg-white shadow-md hover:-translate-y-0.5 hover:bg-amber-100 transition-all duration-300 no-underline cursor-pointer"
                  >
                    <span>Get Started Free</span>
                    <span className="text-[18px] leading-none transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                  </Link>
                  <span className="text-[11.5px] text-white/70">Free forever plan · No credit card</span>
                </div>
              </div>

              <div className="absolute right-[7%] top-[70px] text-white text-[34px] leading-tight rotate-6 drop-shadow-md select-none font-hand font-semibold">
                Read.
                <br />
                Prepare.
                <br />
                Ship.
                <svg className="absolute -left-[62px] top-[22px] w-[62px] rotate-12 text-amber-400" viewBox="0 0 90 70">
                  <use href="#curved-arrow" />
                </svg>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative pt-20 bg-bg text-muted border-t border-line text-sm">
        <svg className="block w-full h-[60px] sm:h-[80px] -mt-20" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 33c220 86 342-35 597 0s348 59 553 6 226-11 290-6v57H0Z" fill="#e6f4f0" />
          <path d="M0 43c196 60 386 6 602 4s337 66 528 3 238 0 310-14v54H0Z" fill="#c9ece3" fillOpacity=".6" />
          <path d="M0 70c236-32 391 35 643-3s391 28 797-13v36H0Z" fill="#fde7c2" fillOpacity=".45" />
          <path d="M0 71c230 41 424-7 694 6s504-6 746-7v20H0Z" fill="#fbfaf6" />
        </svg>

        <div className="w-[min(1240px,calc(100%-40px))] md:w-[min(1240px,calc(100%-64px))] mx-auto">
          <div className="grid gap-9 grid-cols-1 sm:grid-cols-2 min-[900px]:grid-cols-[1.8fr_1fr_1fr_1.2fr] py-3 pb-10">
            <div>
              <a className="inline-flex items-center gap-[9px] text-[25px] font-extrabold tracking-[-0.05em] text-ink select-none no-underline" href="#home" aria-label="Devora home">
                <svg className="shrink-0 drop-shadow-[0_4px_6px_rgba(15,118,110,0.18)]" width="28" height="32">
                  <use href="#logo-mark" />
                </svg>
                <span>
                  Devora<i className="not-italic text-amber-500 -ml-1">.</i>
                </span>
              </a>
              <p className="mt-3.5 text-[13px] leading-[1.8] text-muted">
                Fast document intelligence
                <br />and career tools for engineers.
              </p>
              <div className="flex gap-2 mt-4">
                <a href="#home" className="grid place-items-center w-[34px] h-[34px] rounded-full bg-white border border-line-2 text-ink-2 hover:-translate-y-0.5 hover:bg-teal-800 hover:text-white hover:border-transparent transition-all duration-300 no-underline" aria-label="Twitter / X">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#home" className="grid place-items-center w-[34px] h-[34px] rounded-full bg-white border border-line-2 text-ink-2 hover:-translate-y-0.5 hover:bg-teal-800 hover:text-white hover:border-transparent transition-all duration-300 no-underline" aria-label="GitHub">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                <a href="#home" className="grid place-items-center w-[34px] h-[34px] rounded-full bg-white border border-line-2 text-ink-2 hover:-translate-y-0.5 hover:bg-teal-800 hover:text-white hover:border-transparent transition-all duration-300 no-underline" aria-label="LinkedIn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <h3 className="text-[10.5px] tracking-[0.16em] uppercase font-extrabold text-ink mb-1.5">Product</h3>
              <a href="#features" className="text-[13px] text-muted hover:text-teal-800 hover:translate-x-1 transition-all no-underline">Features</a>
              <a href="#solutions" className="text-[13px] text-muted hover:text-teal-800 hover:translate-x-1 transition-all no-underline">Solutions</a>
              <Link href="/documents" className="text-[13px] text-muted hover:text-teal-800 hover:translate-x-1 transition-all no-underline">Docs</Link>
              <a href="#features" className="text-[13px] text-muted hover:text-teal-800 hover:translate-x-1 transition-all no-underline">Changelog</a>
            </div>

            <div className="flex flex-col gap-2.5">
              <h3 className="text-[10.5px] tracking-[0.16em] uppercase font-extrabold text-ink mb-1.5">Company</h3>
              <Link href="/about" className="text-[13px] text-muted hover:text-teal-800 hover:translate-x-1 transition-all no-underline">About Us</Link>
              <Link href="/contact" className="text-[13px] text-muted hover:text-teal-800 hover:translate-x-1 transition-all no-underline">Contact</Link>
            </div>

            <div className="static hidden min-[900px]:block self-center justify-self-end text-left text-[24px] leading-[1.05] font-hand text-teal-900 font-semibold select-none">
              Clearer Answers.
              <br />
              Faster Workflows.
              <svg className="static block w-[70px] ml-11 rotate-[29deg] -mt-1.5 text-amber-500" viewBox="0 0 90 70">
                <use href="#curved-arrow" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3.5 py-6 border-t border-line text-[11.5px] text-muted-2">
            <p>© {new Date().getFullYear()} Devora. All rights reserved.</p>
            <div className="flex gap-5">
              <a href="#home" className="inline-flex items-center gap-1 text-muted hover:text-teal-800 transition-colors no-underline">Privacy</a>
              <a href="#home" className="inline-flex items-center gap-1 text-muted hover:text-teal-800 transition-colors no-underline">Terms</a>
              <a href="#home" className="inline-flex items-center gap-1 text-muted hover:text-teal-800 transition-colors no-underline">
                Security
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </a>
            </div>
            <span className="inline-flex items-center gap-1">
              Built for focused engineering. <i className="not-italic text-amber-500">✦</i>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
