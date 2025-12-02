"use client";

import PlansTabs from "../components/PlansTabs";
import PlanCard from "../components/PlanCard";
import EmptyState from "@/components/EmptyState";
import { useEffect, useState } from "react";

interface Plan {
  title: string;
  description: string;
  language: string;
  durationDays: number;
  startDate: Date;
  createdAt: Date;
}

export default function MyPlansPage() {
  const [plans, setPlans] = useState<Plan[] | []>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMyPlans = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/plans/my", {
          cache: "no-store",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Unable to load chat");
        }
        const data = await res.json();
        console.log(data.plans);
        setPlans(data.plans);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load chat");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMyPlans();
  }, []);

  return (
    <div className="container mx-auto py-4">
      <PlansTabs />

      {loading ? (
        <div className="flex align-top justify-center">Loading</div>
      ) : (
        <>
          {plans.length === 0 && <EmptyState message="No plans available." />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 cursor-pointer">
            {plans.map((p: any) => (
              <PlanCard
                key={p.planId._id}
                id={p.planId._id}
                title={p.planId.title}
                description={p.planId.description}
                duration={p.planId.durationDays}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
