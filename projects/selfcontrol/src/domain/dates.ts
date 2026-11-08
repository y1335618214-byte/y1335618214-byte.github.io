export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const [y, m, d] = value.split("-").map(Number);
  if (y < 1000 || y > 9999) return false;
  return localDate(new Date(y, m - 1, d, 12)) === value;
}
export function dateObject(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}
export function shiftDate(value: string, days: number): string {
  const d = dateObject(value);
  d.setDate(d.getDate() + days);
  return localDate(d);
}
export function durationText(minutes: number): string {
  return minutes >= 60
    ? `${Math.floor(minutes / 60)} 小时${minutes % 60 ? ` ${minutes % 60} 分钟` : ""}`
    : `${minutes} 分钟`;
}
