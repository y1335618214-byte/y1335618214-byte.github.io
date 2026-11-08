import { db, type AppDatabase } from "./db";
import type { Group, RecordType } from "../domain/types";
export async function createStudyProject(
  name: string,
  database: AppDatabase = db,
) {
  name = name.trim();
  if (!name) throw Error("请输入项目名称");
  const now = new Date().toISOString(),
    id = crypto.randomUUID();
  await database.studyProjects.add({
    id,
    name,
    kind: "custom",
    fixed: false,
    archived: false,
    created_at: now,
    updated_at: now,
  });
  return id;
}
export async function createExerciseActivity(
  name: string,
  group: Group,
  database: AppDatabase = db,
) {
  name = name.trim();
  if (!name) throw Error("请输入活动名称");
  if (!["健身", "体育项目"].includes(group)) throw Error("分组无效");
  const now = new Date().toISOString(),
    id = crypto.randomUUID();
  await database.exerciseActivities.add({
    id,
    name,
    group,
    archived: false,
    created_at: now,
    updated_at: now,
  });
  return id;
}
export async function archiveProject(
  type: RecordType,
  id: string,
  database: AppDatabase = db,
) {
  if (type === "study") {
    await database.transaction("rw", database.studyProjects, async () => {
      const p = await database.studyProjects.get(id);
      if (!p || p.fixed) throw Error("固定项目不能归档");
      await database.studyProjects.update(id, {
        archived: !p.archived,
        updated_at: new Date().toISOString(),
      });
    });
  } else {
    await database.transaction("rw", database.exerciseActivities, async () => {
      const p = await database.exerciseActivities.get(id);
      if (!p) throw Error("活动不存在");
      await database.exerciseActivities.update(id, {
        archived: !p.archived,
        updated_at: new Date().toISOString(),
      });
    });
  }
}
