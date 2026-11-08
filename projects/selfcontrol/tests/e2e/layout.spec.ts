import { test, expect } from "@playwright/test";
test("mobile pages fit and all resources stay on the app origin", async ({
  page,
}) => {
  const external: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).origin !== "http://127.0.0.1:4173")
      external.push(r.url());
  });
  await page.goto("/");
  await expect(page.getByTestId("study-total")).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/home-mobile.png",
    fullPage: true,
  });
  for (const tab of ["学习", "运动", "日历", "我的"]) {
    await page.getByRole("button", { name: tab, exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "学习", exact: true }).click();
  await page.screenshot({
    path: "docs/screenshots/study-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "记录生物化学" }).click();
  await page.screenshot({
    path: "docs/screenshots/form-mobile.png",
    fullPage: true,
  });
  expect(external).toEqual([]);
});
