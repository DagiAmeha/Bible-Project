"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminPageHeader from "@/components/AdminPageHeader";

export default function AdminUsersPageClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
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
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("Failed to fetch");
        const body = await res.json();
        if (body.status !== "success")
          throw new Error(body.message || "Failed");
        setUsers(body.data || []);
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
      <AdminPageHeader title="Users" subtitle="Manage user accounts" />

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
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Last Seen</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Started</th>
                <th className="px-3 py-2">Completed</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="px-3 py-2">{u._id}</td>
                  <td className="px-3 py-2">{u.name}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">
                    {u.lastSeen ? new Date(u.lastSeen).toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">{u.started ?? 0}</td>
                  <td className="px-3 py-2">{u.completed ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
