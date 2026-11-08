import { afterEach, expect, it } from "vitest";
import Dexie from "dexie";
import { AppDatabase, schemaV1 } from "../../src/data/db";
import { initializeDatabase } from "../../src/data/seed";
const names: string[] = [];
const database = () => {
  const name = `test-${crypto.randomUUID()}`;
  names.push(name);
  return new AppDatabase(name);
};
afterEach(async () => {
  for (const name of names.splice(0)) await Dexie.delete(name);
});
it("initializes seven fixed projects without duplicates", async () => {
  const db = database();
  await initializeDatabase(db);
  await initializeDatabase(db);
  expect(await db.studyProjects.count()).toBe(7);
  expect((await db.studyProjects.toArray()).map((p) => p.name)).toContain(
    "STR 项目",
  );
  db.close();
});
it("preserves existing records through schema upgrade", async () => {
  const name = `old-${crypto.randomUUID()}`;
  names.push(name);
  const old = new Dexie(name);
  old.version(1).stores(schemaV1);
  await old.open();
  const record = {
    id: "old-record",
    date: "2026-10-20",
    project_id: "str",
    project_name: "STR 项目",
    duration_minutes: 35,
    content: "整理实验",
    created_at: "2026-10-20T01:00:00.000Z",
    updated_at: "2026-10-20T01:00:00.000Z",
  };
  await old.table("studyRecords").put(record);
  old.close();
  const upgraded = new AppDatabase(name);
  await upgraded.open();
  expect(await upgraded.studyRecords.get("old-record")).toEqual(record);
  expect(upgraded.verno).toBe(2);
  upgraded.close();
});
