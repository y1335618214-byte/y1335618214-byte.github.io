import { beforeEach, afterEach, expect, it } from "vitest";
import { AppDatabase } from "../../src/data/db";
import { initializeDatabase } from "../../src/data/seed";
import { saveStudy, saveExercise } from "../../src/data/records";
import {
  createStudyProject,
  createExerciseActivity,
} from "../../src/data/projects";
import {
  exportBackup,
  parseBackup,
  previewImport,
  restoreBackup,
} from "../../src/data/backup";
let db: AppDatabase, other: AppDatabase;
beforeEach(async () => {
  db = new AppDatabase(`backup-${crypto.randomUUID()}`);
  other = new AppDatabase(`restore-${crypto.randomUUID()}`);
  await initializeDatabase(db);
  await other.open();
});
afterEach(async () => {
  await db.delete();
  await other.delete();
});
async function fixture() {
  const id = await createStudyProject("解剖学", db);
  await saveStudy(
    {
      project_id: id,
      date: "2026-10-21",
      duration_minutes: 40,
      quantity: 2,
      unit: "章",
      content: "骨骼",
      chapters: "1–2",
      learned: "结构",
      unmastered: "功能",
      next_tasks: "复习",
    },
    undefined,
    db,
  );
  const a = await createExerciseActivity("跑步", "体育项目", db);
  await saveExercise(
    {
      activity_id: a,
      date: "2026-10-21",
      duration_minutes: 20,
      content: "3 公里",
      feeling: "舒适",
      notes: "慢跑",
    },
    undefined,
    db,
  );
  await db.settings.put({ key: "view", value: "month" });
  return exportBackup(db);
}
it("round-trips all five tables and previews added/overwritten counts", async () => {
  const backup = parseBackup(JSON.stringify(await fixture()));
  const preview = await previewImport(other, backup);
  expect(preview.tables.studyRecords.added).toBe(1);
  await restoreBackup(other, backup, preview);
  expect((await exportBackup(other)).data).toEqual(backup.data);
  const next = await previewImport(other, backup);
  expect(next.tables.studyRecords.overwritten).toBe(1);
  expect(next.tables.studyRecords.added).toBe(0);
});
it.each(["version", "duplicate", "date", "reference", "number", "fixed"])(
  "rejects malformed backup: %s",
  async (kind) => {
    const b = await fixture();
    if (kind === "version") (b as any).backup_version = 999;
    if (kind === "duplicate") b.data.studyRecords.push(b.data.studyRecords[0]);
    if (kind === "date") b.data.studyRecords[0].date = "2026-02-30";
    if (kind === "reference") b.data.studyRecords[0].project_id = "missing";
    if (kind === "number") b.data.studyRecords[0].duration_minutes = -5;
    if (kind === "fixed")
      b.data.studyProjects.find((p) => p.id === "words")!.name = "篡改固定项目";
    expect(() => parseBackup(JSON.stringify(b))).toThrow();
  },
);
it("rejects stale preview without writing", async () => {
  const backup = await fixture();
  const p = await previewImport(other, backup);
  await other.settings.put({ key: "changed", value: true });
  await expect(restoreBackup(other, backup, p)).rejects.toThrow(/变化/);
  expect(await other.studyRecords.count()).toBe(0);
});
it("rolls back the whole transaction on a write failure", async () => {
  const backup = await fixture();
  await other.settings.put({ key: "keep", value: "原数据" });
  const p = await previewImport(other, backup);
  other.exerciseRecords.hook("creating", () => {
    throw Error("simulated quota failure");
  });
  await expect(restoreBackup(other, backup, p)).rejects.toThrow();
  expect(await other.studyRecords.count()).toBe(0);
  expect(await other.studyProjects.count()).toBe(0);
  expect(await other.settings.get("keep")).toEqual({
    key: "keep",
    value: "原数据",
  });
});

it("rejects cross-type fields in imported records", async () => {
  const backup = await fixture();
  (backup.data.exerciseRecords[0] as any).project_id = "words";
  expect(() => parseBackup(JSON.stringify(backup))).toThrow();
});
