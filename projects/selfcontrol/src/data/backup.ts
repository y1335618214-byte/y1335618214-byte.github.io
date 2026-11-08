import { type AppDatabase } from "./db";
import {
  tableNames,
  type TableName,
  type Backup,
  type BackupData,
} from "../domain/types";
import {
  object,
  validateStudy,
  validateExercise,
  validateProject,
  validateActivity,
  validateSetting,
} from "../domain/validation";
import { fixedProjects } from "./seed";
export interface ImportPreview {
  fingerprint: string;
  incomingFingerprint: string;
  tables: Record<
    TableName,
    { added: number; overwritten: number; retained: number }
  >;
}
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}
async function readData(database: AppDatabase): Promise<BackupData> {
  return {
    studyRecords: await database.studyRecords.orderBy("id").toArray(),
    exerciseRecords: await database.exerciseRecords.orderBy("id").toArray(),
    studyProjects: await database.studyProjects.orderBy("id").toArray(),
    exerciseActivities: await database.exerciseActivities
      .orderBy("id")
      .toArray(),
    settings: await database.settings.orderBy("key").toArray(),
  };
}
export async function exportBackup(database: AppDatabase): Promise<Backup> {
  return database.transaction(
    "r",
    tableNames.map((t) => database.table(t)),
    async () => ({
      format: "study-fitness-backup",
      backup_version: 1,
      database_version: 2,
      exported_at: new Date().toISOString(),
      data: await readData(database),
    }),
  );
}
export function parseBackup(text: string): Backup {
  let root: Record<string, unknown>;
  try {
    root = object(JSON.parse(text));
  } catch {
    throw Error("无法读取 JSON 备份，请选择完整备份文件");
  }
  if (
    root.format !== "study-fitness-backup" ||
    root.backup_version !== 1 ||
    root.database_version !== 2
  )
    throw Error("备份格式或版本不兼容");
  if (
    typeof root.exported_at !== "string" ||
    !Number.isFinite(Date.parse(root.exported_at))
  )
    throw Error("备份时间无效");
  const d = object(root.data);
  const validators = {
    studyRecords: validateStudy,
    exerciseRecords: validateExercise,
    studyProjects: validateProject,
    exerciseActivities: validateActivity,
    settings: validateSetting,
  };
  for (const name of tableNames) {
    if (!Array.isArray(d[name])) throw Error(`缺少数据集合 ${name}`);
    const keys = new Set<string>();
    for (const row of d[name] as unknown[]) {
      validators[name](row);
      const r = object(row);
      const key = String(r[name === "settings" ? "key" : "id"]);
      if (keys.has(key)) throw Error(`${name} 存在重复 ID`);
      keys.add(key);
    }
  }
  const data = d as unknown as BackupData;
  for (const p of data.studyProjects) {
    const fixed = fixedProjects.find((f) => f.id === p.id);
    if (fixed) {
      if (
        !p.fixed ||
        p.archived ||
        p.name !== fixed.name ||
        p.kind !== fixed.kind
      )
        throw Error("固定学习项目配置无效");
    } else if (p.fixed || p.kind !== "custom")
      throw Error("自定义项目配置无效");
  }
  for (const fixed of fixedProjects)
    if (!data.studyProjects.some((p) => p.id === fixed.id))
      throw Error("备份缺少固定项目");
  const projects = new Set(data.studyProjects.map((p) => p.id));
  const activities = new Map(data.exerciseActivities.map((a) => [a.id, a]));
  if (data.studyRecords.some((r) => !projects.has(r.project_id)))
    throw Error("学习记录引用了不存在的项目");
  if (
    data.exerciseRecords.some(
      (r) =>
        !activities.has(r.activity_id) ||
        activities.get(r.activity_id)?.group !== r.group,
    )
  )
    throw Error("运动记录与活动配置不完整");
  return root as unknown as Backup;
}
function preview(current: BackupData, backup: Backup): ImportPreview {
  const tables = {} as ImportPreview["tables"];
  for (const name of tableNames) {
    const key = name === "settings" ? "key" : "id";
    const existing = new Set(
      current[name].map((r) =>
        String((r as unknown as Record<string, unknown>)[key]),
      ),
    );
    let added = 0,
      overwritten = 0;
    for (const row of backup.data[name]) {
      if (
        existing.has(String((row as unknown as Record<string, unknown>)[key]))
      )
        overwritten++;
      else added++;
    }
    tables[name] = {
      added,
      overwritten,
      retained: existing.size - overwritten,
    };
  }
  return {
    fingerprint: stable(current),
    incomingFingerprint: stable(backup.data),
    tables,
  };
}
export async function previewImport(
  database: AppDatabase,
  backup: Backup,
): Promise<ImportPreview> {
  const validated = parseBackup(JSON.stringify(backup));
  return database.transaction(
    "r",
    tableNames.map((t) => database.table(t)),
    async () => preview(await readData(database), validated),
  );
}
export async function restoreBackup(
  database: AppDatabase,
  backup: Backup,
  expected: ImportPreview,
) {
  const validated = parseBackup(JSON.stringify(backup));
  return database.transaction(
    "rw",
    tableNames.map((t) => database.table(t)),
    async () => {
      const before = await readData(database);
      const actual = preview(before, validated);
      if (
        actual.fingerprint !== expected.fingerprint ||
        actual.incomingFingerprint !== expected.incomingFingerprint
      )
        throw Error("数据已发生变化，请重新预览并确认");
      for (const name of tableNames)
        await database.table(name).bulkPut(validated.data[name]);
      const after = await readData(database);
      for (const name of tableNames) {
        if (
          after[name].length !==
          before[name].length + actual.tables[name].added
        )
          throw Error("恢复后记录数量校验失败");
        const key = name === "settings" ? "key" : "id";
        const map = new Map(
          after[name].map((r) => [
            String((r as unknown as Record<string, unknown>)[key]),
            r,
          ]),
        );
        for (const r of validated.data[name])
          if (
            stable(
              map.get(String((r as unknown as Record<string, unknown>)[key])),
            ) !== stable(r)
          )
            throw Error("恢复后字段完整性校验失败");
      }
      // Also check retained records against merged configuration before committing.
      parseBackup(JSON.stringify({ ...validated, data: after }));
      return {
        tables: actual.tables,
        studyCount: after.studyRecords.length,
        exerciseCount: after.exerciseRecords.length,
      };
    },
  );
}
