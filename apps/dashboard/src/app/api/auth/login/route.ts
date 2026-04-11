import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    const { nrp, password } = await request.json();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const formData = new URLSearchParams();
    formData.append("username", nrp);
    formData.append("password", password);

    // ==========================================
    // DEMO MOCK USER (Bypass Backend / Docker Down)
    // ==========================================
    let mockRole = "";
    let mockName = "";
    let mockPolresId = 0;

    if (nrp === "1234" && password === "admin") {
      mockRole = "SUPER_ADMIN";
      mockName = "Irjen Pol. Daniel T.M. Silitonga";
      mockPolresId = 1;
    } else if (nrp === "9012" && password === "operator") {
      mockRole = "OPERATOR";
      mockName = "AKP Rina Wulandari";
      mockPolresId = 1;
    } else if (nrp === "5678" && password === "member") {
      mockRole = "MEMBER";
      mockName = "Bripka Andi Prasetyo";
      mockPolresId = 1; // Assuming default to Polda/Polri HQ or specific polres
    }

    if (mockRole) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "change-this-to-a-secure-random-string");
      const mockToken = await new SignJWT({ sub: nrp, role: mockRole, name: mockName, polres_id: mockPolresId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(secret);
      
      const response = NextResponse.json(
        { success: true, message: `Mock Login Otorisasi Diterima (${mockRole})` },
        { status: 200 }
      );
      
      response.cookies.set({
        name: "sentinel_token",
        value: mockToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 24 * 60 * 60,
      });

      return response;
    }
    // ==========================================

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { detail: data.detail || "Authentication failed" },
        { status: res.status }
      );
    }

    // Set secure HTTP-only cookie
    const response = NextResponse.json(
      { success: true, message: "Logged in successfully" },
      { status: 200 }
    );

    response.cookies.set({
      name: "sentinel_token",
      value: data.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { detail: "Internal Server Error during Authentication" },
      { status: 500 }
    );
  }
}
