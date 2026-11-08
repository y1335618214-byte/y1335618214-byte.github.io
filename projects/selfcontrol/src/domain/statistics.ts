export function sumMinutes(records: { duration_minutes: number }[]): number {
  return records.reduce((sum, r) => sum + r.duration_minutes, 0);
}
import { dateObject, localDate, shiftDate } from "./dates";
import type { StudyRecord, ExerciseRecord } from "./types";
export function periodBounds(
  date: string,
  period: "day" | "week" | "month",
): { start: string; end: string } {
  if (period === "day") return { start: date, end: date };
  const d = dateObject(date);
  if (period === "week") {
    const start = shiftDate(date, -((d.getDay() + 6) % 7));
    return { start, end: shiftDate(start, 6) };
  }
  return {
    start: localDate(new Date(d.getFullYear(), d.getMonth(), 1, 12)),
    end: localDate(new Date(d.getFullYear(), d.getMonth() + 1, 0, 12)),
  };
}
export function quantityTotals(
  rows: Pick<StudyRecord, "quantity" | "unit">[],
): [string, number][] {
  const map = new Map<string, number>();
  for (const r of rows)
    if (r.quantity !== undefined)
      map.set(r.unit, (map.get(r.unit) || 0) + r.quantity);
  return [...map].map(([u, q]) => [u, Number(q.toFixed(6))]);
}
export function summarize(
  study: StudyRecord[],
  exercise: ExerciseRecord[],
  bounds: { start: string; end: string },
) {
  const inRange = (r: { date: string }) =>
    r.date >= bounds.start && r.date <= bounds.end;
  const s = study.filter(inRange),
    e = exercise.filter(inRange);
  const map = new Map<string, { id: string; name: string; minutes: number }>();
  for (const r of s) {
    const item = map.get(r.project_id) || {
      id: r.project_id,
      name: r.project_name,
      minutes: 0,
    };
    item.minutes += r.duration_minutes;
    map.set(r.project_id, item);
  }
  return {
    studyMinutes: sumMinutes(s),
    exerciseMinutes: sumMinutes(e),
    exerciseCount: e.length,
    projects: [...map.values()].sort((a, b) => b.minutes - a.minutes),
  };
}
