import { NextResponse } from "next/server";

import { mockPolresData } from "@/lib/mock-data";

export async function POST(request: Request) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const clonedRequest = request.clone();

  try {
    const { polresId, message } = await request.json();
    const polresIndex = Math.max(
      mockPolresData.findIndex((item) => item.id === polresId),
      0,
    );

    const response = await fetch(`${apiUrl}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 1,
        polres_id: polresIndex + 1,
        message,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    const { polresId, message } = await clonedRequest.json().catch(() => ({
      polresId: "kupang-kota",
      message: "Permintaan tidak terbaca",
    }));
    const polresName =
      mockPolresData.find((item) => item.id === polresId)?.name || "wilayah terpilih";

    return NextResponse.json({
      role: "assistant",
      content: `TURANGGA fallback aktif. Ringkasan awal untuk ${polresName}: prioritaskan verifikasi laporan terbaru, cocokkan dengan heatmap, lalu sinkronkan dispatch personil sebelum mengeksekusi respons lapangan. Pertanyaan diterima: "${message}".`,
      references: ["[Fallback Frontend Sync]"],
    });
  }
}
