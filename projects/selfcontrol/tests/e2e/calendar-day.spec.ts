import { test, expect } from "@playwright/test";
test("calendar defaults to daily totals and selecting a date exits week/month totals", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-22T04:00:00Z") });
  await page.goto("/");
  await page.getByRole("button", { name: "我的", exact: true }).click();
  await page.getByLabel("项目类别").selectOption("健身");
  await page.getByLabel("项目名称", { exact: true }).fill("步行");
  await page.getByRole("button", { name: "添加项目", exact: true }).click();
  await expect(page.getByRole("button", { name: "归档步行" })).toBeVisible();
  for (const [date, study, exercise] of [
    ["2026-10-21", "20", "10"],
    ["2026-10-22", "40", "30"],
  ]) {
    await page.getByRole("button", { name: "学习", exact: true }).click();
    await page.getByLabel("记录日期").fill(date);
    await page.getByRole("button", { name: "记录英语单词" }).click();
    await page.getByLabel("时长（分钟）").fill(study);
    await page.getByRole("button", { name: "保存记录", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: "运动", exact: true }).click();
    await page.getByRole("button", { name: "记录步行" }).click();
    await page.getByLabel("时长（分钟）").fill(exercise);
    await page.getByRole("button", { name: "保存记录", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page.getByRole("button", { name: "日历", exact: true }).click();
  const totals = page.locator(".stats-row strong");
  await expect(
    page.getByRole("button", { name: "当日", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(totals).toHaveText(["40 分钟", "30 分钟", "1 次"]);
  await page
    .getByRole("button", { name: "查看 2026-10-21", exact: true })
    .click();
  await expect(totals).toHaveText(["20 分钟", "10 分钟", "1 次"]);
  await page.getByRole("button", { name: "本周", exact: true }).click();
  await expect(totals).toHaveText(["1 小时", "40 分钟", "2 次"]);
  await page
    .getByRole("button", { name: "查看 2026-10-22", exact: true })
    .click();
  await expect(totals).toHaveText(["40 分钟", "30 分钟", "1 次"]);
  await page.getByRole("button", { name: "编辑英语单词" }).click();
  await page.getByLabel("时长（分钟）").fill("15");
  await page.getByRole("button", { name: "保存记录", exact: true }).click();
  await expect(totals).toHaveText(["15 分钟", "30 分钟", "1 次"]);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "删除步行" }).click();
  await expect(totals).toHaveText(["15 分钟", "0 分钟", "0 次"]);
  await page.getByRole("button", { name: "本月", exact: true }).click();
  await expect(totals).toHaveText(["35 分钟", "10 分钟", "1 次"]);
  await page.getByLabel("查询日期").fill("2026-10-23");
  await expect(
    page.getByRole("button", { name: "当日", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(totals).toHaveText(["0 分钟", "0 分钟", "0 次"]);
});
