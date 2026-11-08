import { db, type AppDatabase } from "./db";
import type { StudyRecord, ExerciseRecord, RecordType } from "../domain/types";
import { validateStudy, validateExercise } from "../domain/validation";
export type StudyInput = Omit<
  StudyRecord,
  "id" | "created_at" | "updated_at" | "project_name"
>;
export type ExerciseInput = Omit<
  ExerciseRecord,
  "id" | "created_at" | "updated_at" | "activity_name" | "group"
>;
export async function saveStudy(
  input: StudyInput,
  id?: string,
  database: AppDatabase = db,
): Promise<string> {
  return database.transaction(
    "rw",
    database.studyRecords,
    database.studyProjects,
    async () => {
      const project = await database.studyProjects.get(input.project_id);
      const old = id ? await database.studyRecords.get(id) : undefined;
      if (!project || (project.archived && !old))
        throw Error("该学习项目不可用");
      if (id && !old) throw Error("记录已删除，请重新打开");
      const now = new Date().toISOString();
      const record = validateStudy({
        ...input,
        id: id || crypto.randomUUID(),
        project_name: old?.project_name || project.name,
        created_at: old?.created_at || now,
        updated_at: now,
      });
      await database.studyRecords.put(record);
      return record.id;
    },
  );
}
export async function saveExercise(
  input: ExerciseInput,
  id?: string,
  database: AppDatabase = db,
): Promise<string> {
  return database.transaction(
    "rw",
    database.exerciseRecords,
    database.exerciseActivities,
    async () => {
      const activity = await database.exerciseActivities.get(input.activity_id);
      const old = id ? await database.exerciseRecords.get(id) : undefined;
      if (!activity || (activity.archived && !old))
        throw Error("该运动活动不可用");
      if (id && !old) throw Error("记录已删除，请重新打开");
      const now = new Date().toISOString();
      const record = validateExercise({
        ...input,
        id: id || crypto.randomUUID(),
        activity_name: old?.activity_name || activity.name,
        group: activity.group,
        created_at: old?.created_at || now,
        updated_at: now,
      });
      await database.exerciseRecords.put(record);
      return record.id;
    },
  );
}
export async function deleteRecord(
  type: RecordType,
  id: string,
  database: AppDatabase = db,
) {
  if (type === "study") await database.studyRecords.delete(id);
  else await database.exerciseRecords.delete(id);
}
