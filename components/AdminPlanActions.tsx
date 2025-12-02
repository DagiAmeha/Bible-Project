"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminPlanActions({
  planId,
  onDeleteSuccess,
}: {
  planId: string;
  onDeleteSuccess?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this plan?")) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      // Refresh the current route to reflect deletion
      onDeleteSuccess?.();
    } catch (err) {
      console.error(err);
      alert((err as Error).message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Link
        href={`/admin/plans/${planId}`}
        className="text-sm px-2 py-1 bg-gray-100 rounded"
      >
        View
      </Link>
      <Link
        href={`/admin/plans/${planId}`}
        className="text-sm px-2 py-1 bg-yellow-100 rounded"
      >
        Edit
      </Link>
      <button
        className="text-sm px-2 py-1 bg-red-100 rounded disabled:opacity-50"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
