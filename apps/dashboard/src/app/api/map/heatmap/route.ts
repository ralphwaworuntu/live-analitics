import { NextRequest, NextResponse } from "next/server";

import { mockHeatmapData } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const hours = request.nextUrl.searchParams.get("time_range_hours") || "24";

  try {
    const response = await fetch(`${apiUrl}/api/map/heatmap?time_range_hours=${hours}`, {
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
      heat_points: mockHeatmapData,
    });
  }
}
