import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("downloads valid JSON and BOM CSV and restores after explicit confirmation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "学习", exact: true }).click();
  await page.getByRole("button", { name: "记录STR 项目" }).click();
  await page.getByLabel("时长（分钟）").fill("50");
  await page.getByLabel("工作内容").fill("整理实验数据");
  await page.getByRole("button", { name: "保存记录", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "我的", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出完整 JSON 备份" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const backup = JSON.parse(await readFile(path!, "utf8"));
  expect(backup.data.studyRecords[0].content).toBe("整理实验数据");
  expect(backup.data.studyProjects).toHaveLength(7);
  const csvPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出学习 CSV" }).click();
  const csv = await csvPromise;
  const bytes = await readFile((await csv.path())!);
  expect([...bytes.subarray(0, 3)]).toEqual([239, 187, 191]);
  expect(bytes.toString()).toContain("整理实验数据");
  await page.getByRole("button", { name: "首页", exact: true }).click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "删除STR 项目" }).click();
  await expect(page.getByTestId("study-total")).toContainText("0 分钟");
  await page.getByRole("button", { name: "我的", exact: true }).click();
  await page.getByLabel("从 JSON 备份恢复").setInputFiles(path!);
  await expect(page.getByRole("heading", { name: "恢复预览" })).toBeVisible();
  await page.getByRole("button", { name: "确认合并并恢复" }).click();
  await expect(
    page.getByText("恢复完成并校验通过：共 1 条学习记录、0 条运动记录。"),
  ).toBeVisible();
  await page.getByRole("button", { name: "首页", exact: true }).click();
  await expect(page.getByTestId("study-total")).toContainText("50 分钟");
});
