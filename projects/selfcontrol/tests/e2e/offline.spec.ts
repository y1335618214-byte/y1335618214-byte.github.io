import { test, expect } from "@playwright/test";
test("cached app reopens offline and persists learning and exercise CRUD", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("study-total")).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.close();
  const offline = await context.newPage();
  await offline.goto("/");
  await expect(offline.getByText("● 离线可用")).toBeVisible();
  await offline.getByRole("button", { name: "学习", exact: true }).click();
  await offline.getByRole("button", { name: "记录英语单词" }).click();
  await offline.getByLabel("时长（分钟）").fill("20");
  await offline.getByLabel("完成量").fill("40");
  await offline.getByRole("button", { name: "保存记录", exact: true }).click();
  await expect(offline.getByRole("dialog")).toHaveCount(0);
  await offline.getByRole("button", { name: "我的", exact: true }).click();
  await offline.getByLabel("项目类别").selectOption("健身");
  await offline.getByLabel("项目名称", { exact: true }).fill("力量训练");
  await offline.getByRole("button", { name: "添加项目", exact: true }).click();
  await expect(
    offline.getByRole("button", { name: "归档力量训练" }),
  ).toBeVisible();
  await offline.getByRole("button", { name: "运动", exact: true }).click();
  await offline.getByRole("button", { name: "记录力量训练" }).click();
  await offline.getByLabel("时长（分钟）").fill("30");
  await offline.getByLabel("训练内容").fill("深蹲 3 组");
  await offline.getByRole("button", { name: "保存记录", exact: true }).click();
  await expect(offline.getByRole("dialog")).toHaveCount(0);
  await offline.reload();
  await expect(offline.getByTestId("study-total")).toContainText("20 分钟");
  await expect(offline.getByTestId("exercise-total")).toContainText("30 分钟");
  await offline.getByRole("button", { name: "编辑力量训练" }).click();
  await offline.getByLabel("时长（分钟）").fill("45");
  await offline.getByRole("button", { name: "保存记录", exact: true }).click();
  await expect(offline.getByTestId("exercise-total")).toContainText("45 分钟");
  offline.once("dialog", (d) => d.accept());
  await offline.getByRole("button", { name: "删除英语单词" }).click();
  await expect(offline.getByTestId("study-total")).toContainText("0 分钟");
  await offline.getByRole("button", { name: "日历", exact: true }).click();
  await offline.getByLabel("项目名称搜索").fill("力量");
  await expect(offline.getByText("深蹲 3 组", { exact: false })).toBeVisible();
  await offline.reload();
  await expect(offline.getByTestId("exercise-total")).toContainText("45 分钟");
  expect(
    await offline.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
