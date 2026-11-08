import type { StudyRecord, ExerciseRecord } from "../domain/types";
function cell(value: unknown): string {
  let text = value === undefined ? "" : String(value);
  if (typeof value === "string" && /^[\s]*[=+\-@\t\r]/.test(text))
    text = "'" + text;
  return `"${text.replaceAll('"', '""')}"`;
}
function csv(headers: string[], rows: unknown[][]) {
  return (
    "\uFEFF" +
    [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n") +
    "\r\n"
  );
}
export function studyCsv(rows: StudyRecord[]): string {
  return csv(
    [
      "日期",
      "项目名称",
      "数量",
      "单位",
      "时长（分钟）",
      "章节",
      "内容或工作任务",
      "今日学到了什么",
      "尚未掌握的知识",
      "后续任务",
      "创建时间",
      "最近修改时间",
    ],
    rows.map((r) => [
      r.date,
      r.project_name,
      r.quantity,
      r.unit,
      r.duration_minutes,
      r.chapters,
      r.content,
      r.learned,
      r.unmastered,
      r.next_tasks,
      r.created_at,
      r.updated_at,
    ]),
  );
}
export function exerciseCsv(rows: ExerciseRecord[]): string {
  return csv(
    [
      "日期",
      "分组",
      "项目名称",
      "训练内容",
      "时长（分钟）",
      "训练感受",
      "备注",
      "创建时间",
      "最近修改时间",
    ],
    rows.map((r) => [
      r.date,
      r.group,
      r.activity_name,
      r.content,
      r.duration_minutes,
      r.feeling,
      r.notes,
      r.created_at,
      r.updated_at,
    ]),
  );
}
export function downloadFile(name: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
