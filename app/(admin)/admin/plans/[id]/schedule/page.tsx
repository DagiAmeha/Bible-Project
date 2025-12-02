"use client";
import React from "react";
import ClientSchedulePanel from "./ClientSchedulePanel";

export default function PlanSchedulePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="min-h-screen p-6">
      {/* ClientSchedulePanel handles auth, plan & schedule fetching, and upload */}
      <ClientSchedulePanel planId={params.id} />
    </div>
  );
}
