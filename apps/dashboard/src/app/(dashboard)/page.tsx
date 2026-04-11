"use client";

import React, { Suspense } from "react";
import ViewManager from "@/components/layout/ViewManager";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-[#07111F]" />}>
      <ViewManager />
    </Suspense>
  );
}
