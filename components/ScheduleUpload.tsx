"use client";
import React, { useState } from "react";

export default function ScheduleUpload({
  planId,
  onUploaded,
}: {
  planId: string;
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    const f = e.target.files?.[0] ?? null;
    if (f && !f.name.toLowerCase().endsWith(".csv")) {
      setError("Only .csv files are allowed");
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return setError("Please choose a CSV file first");
    if (
      !confirm(
        "This will replace the existing schedule for this plan. Continue?"
      )
    )
      return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`/api/plans/${planId}/schedule/upload`, {
        method: "POST",
        body: form,
      });

      const body = await res
        .json()
        .catch(() => ({ message: "Invalid response" }));
      if (!res.ok) {
        setError(body.message || "Upload failed");
      } else if (body.status !== "success") {
        setError(body.message || "Upload failed");
      } else {
        setSuccess(`Uploaded ${body.count} rows`);
        setFile(null);
        onUploaded();
      }
    } catch (err: any) {
      setError(err?.message || "Upload error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input type="file" accept=".csv" onChange={handleFile} />
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <div>
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Uploading..." : "Upload CSV & Replace Schedule"}
        </button>
      </div>
    </div>
  );
}
