import { type AppDatabase, db } from "./db";
import type { ProjectKind, StudyProject } from "../domain/types";
export const fixedProjects: { id: string; name: string; kind: ProjectKind }[] =
  [
    { id: "words", name: "英语单词", kind: "words" },
    { id: "reading", name: "英语阅读", kind: "reading" },
    { id: "listening", name: "英语听力", kind: "listening" },
    { id: "biochemistry", name: "生物化学", kind: "chapters" },
    { id: "physiology", name: "生理学", kind: "chapters" },
    { id: "microbiology", name: "微生物学", kind: "chapters" },
    { id: "str", name: "STR 项目", kind: "str" },
  ];
export async function initializeDatabase(database: AppDatabase = db) {
  await database.open();
  await database.transaction("rw", database.studyProjects, async () => {
    const now = new Date().toISOString();
    for (const p of fixedProjects) {
      if (!(await database.studyProjects.get(p.id)))
        await database.studyProjects.add({
          ...p,
          fixed: true,
          archived: false,
          created_at: now,
          updated_at: now,
        } as StudyProject);
    }
  });
}
