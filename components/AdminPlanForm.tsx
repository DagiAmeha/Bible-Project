"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPlanForm({ initial }: { initial: any }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [language, setLanguage] = useState(initial?.language || "en");
  const [durationDays, setDurationDays] = useState(initial?.durationDays || 30);
  const [startDate, setStartDate] = useState(
    initial?.startDate
      ? new Date(initial.startDate).toISOString().slice(0, 10)
      : ""
  );
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const save = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/plans/${initial._id}`, {
        method: "PUT",
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
      if (!res.ok || body.status !== "success") {
        setError(body.message || "Failed to update");
        return;
      }
      router.push("/admin/plans");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this plan?")) return;
    try {
      const res = await fetch(`/api/admin/plans/${initial._id}`, {
        method: "DELETE",
      });
      const body = await res.json();
      if (!res.ok || body.status !== "success") {
        setError(body.message || "Delete failed");
        return;
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-xl space-y-4">
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
          onClick={save}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save
        </button>
        <button
          onClick={remove}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
