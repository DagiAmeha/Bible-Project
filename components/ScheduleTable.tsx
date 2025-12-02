"use client";
import React from "react";

export default function ScheduleTable({ schedule }: { schedule: any[] }) {
  return (
    <div className="border rounded-md overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-muted text-left">
          <tr>
            <th className="px-3 py-2">Day</th>
            <th className="px-3 py-2">Portion</th>
            <th className="px-3 py-2">Books</th>
          </tr>
        </thead>
        <tbody>
          {schedule.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="px-3 py-4 text-sm text-muted-foreground"
              >
                No schedule rows
              </td>
            </tr>
          ) : (
            schedule.map((s) => (
              <tr key={s._id || `${s.day}-${s.portion}`} className="border-t">
                <td className="px-3 py-2">{s.day}</td>
                <td className="px-3 py-2">{s.portion}</td>
                <td className="px-3 py-2">{(s.books || []).join(", ")}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
