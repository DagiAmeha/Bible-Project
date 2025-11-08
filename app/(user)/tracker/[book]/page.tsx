"use client";
import { useEffect, useState } from "react";

export interface Schedule {
  _id: string;
  day: number;
  portion: string,
  books: string[];
}


export default function BookPlan({ params }: { params: { book: string } }) {
  const [schedule, setSchedule] = useState<Schedule[] | []>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      const res = await fetch(`/api/schedules/${params.book}`);
      const data = await res.json();
      console.log(data.schedules)
      setSchedule(data.schedules);
    };
    fetchSchedule();
  }, [params.book]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3">{params.book} Reading Plan</h1>
      <ul className="flex gap-4">
        {schedule.map((item: Schedule) => (
          <li
            key={item._id}
            className="border p-4 rounded flex-1 flex flex-col justify-between text-center"
          >
            <p><strong>Day {item.day}</strong></p>
            <p>{item.portion}</p>
          </li>
        ))}
      </ul>

    </div>
  );
}
