import { Suspense } from "react";
import AIWorkspace from "@/components/dashboard/AIWorkspace";

export const dynamic = "force-dynamic";

export default function AIChatPage() {
  return (
    <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-slate-500">Loading AI Workspace...</div>}>
      <AIWorkspace />
    </Suspense>
  );
}
