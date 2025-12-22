// ✅ Utility: get current reading day based on plan start date
export function getCurrentDay(startDateString: string): number {
  if (!startDateString) return 0;
  const startDate = new Date(startDateString);
  const today = new Date();

  // Normalize to midnight to avoid timezone issues
  const localStart = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );
  const localToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const diffMs = localToday.getTime() - localStart.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return diffDays < 1 ? 0 : diffDays;
}
