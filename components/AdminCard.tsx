"use client";
import React from "react";

export default function AdminCard({
  title,
  value,
  children,
}: {
  title: string;
  value: string | number;
  children?: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
