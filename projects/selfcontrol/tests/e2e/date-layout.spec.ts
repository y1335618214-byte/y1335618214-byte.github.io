import { test, expect, type Locator } from "@playwright/test";
test.use({ locale: "zh-CN" });
async function fitsDate(input: Locator) {
  await input.fill("2026-12-22");
  await expect(input).toHaveValue("2026-12-22");
  const dimensions = await input.evaluate((element: HTMLInputElement) => {
    const style = getComputedStyle(element),
      canvas = document.createElement("canvas"),
      context = canvas.getContext("2d")!;
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return {
      width: element.getBoundingClientRect().width,
      needed:
        context.measureText("2026年12月22日").width +
        parseFloat(style.paddingLeft) +
        parseFloat(style.paddingRight) +
        28,
      height: element.getBoundingClientRect().height,
    };
  });
  expect(dimensions.width).toBeGreaterThanOrEqual(dimensions.needed);
  expect(dimensions.height).toBeGreaterThanOrEqual(44);
}
for (const width of [320, 390, 430]) {
  test(`date controls have space for a single Chinese date at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.getByRole("button", { name: "运动", exact: true }).click();
    await fitsDate(page.getByLabel("记录日期"));
    if (width === 390)
      await page.screenshot({
        path: "docs/screenshots/exercise-date-mobile.png",
        fullPage: true,
      });
    await page.getByRole("button", { name: "学习", exact: true }).click();
    await fitsDate(page.getByLabel("记录日期"));
    await page.getByRole("button", { name: "记录英语单词" }).click();
    await fitsDate(
      page.getByRole("dialog").getByLabel("日期", { exact: true }),
    );
    await page.getByLabel("时长（分钟）").fill("15");
    await page.getByRole("button", { name: "保存记录", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: "编辑英语单词" }).click();
    await expect(
      page.getByRole("dialog").getByLabel("日期", { exact: true }),
    ).toHaveValue("2026-12-22");
    await page.getByRole("button", { name: "取消", exact: true }).click();
    await page.getByRole("button", { name: "日历", exact: true }).click();
    await fitsDate(page.getByLabel("查询日期"));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
