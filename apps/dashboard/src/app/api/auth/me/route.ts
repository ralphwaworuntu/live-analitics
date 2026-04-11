import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("sentinel_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "change-this-to-a-secure-random-string";
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Provide default role parsing to match UserRole type
    let role = "OPERATOR"; // Default safe role
    if (typeof payload.role === "string") {
      const upperRole = payload.role.toUpperCase();
      if (upperRole === "SUPERADMIN" || upperRole === "SUPER_ADMIN") role = "SUPER_ADMIN";
      else if (upperRole === "MEMBER") role = "MEMBER";
    }

    const authUser = {
      nrp: payload.sub as string,
      name: (payload.name as string) || "Unknown User",
      role,
      polresId: payload.polres_id ? Number(payload.polres_id) : undefined,
    };

    return NextResponse.json({ user: authUser }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
