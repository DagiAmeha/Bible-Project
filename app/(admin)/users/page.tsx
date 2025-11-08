"use client";
import { useTranslations } from 'next-intl';

const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
  { id: '2', name: 'Jane Admin', email: 'jane@example.com', role: 'admin' },
];

export default function AdminUsersPage() {
  const t = useTranslations('common');
  return (
    <div className="min-h-screen flex flex-col">
      <main className="container mx-auto px-4 py-6 grid gap-6">
        <h1 className="text-2xl font-semibold">{t('adminUsers')}</h1>
        <div className="border rounded-md overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-3 py-2">{u.id}</td>
                  <td className="px-3 py-2">{u.name}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}


