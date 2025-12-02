import React from "react";

export default function AdminTable<T>({
  columns,
  data,
}: {
  columns: {
    key: string;
    title: string;
    render?: (row: any) => React.ReactNode;
  }[];
  data: T[];
}) {
  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="min-w-full text-sm">
        <thead className="bg-muted text-left">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2">
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, idx) => (
            <tr
              key={row._id ?? idx}
              className="border-t even:bg-gray-50 dark:even:bg-gray-900"
            >
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 align-top">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
