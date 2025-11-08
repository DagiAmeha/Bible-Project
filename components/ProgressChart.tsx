"use client";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

const sample = [
  { day: 'Mon', chapters: 3 },
  { day: 'Tue', chapters: 2 },
  { day: 'Wed', chapters: 5 },
  { day: 'Thu', chapters: 1 },
  { day: 'Fri', chapters: 4 },
  { day: 'Sat', chapters: 2 },
  { day: 'Sun', chapters: 6 },
];

export function ProgressChart({ data = sample }: { data?: { day: string; chapters: number }[] }) {
  return (
    <div className="w-full h-72 border rounded-md p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="chapters" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


