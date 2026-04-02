import { NextResponse } from "next/server";

import { mockPolresData } from "@/lib/mock-data";

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${apiUrl}/api/map/polres`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      status: "fallback",
      data: mockPolresData,
    });
  }
}
