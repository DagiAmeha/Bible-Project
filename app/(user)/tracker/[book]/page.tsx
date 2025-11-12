"use client";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { ObjectId } from "mongoose";

export interface Schedule {
  _id: string;
  planId: string;
  day: number;
  portion: string,
  books: string[];
}
interface DailyProgress {
  day: number, completed:boolean,markedAt: Date
}
export interface Progress  {
  _id: string;
  userId: string;
  PlanId: string;
  dailyProgress: DailyProgress[],
}


export default function BookPlan({ params }: { params: { book: string } }) {
  const [schedule, setSchedule] = useState<Schedule[] | []>([]);
  const [progress, setProgress] = useState<Schedule[] | []>([]);
  const [readDays, setReadDays] = useState<Set<number>>(new Set());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);


  useEffect(() => {
    const fetchSchedule = async () => {
      const res = await fetch(`/api/schedules/${params.book}`);
      const data = await res.json();
      console.log(data.schedules);
      setSchedule(data.schedules);
    };
    fetchSchedule();
  }, [params.book]);

  useEffect(() => {
    const fetchProgress = async () => {
      console.log('++++++', schedule)
      const res = await fetch(`/api/progress/${schedule[0].planId}`);
      const data = await res.json();
      const progressObj = data.progress;
      console.log(data.progress);
      setReadDays(new Set(progressObj.dailyProgress.map((item: DailyProgress) => item.day)));
    };
    fetchProgress();
  }, [schedule]);

  const makeAsRead = async (day: number, planId: string) => {
    try {
      // Using a placeholder API endpoint as requested
      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ day, planId }),
      });

      if (response.ok) {
        // Mark as read on successful request
        setReadDays(prev => new Set(prev).add(day));
      } else {
        console.error('Failed to mark as read');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3">{params.book} Reading Plan</h1>
      <ul className="flex gap-4">

        {schedule.map((item: Schedule) => {
          const isRead = readDays.has(item.day);
          const isHovered = hoveredDay === item.day;
          
          return (
            <li
              key={item._id}
              className="border p-4 rounded flex-1 flex flex-col justify-between text-center relative cursor-pointer transition-all hover:shadow-lg  group"
              onMouseEnter={() => setHoveredDay(item.day)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => makeAsRead(item.day , item.planId)}
            >
              {/* Checkmark in top right corner */}
              {isRead && (
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
              
              {/* Overlay on hover */}
              {!isRead && (
                <div
                  className={`absolute inset-0 bg-white/40 backdrop-blur-sm rounded flex items-center justify-center z-10
                  transform transition-all duration-300 ease-in-out
                  ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                >
                  <span className="font-semibold">Mark as Read</span>
                </div>
              )}

              
              <p><strong>Day {item.day}</strong></p>
              <p>{item.portion}</p>
            </li>
          );
        })}
      </ul>

    </div>
  );
}
