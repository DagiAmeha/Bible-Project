import { DailyProgress } from "@/types/progress";

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getCompletedDaySet(progress: DailyProgress[]): Set<string> {
  const completedDays = new Set<string>();

  for (const entry of progress) {
    if (!entry.completed) continue;

    const date = new Date(entry.markedAt);
    completedDays.add(toDateKey(date));
  }

  return completedDays;
}

export function calculateStreak(progress: DailyProgress[]): number {
  const completedDays = getCompletedDaySet(progress);

  if (completedDays.size === 0) return 0;

  let streak = 0;
  const today = new Date();

  // Start from today
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  while (true) {
    const key = toDateKey(cursor);

    // Allow streak to start from yesterday if today is not completed
    if (streak === 0 && !completedDays.has(key)) {
      cursor.setDate(cursor.getDate() - 1);
      const yesterdayKey = toDateKey(cursor);

      if (!completedDays.has(yesterdayKey)) {
        break;
      }
    } else if (!completedDays.has(key)) {
      break;
    }

    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
