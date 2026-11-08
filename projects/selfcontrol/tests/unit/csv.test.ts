import { expect, it } from "vitest";
import { studyCsv, exerciseCsv } from "../../src/data/csv";
it("writes BOM, Chinese headers, quoted multiline text and formula protection", () => {
  const csv = studyCsv([
    {
      date: "2026-10-21",
      project_name: "英语阅读",
      quantity: 2,
      unit: "篇",
      duration_minutes: 30,
      content: 'a,"b"\nc',
      chapters: "第1章",
      learned: "=1+1",
      unmastered: "尚未",
      next_tasks: "复习",
      created_at: "time",
      updated_at: "time",
    },
  ] as any);
  expect(csv.startsWith("\uFEFF")).toBe(true);
  expect(csv).toContain("项目名称");
  expect(csv).toContain('"a,""b""\nc"');
  expect(csv).toContain("'=1+1");
  expect(csv).toContain("\r\n");
  expect(csv).toContain("第1章");
});
it("exports all exercise reflection and group fields", () => {
  const csv = exerciseCsv([
    {
      date: "2026-10-21",
      group: "健身",
      activity_name: "力量训练",
      duration_minutes: 45,
      content: "深蹲",
      feeling: "轻松",
      notes: "@SUM(A1)",
      created_at: "time",
      updated_at: "time",
    },
  ] as any);
  expect(csv).toContain("训练感受");
  expect(csv).toContain("深蹲");
  expect(csv).toContain("轻松");
  expect(csv).toContain("'@SUM(A1)");
});
