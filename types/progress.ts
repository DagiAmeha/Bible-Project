export interface DailyProgress {
  day: number; // The day number in the plan
  completed: boolean; // Optional MongoDB subdocument ID (as string)
  markedAt: string; // ISO date string when the day was marked
}
