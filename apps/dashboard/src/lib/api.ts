import { mockHeatmapData, mockPolresData } from "@/lib/mock-data";
import type { AIChatMessage, HeatPoint, PolresItem } from "@/lib/types";

async function safeJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchPolresList(): Promise<PolresItem[]> {
  try {
    const data = await safeJson<{ data: PolresItem[] }>("/api/map/polres");
    return data.data?.length ? data.data : mockPolresData;
  } catch {
    return mockPolresData;
  }
}

export async function fetchHeatmap(timeRangeHours: number): Promise<HeatPoint[]> {
  try {
    const data = await safeJson<{ heat_points: HeatPoint[] }>(
      `/api/map/heatmap?time_range_hours=${timeRangeHours}`,
    );
    return data.heat_points?.length ? data.heat_points : mockHeatmapData;
  } catch {
    return mockHeatmapData;
  }
}

export async function sendAIMessage(input: {
  polresId: string;
  message: string;
}): Promise<AIChatMessage> {
  const data = await safeJson<{ content: string; references: string[] }>("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content: data.content,
    references: data.references,
    createdAt: new Date().toISOString(),
  };
}
