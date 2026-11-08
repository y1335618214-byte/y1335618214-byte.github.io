import { expect, it } from "vitest";
import {
  periodBounds,
  summarize,
  quantityTotals,
} from "../../src/domain/statistics";
import { AppDatabase } from "../../src/data/db";
import { initializeDatabase } from "../../src/data/seed";
import {
  createStudyProject,
  createExerciseActivity,
  archiveProject,
} from "../../src/data/projects";
import { saveStudy } from "../../src/data/records";
it("uses Monday weeks across year boundary and leap months", () => {
  expect(periodBounds("2026-01-04", "week")).toEqual({
    start: "2025-12-29",
    end: "2026-01-04",
  });
  expect(periodBounds("2024-02-15", "month")).toEqual({
    start: "2024-02-01",
    end: "2024-02-29",
  });
});
it("filters period totals, groups studies and counts sessions", () => {
  const rows = [
    {
      date: "2026-10-01",
      duration_minutes: 20,
      project_id: "a",
      project_name: "A",
    },
    {
      date: "2026-10-31",
      duration_minutes: 35,
      project_id: "a",
      project_name: "A",
    },
    {
      date: "2026-11-01",
      duration_minutes: 100,
      project_id: "b",
      project_name: "B",
    },
  ];
  const r = summarize(
    rows as any,
    [
      { date: "2026-10-01", duration_minutes: 30 },
      { date: "2026-10-02", duration_minutes: 10 },
    ] as any,
    periodBounds("2026-10-21", "month"),
  );
  expect(r.studyMinutes).toBe(55);
  expect(r.exerciseMinutes).toBe(40);
  expect(r.exerciseCount).toBe(2);
  expect(r.projects).toEqual([{ id: "a", name: "A", minutes: 55 }]);
});
it("does not mix different units", () => {
  expect(
    quantityTotals([
      { quantity: 2, unit: "页" },
      { quantity: 3, unit: "篇" },
      { quantity: 1, unit: "页" },
    ] as any),
  ).toEqual([
    ["页", 3],
    ["篇", 3],
  ]);
});
it("keeps custom projects across dates and archives without losing editable history", async () => {
  const db = new AppDatabase(`projects-${crypto.randomUUID()}`);
  await initializeDatabase(db);
  try {
    const id = await createStudyProject("解剖学", db);
    const record = await saveStudy(
      {
        date: "2026-10-21",
        project_id: id,
        duration_minutes: 20,
        unit: "",
        content: "骨骼",
        chapters: "",
        learned: "",
        unmastered: "",
        next_tasks: "",
      },
      undefined,
      db,
    );
    db.close();
    await db.open();
    expect((await db.studyProjects.get(id))?.archived).toBe(false);
    await archiveProject("study", id, db);
    await saveStudy(
      {
        date: "2026-10-22",
        project_id: id,
        duration_minutes: 30,
        unit: "",
        content: "骨骼复习",
        chapters: "",
        learned: "",
        unmastered: "",
        next_tasks: "",
      },
      record,
      db,
    );
    expect((await db.studyRecords.get(record))?.project_name).toBe("解剖学");
    await expect(archiveProject("study", "words", db)).rejects.toThrow();
    const activity = await createExerciseActivity("游泳", "体育项目", db);
    expect((await db.exerciseActivities.get(activity))?.group).toBe("体育项目");
  } finally {
    await db.delete();
  }
});

it("limits day statistics to the selected date and sums repeated sessions", () => {
  const bounds = periodBounds("2026-10-22", "day");
  expect(bounds).toEqual({ start: "2026-10-22", end: "2026-10-22" });
  const result = summarize(
    [
      {
        date: "2026-10-21",
        duration_minutes: 100,
        project_id: "words",
        project_name: "英语单词",
      },
      {
        date: "2026-10-22",
        duration_minutes: 20,
        project_id: "words",
        project_name: "英语单词",
      },
      {
        date: "2026-10-22",
        duration_minutes: 15,
        project_id: "str",
        project_name: "STR 项目",
      },
      {
        date: "2026-10-23",
        duration_minutes: 100,
        project_id: "words",
        project_name: "英语单词",
      },
    ] as any,
    [
      { date: "2026-10-21", duration_minutes: 100 },
      { date: "2026-10-22", duration_minutes: 10 },
      { date: "2026-10-22", duration_minutes: 25 },
      { date: "2026-10-23", duration_minutes: 100 },
    ] as any,
    bounds,
  );
  expect(result.studyMinutes).toBe(35);
  expect(result.exerciseMinutes).toBe(35);
  expect(result.exerciseCount).toBe(2);
  expect(summarize([], [], bounds)).toMatchObject({
    studyMinutes: 0,
    exerciseMinutes: 0,
    exerciseCount: 0,
  });
});
