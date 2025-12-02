"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminPageHeader from "@/components/AdminPageHeader";
import Link from "next/link";
import AdminPlanActions from "@/components/AdminPlanActions";

export default function AdminPlansPageClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.role !== "admin")
      router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/plans");
        if (!res.ok) throw new Error("Failed to fetch");
        const body = await res.json();
        if (body.status !== "success")
          throw new Error(body.message || "Failed");
        setPlans(body.data || []);
      } catch (err: any) {
        setError(err?.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDeleteSuccess = (id: string) => {
    setPlans((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div className="min-h-screen p-6">
      <AdminPageHeader
        title="Plans"
        subtitle="Manage plans"
        actions={
          <Link
            href="/admin/plans/create"
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            Create Plan
          </Link>
        }
      />

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Duration</th>
                <th className="px-3 py-2">Started</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="px-3 py-2">{p._id}</td>
                  <td className="px-3 py-2">{p.title}</td>
                  <td className="px-3 py-2">{p.durationDays}</td>
                  <td className="px-3 py-2">{p.startedCount ?? 0}</td>
                  <td className="px-3 py-2">
                    <AdminPlanActions
                      planId={p._id}
                      onDeleteSuccess={() => handleDeleteSuccess(p._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
