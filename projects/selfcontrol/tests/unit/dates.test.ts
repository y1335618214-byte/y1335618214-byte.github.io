import { expect, it } from "vitest";
import { localDate, validDate } from "../../src/domain/dates";
import { validateStudy, validateExercise } from "../../src/domain/validation";
const base = {
  id: "a",
  date: "2026-10-21",
  project_id: "words",
  project_name: "英语单词",
  duration_minutes: 20,
  quantity: 10,
  unit: "个",
  content: "",
  chapters: "",
  learned: "",
  unmastered: "",
  next_tasks: "",
  created_at: "2026-10-21T00:00:00.000Z",
  updated_at: "2026-10-21T00:00:00.000Z",
};
it("uses local date across midnight", () => {
  expect(localDate(new Date(2026, 9, 21, 0, 1))).toBe("2026-10-21");
  expect(localDate(new Date(2026, 9, 20, 23, 59))).toBe("2026-10-20");
});
it("rejects impossible dates", () => {
  expect(validDate("2026-02-29")).toBe(false);
  expect(validDate("2024-02-29")).toBe(true);
  expect(validDate("2026-13-01")).toBe(false);
  expect(validDate("2026-1-1")).toBe(false);
});
it.each([0, -1, 1.5, NaN, Infinity])(
  "rejects invalid duration %s",
  (duration_minutes) => {
    expect(() => validateStudy({ ...base, duration_minutes })).toThrow();
  },
);
it.each([-1, NaN, Infinity])("rejects invalid quantity %s", (quantity) => {
  expect(() => validateStudy({ ...base, quantity })).toThrow();
});
it("retains fields and validates exercise groups", () => {
  expect(validateStudy(base)).toEqual(base);
  expect(() =>
    validateExercise({
      ...base,
      group: "未知",
      activity_id: "a",
      activity_name: "跑步",
      feeling: "",
      notes: "",
    }),
  ).toThrow();
});
