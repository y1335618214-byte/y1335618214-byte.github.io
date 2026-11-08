import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
test("a real waiting service worker cannot refresh an open draft", async ({
  page,
}) => {
  let updated = false;
  const root = resolve("dist");
  const server = createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url!, "http://localhost").pathname;
      const file = resolve(
        root,
        "." + (pathname === "/" ? "/index.html" : pathname),
      );
      if (!file.startsWith(root + "/")) {
        res.writeHead(403).end();
        return;
      }
      let content = await readFile(file);
      if (pathname === "/sw.js" && updated)
        content = Buffer.from(content.toString() + "\n// test deployment v2");
      const mime: Record<string, string> = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".webmanifest": "application/manifest+json",
        ".png": "image/png",
      };
      res.writeHead(200, {
        "Content-Type": mime[extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(content);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as { port: number };
  try {
    await page.goto(`http://127.0.0.1:${address.port}/`);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.getByRole("button", { name: "学习", exact: true }).click();
    await page.getByRole("button", { name: "记录英语单词" }).click();
    await page.getByLabel("时长（分钟）").fill("23");
    await page.getByLabel("今日学到了什么").fill("升级时保留草稿");
    updated = true;
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    });
    await expect(page.getByRole("button", { name: "刷新更新" })).toBeDisabled();
    await expect(page.getByLabel("今日学到了什么")).toHaveValue(
      "升级时保留草稿",
    );
    await page.getByRole("button", { name: "保存记录", exact: true }).click();
    await expect(page.getByRole("button", { name: "刷新更新" })).toBeEnabled();
    await page.getByRole("button", { name: "刷新更新" }).click();
    await expect(page.getByTestId("study-total")).toContainText("23 分钟");
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((e) => (e ? reject(e) : resolve())),
    );
  }
});
