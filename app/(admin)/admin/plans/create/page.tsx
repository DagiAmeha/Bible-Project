"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminPageHeader from "@/components/AdminPageHeader";

export default function AdminCreatePlan() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [durationDays, setDurationDays] = useState(30);
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          language,
          durationDays,
          startDate,
        }),
      });
      const body = await res.json();
      console.log("BODY: ", body);
      if (!res.ok || body.status !== "success") {
        setError(body.message || "Failed to create");
        return;
      }
      router.push(`/admin/plans/${body.data._id}/schedule`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <AdminPageHeader title="Create Plan" />
      <form onSubmit={submit} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm">Title</label>
          <input
            className="w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm">Description</label>
          <textarea
            className="w-full border rounded p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm">Language</label>
            <input
              className="w-full border rounded p-2"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm">Duration</label>
            <input
              type="number"
              className="w-32 border rounded p-2"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm">Start Date</label>
          <input
            type="date"
            className="w-48 border rounded p-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/plans")}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
