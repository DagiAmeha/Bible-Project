"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminCard from "@/components/AdminCard";
import AdminPageHeader from "@/components/AdminPageHeader";

export default function AdminDashboardPageClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<any | null>(null);
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
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error("Failed to fetch");
        const body = await res.json();
        if (body.status !== "success")
          throw new Error(body.message || "Failed to fetch");
        setData(body.data);
      } catch (err: any) {
        setError(err?.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen p-6">
      <AdminPageHeader
        title="Admin Dashboard"
        subtitle="Overview and metrics"
      />

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminCard title="Total Users" value={data.totalUsers} />
          <AdminCard title="Active Users Today" value={data.activeToday} />
          <AdminCard title="Total Plans" value={data.totalPlans} />
          <AdminCard title="User Plans Started" value={data.plansStarted} />
          <AdminCard title="Plans Completed" value={data.plansCompleted} />
          <AdminCard
            title="Unread Support Messages"
            value={data.unreadSupportMessages}
          />
        </div>
      )}
    </div>
  );
}
