"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ScheduleTable from "@/components/ScheduleTable";
import ScheduleUpload from "@/components/ScheduleUpload";
import AdminPageHeader from "@/components/AdminPageHeader";

export default function ClientSchedulePanel({ planId }: { planId: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [plan, setPlan] = useState<any | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await fetch(`/api/admin/plans/${planId}`);
      if (!res.ok) throw new Error("Failed to load plan");
      const body = await res.json();
      if (body.status !== "success") throw new Error(body.message || "Failed");
      setPlan(body.data);
    } catch (err: any) {
      setError(err?.message || "Error loading plan");
    } finally {
      setLoadingPlan(false);
    }
  };

  const loadSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/plans/${planId}/schedule`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch schedule");
      const body = await res.json();
      if (body.status !== "success") throw new Error(body.message || "Failed");
      setSchedule(body.data || []);
    } catch (err: any) {
      setError(err?.message || "Error loading schedule");
    } finally {
      setLoading(false);
    }
  };

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
    if (status === "authenticated") {
      void Promise.all([loadPlan(), loadSchedule()]);
    }
  }, [status, planId]);

  const handleUploaded = () => {
    // Reload schedule after successful upload
    void loadSchedule();
    router.push("/admin/plans");
  };

  return (
    <div>
      <AdminPageHeader
        title={`Schedule: ${
          plan?.title ?? (loadingPlan ? "Loading..." : "Plan")
        }`}
        subtitle={plan?.description ?? ""}
      />

      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <div>
          <h3 className="font-medium mb-2">Existing Schedule</h3>
          {loading ? (
            <div className="p-4">Loading...</div>
          ) : error ? (
            <div className="p-4 text-red-600">{error}</div>
          ) : (
            <ScheduleTable schedule={schedule} />
          )}
        </div>

        <div>
          <h3 className="font-medium mb-2">Upload CSV</h3>
          <ScheduleUpload planId={planId} onUploaded={handleUploaded} />
        </div>
      </div>
    </div>
  );
}
