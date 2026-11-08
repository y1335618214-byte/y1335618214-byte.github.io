import type {
  StudyRecord,
  ExerciseRecord,
  StudyProject,
  ExerciseActivity,
  AppSetting,
} from "./types";
import { validDate } from "./dates";
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("数据必须为对象");
  return value as Record<string, unknown>;
}
export function textField(
  o: Record<string, unknown>,
  key: string,
  required = false,
) {
  if (typeof o[key] !== "string" || (required && !(o[key] as string).trim()))
    throw Error(`${key} 文本无效`);
}
function timestamps(o: Record<string, unknown>) {
  textField(o, "id", true);
  for (const key of ["created_at", "updated_at"]) {
    textField(o, key, true);
    if (
      !/^\d{4}-\d\d-\d\dT/.test(o[key] as string) ||
      !Number.isFinite(Date.parse(o[key] as string))
    )
      throw Error("时间戳无效");
  }
}
function common(o: Record<string, unknown>) {
  timestamps(o);
  if (!validDate(o.date)) throw Error("日期无效");
  if (
    !Number.isSafeInteger(o.duration_minutes) ||
    (o.duration_minutes as number) <= 0
  )
    throw Error("时长必须为正整数分钟");
}
function knownFields(o: Record<string, unknown>, fields: string[]) {
  const allowed = new Set(fields);
  if (Object.keys(o).some((key) => !allowed.has(key)))
    throw Error("数据含有未知或不匹配的字段");
}
const recordFields = [
  "id",
  "date",
  "duration_minutes",
  "created_at",
  "updated_at",
];
export function validateStudy(value: unknown): StudyRecord {
  const o = object(value);
  knownFields(o, [
    ...recordFields,
    "project_id",
    "project_name",
    "quantity",
    "unit",
    "content",
    "chapters",
    "learned",
    "unmastered",
    "next_tasks",
  ]);
  common(o);
  ["project_id", "project_name"].forEach((k) => textField(o, k, true));
  [
    "unit",
    "content",
    "chapters",
    "learned",
    "unmastered",
    "next_tasks",
  ].forEach((k) => textField(o, k));
  if (
    o.quantity !== undefined &&
    (typeof o.quantity !== "number" ||
      !Number.isFinite(o.quantity) ||
      o.quantity < 0)
  )
    throw Error("数量必须为非负有限数值");
  return o as unknown as StudyRecord;
}
export function validateExercise(value: unknown): ExerciseRecord {
  const o = object(value);
  knownFields(o, [
    ...recordFields,
    "group",
    "activity_id",
    "activity_name",
    "content",
    "feeling",
    "notes",
  ]);
  common(o);
  ["activity_id", "activity_name"].forEach((k) => textField(o, k, true));
  ["content", "feeling", "notes"].forEach((k) => textField(o, k));
  if (!["健身", "体育项目"].includes(o.group as string))
    throw Error("运动分组无效");
  return o as unknown as ExerciseRecord;
}
export function validateProject(value: unknown): StudyProject {
  const o = object(value);
  timestamps(o);
  textField(o, "name", true);
  if (
    typeof o.fixed !== "boolean" ||
    typeof o.archived !== "boolean" ||
    !["words", "reading", "listening", "chapters", "str", "custom"].includes(
      o.kind as string,
    )
  )
    throw Error("学习项目配置无效");
  return o as unknown as StudyProject;
}
export function validateActivity(value: unknown): ExerciseActivity {
  const o = object(value);
  timestamps(o);
  textField(o, "name", true);
  if (
    typeof o.archived !== "boolean" ||
    !["健身", "体育项目"].includes(o.group as string)
  )
    throw Error("运动活动配置无效");
  return o as unknown as ExerciseActivity;
}
export function validateSetting(value: unknown): AppSetting {
  const o = object(value);
  textField(o, "key", true);
  if (
    !["string", "number", "boolean"].includes(typeof o.value) ||
    (typeof o.value === "number" && !Number.isFinite(o.value))
  )
    throw Error("设置无效");
  return o as unknown as AppSetting;
}
