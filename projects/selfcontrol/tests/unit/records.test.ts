import { beforeEach, afterEach, expect, it } from "vitest";
import { AppDatabase } from "../../src/data/db";
import { initializeDatabase } from "../../src/data/seed";
import { saveStudy, saveExercise, deleteRecord } from "../../src/data/records";
import { sumMinutes } from "../../src/domain/statistics";
let db: AppDatabase;
beforeEach(async () => {
  db = new AppDatabase(`records-${crypto.randomUUID()}`);
  await initializeDatabase(db);
});
afterEach(async () => {
  await db.delete();
});
const study = (project_id = "words", duration_minutes = 20) => ({
  date: "2026-10-21",
  project_id,
  duration_minutes,
  quantity: 10,
  unit: "个",
  content: "实验分析",
  chapters: "第 1–3 章",
  learned: "新知识",
  unmastered: "待理解",
  next_tasks: "复习",
});
it("adds multiple sessions including STR and updates totals after edit/delete", async () => {
  const a = await saveStudy(study(), undefined, db);
  await saveStudy(study("words", 35), undefined, db);
  await saveStudy(study("str", 15), undefined, db);
  expect(sumMinutes(await db.studyRecords.toArray())).toBe(70);
  const before = await db.studyRecords.get(a);
  await saveStudy(study("words", 30), a, db);
  expect((await db.studyRecords.get(a))?.created_at).toBe(before?.created_at);
  expect(sumMinutes(await db.studyRecords.toArray())).toBe(80);
  await deleteRecord("study", a, db);
  expect(sumMinutes(await db.studyRecords.toArray())).toBe(50);
});
it.each([
  "reading",
  "listening",
  "biochemistry",
  "physiology",
  "microbiology",
  "str",
])("retains dedicated fields for %s", async (id) => {
  const key = await saveStudy(
    { ...study(id), quantity: 2.5, unit: "篇" },
    undefined,
    db,
  );
  expect(await db.studyRecords.get(key)).toMatchObject({
    quantity: 2.5,
    unit: "篇",
    chapters: "第 1–3 章",
    content: "实验分析",
    learned: "新知识",
    unmastered: "待理解",
    next_tasks: "复习",
  });
});
it("rejects missing projects and invalid writes without creating a record", async () => {
  await expect(saveStudy(study("missing"), undefined, db)).rejects.toThrow();
  await expect(saveStudy(study("words", 0), undefined, db)).rejects.toThrow();
  expect(await db.studyRecords.count()).toBe(0);
});
it("persists exercise sessions after reopening", async () => {
  await db.exerciseActivities.add({
    id: "run",
    name: "跑步",
    group: "体育项目",
    archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const id = await saveExercise(
    {
      date: "2026-10-21",
      activity_id: "run",
      duration_minutes: 25,
      content: "5 公里",
      feeling: "轻松",
      notes: "慢跑",
    },
    undefined,
    db,
  );
  db.close();
  await db.open();
  expect(await db.exerciseRecords.get(id)).toMatchObject({
    activity_name: "跑步",
    group: "体育项目",
    duration_minutes: 25,
    content: "5 公里",
    feeling: "轻松",
    notes: "慢跑",
  });
});
