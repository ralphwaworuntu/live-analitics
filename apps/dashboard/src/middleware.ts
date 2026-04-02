import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// The secret matching the one in FastAPI
const JWT_SECRET = process.env.JWT_SECRET || "change-this-to-a-secure-random-string";

export async function middleware(request: NextRequest) {
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
    return NextResponse.next();
  } catch {
    // Token is invalid/expired
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("sentinel_token"); // clear the invalid session
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
