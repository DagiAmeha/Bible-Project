"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminPlanForm from "@/components/AdminPlanForm";

export default function AdminPlanDetailClient({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/plans/${params.id}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to load plan");
        }
        const body = await res.json();
        if (body.status !== "success")
          throw new Error(body.message || "Failed");
        setPlan(body.data);
      } catch (err: any) {
        setError(err?.message || "Error loading plan");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!plan) return <div className="p-6">Plan not found</div>;

  return (
    <div className="min-h-screen p-6">
      <AdminPageHeader
        title={`Plan: ${plan.title}`}
        subtitle={plan.description}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <h3 className="font-medium mb-2">Details</h3>
          <p>
            <strong>Duration:</strong> {plan.durationDays} days
          </p>
          <p>
            <strong>Start Date:</strong>{" "}
            {plan.startDate
              ? new Date(plan.startDate).toLocaleDateString()
              : "—"}
          </p>
          <p className="mt-4">
            <strong>Users Started:</strong> {plan.startedCount ?? 0}
          </p>
        </div>

        <div className="border rounded p-4">
          <h3 className="font-medium mb-2">Edit</h3>
          <AdminPlanForm initial={plan} />
        </div>
      </div>
    </div>
  );
}
