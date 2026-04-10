import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiting (Note: This is per-instance, but good for local hardening)
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();
const LIMIT = 100; // 100 requests per minute
const WINDOW = 60 * 1000;

export function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const now = Date.now();
  
  const current = rateLimitMap.get(ip) ?? { count: 0, lastReset: now };
  
  if (now - current.lastReset > WINDOW) {
    current.count = 1;
    current.lastReset = now;
  } else {
    current.count++;
  }
  
  rateLimitMap.set(ip, current);

  if (current.count > LIMIT) {
    return new NextResponse('Too Many Tactical Requests (429)', { status: 429 });
  }

  const response = NextResponse.next();

  // Redundant but safe: Ensure headers are set if next.config.ts misses them
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
