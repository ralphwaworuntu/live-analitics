"use client";

import dynamic from "next/dynamic";

const CommandCenter = dynamic(() => import("@/components/dashboard/CommandCenter"), {
  ssr: false,
});

export default function DashboardPage() {
  return <CommandCenter />;
}
