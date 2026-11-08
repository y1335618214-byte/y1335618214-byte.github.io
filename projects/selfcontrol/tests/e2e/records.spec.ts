import { test, expect } from "@playwright/test";
test("study fields, draft exclusion, repeat sessions, edit/delete and reload", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("study-total")).toContainText("0 分钟");
  await page.getByRole("button", { name: "学习", exact: true }).click();
  await page.getByRole("button", { name: "记录英语阅读" }).click();
  await page.getByLabel("完成量").fill("2.5");
  await page.getByLabel("数量单位").fill("篇");
  await page.getByLabel("时长（分钟）").fill("25");
  await page.getByLabel("今日学到了什么").fill("理解文章结构");
  await page.getByRole("button", { name: "取消", exact: true }).click();
  await page.getByRole("button", { name: "首页", exact: true }).click();
  await expect(page.getByTestId("study-total")).toContainText("0 分钟");
  await page.getByRole("button", { name: "学习", exact: true }).click();
  for (const duration of ["25", "35"]) {
    await page.getByRole("button", { name: "记录英语阅读" }).click();
    await page.getByLabel("完成量").fill("2.5");
    await page.getByLabel("数量单位").fill("篇");
    await page.getByLabel("时长（分钟）").fill(duration);
    await page.getByLabel("今日学到了什么").fill("理解文章结构");
    await page.getByRole("button", { name: "保存记录", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page.getByRole("button", { name: "首页", exact: true }).click();
  await expect(page.getByTestId("study-total")).toContainText("1 小时");
  await page.reload();
  await expect(page.getByTestId("study-total")).toContainText("1 小时");
  await page.getByRole("button", { name: "编辑英语阅读" }).first().click();
  await expect(page.getByLabel("数量单位")).toHaveValue("篇");
  await expect(page.getByLabel("完成量")).toHaveValue("2.5");
  await expect(page.getByLabel("今日学到了什么")).toHaveValue("理解文章结构");
  await page.getByLabel("时长（分钟）").fill("10");
  await page.getByRole("button", { name: "保存记录", exact: true }).click();
  await expect(page.getByTestId("study-total")).toContainText("35 分钟");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "删除英语阅读" }).first().click();
  await expect(page.getByTestId("study-total")).toContainText("25 分钟");
});
test("all dedicated study fields survive edit and the UI avoids horizontal overflow", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "学习", exact: true }).click();
  for (const name of [
    "英语听力",
    "生物化学",
    "生理学",
    "微生物学",
    "STR 项目",
  ]) {
    await page.getByRole("button", { name: `记录${name}` }).click();
    await page.getByLabel("时长（分钟）").fill("10");
    if (name === "英语听力") {
      await page.getByLabel("完成量").fill("3");
      await page.getByLabel("数量单位").fill("段");
    } else if (name === "STR 项目") {
      await page.getByLabel("工作内容").fill("数据清洗与整理");
    } else {
      await page.getByLabel("学习章节或章节范围").fill("第 3 章 3.1–3.8");
    }
    await page.getByLabel("哪些知识尚未掌握").fill("机制");
    await page.getByLabel("后续需要完成的任务").fill("做练习");
    await page.getByRole("button", { name: "保存记录", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: `编辑${name}` }).click();
    if (name === "英语听力")
      await expect(page.getByLabel("数量单位")).toHaveValue("段");
    else if (name === "STR 项目")
      await expect(page.getByLabel("工作内容")).toHaveValue("数据清洗与整理");
    else
      await expect(page.getByLabel("学习章节或章节范围")).toHaveValue(
        "第 3 章 3.1–3.8",
      );
    await expect(page.getByLabel("哪些知识尚未掌握")).toHaveValue("机制");
    await page.getByRole("button", { name: "取消", exact: true }).click();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("a rejected database write preserves the draft and a retry saves once", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "学习", exact: true }).click();
  await page.getByRole("button", { name: "记录英语单词" }).click();
  await page.getByLabel("时长（分钟）").fill("12");
  await page.getByLabel("今日学到了什么").fill("不要丢失草稿");
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    (window as any).__restorePut = () => {
      IDBObjectStore.prototype.put = original;
    };
    IDBObjectStore.prototype.put = function (...args: any[]) {
      if (this.name === "studyRecords")
        throw new DOMException("存储已满", "QuotaExceededError");
      return original.apply(this, args as any);
    };
  });
  await page.getByRole("button", { name: "保存记录", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByLabel("今日学到了什么")).toHaveValue("不要丢失草稿");
  await page.evaluate(() => (window as any).__restorePut());
  await page
    .getByRole("button", { name: "保存记录", exact: true })
    .evaluate((el: HTMLButtonElement) => {
      el.click();
      el.click();
    });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "首页", exact: true }).click();
  await expect(page.getByTestId("study-total")).toContainText("12 分钟");
  await expect(page.getByRole("button", { name: "编辑英语单词" })).toHaveCount(
    1,
  );
});
test("home recomputes the local day on foreground return", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-21T15:59:00Z") });
  await page.goto("/");
  await page.getByRole("button", { name: "学习", exact: true }).click();
  await page.getByRole("button", { name: "记录英语单词" }).click();
  await page.getByLabel("时长（分钟）").fill("15");
  await page.getByRole("button", { name: "保存记录", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "首页", exact: true }).click();
  await expect(page.getByTestId("study-total")).toContainText("15 分钟");
  await page.clock.setFixedTime(new Date("2026-10-21T16:01:00Z"));
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByTestId("study-total")).toContainText("0 分钟");
  await expect(page.getByText("2026 / 10 / 22 · 做你想做的")).toBeVisible();
});

test("today shortcuts reset a previously selected historical date", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-21T04:00:00Z") });
  await page.goto("/");
  await page.getByRole("button", { name: "日历", exact: true }).click();
  await page.getByLabel("查询日期").fill("2026-10-01");
  await page.getByRole("button", { name: "首页", exact: true }).click();
  await page.getByRole("button", { name: "＋ 记一笔", exact: true }).click();
  await expect(page.getByLabel("记录日期")).toHaveValue("2026-10-21");
});
test("unavailable IndexedDB shows an error instead of a blank app", async ({
  page,
}) => {
  await page.addInitScript(() => {
    IDBFactory.prototype.open = function () {
      throw new DOMException("Storage blocked", "SecurityError");
    };
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("无法打开本地数据库");
});
test("IndexedDB read errors show recovery guidance instead of crashing", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = IDBObjectStore.prototype.getAll;
    IDBObjectStore.prototype.getAll = function (...args: any[]) {
      if (this.name === "studyRecords")
        throw new DOMException("Read blocked", "UnknownError");
      return original.apply(this, args as any);
    };
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("本地数据");
});
