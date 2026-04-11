import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// The secret matching the one in FastAPI
const JWT_SECRET = process.env.JWT_SECRET || "change-this-to-a-secure-random-string";
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const LIMIT = 100;
const WINDOW = 60 * 1000;

export async function proxy(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
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
    return new NextResponse("Too Many Tactical Requests (429)", { status: 429 });
  }

  const token = request.cookies.get("sentinel_token")?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  // Allow static files, assets, images
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/assets") ||
    request.nextUrl.pathname.startsWith("/favicon.ico") ||
    request.nextUrl.pathname.startsWith("/public") ||
    request.nextUrl.pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // No token found
  if (!token) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Token exists — Validate
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    
    // Valid token but on login page -> Redirect to dashboard
    if (isLoginPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    return response;
  } catch {
    // Token is invalid/expired
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("sentinel_token"); // clear the invalid session
    return response;
  }
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
