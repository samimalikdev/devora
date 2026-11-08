import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_ALGORITHMS = new Set(['HS256', 'RS256', 'ES256']);

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

function isTokenValid(token: string | undefined): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [headerB64, payloadB64, signatureB64] = parts;

  if (!signatureB64 || signatureB64.length < 32) {
    return false;
  }

  try {
    const header = JSON.parse(base64UrlDecode(headerB64));
    if (!header || typeof header !== 'object') return false;
    if (!header.alg || !ALLOWED_ALGORITHMS.has(header.alg)) return false;

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (!payload || typeof payload !== 'object') return false;

    const nowSeconds = Math.floor(Date.now() / 1000);

    if (typeof payload.exp !== 'number' || payload.exp <= nowSeconds) {
      return false;
    }
    if (payload.exp > nowSeconds + 30 * 86400) {
      return false;
    }

    if (typeof payload.iat === 'number' && payload.iat > nowSeconds + 300) {
      return false;
    }

    if (!payload.sub || typeof payload.sub !== 'string' || !UUID_REGEX.test(payload.sub)) {
      return false;
    }

    if (payload.aud !== 'authenticated') {
      return false;
    }
    if (payload.role !== 'authenticated') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('devora_token')?.value;
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/dashboard', '/chat', '/resume', '/documents'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const hasValidToken = isTokenValid(token);

  if (isProtected && !hasValidToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    if (token) {
      response.cookies.delete('devora_token');
    }
    return response;
  }

  if ((pathname === '/login' || pathname === '/signup') && hasValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/chat/:path*',
    '/resume/:path*',
    '/documents/:path*',
    '/login',
    '/signup',
  ],
};
