import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { resolve, extname, join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
test("subdirectory deployment loads manifest assets and reopens offline", async ({
  page,
  context,
}) => {
  const root = await mkdtemp(join(tmpdir(), "jiji-subpath-"));
  let server: ReturnType<typeof createServer> | undefined;
  try {
    execFileSync(
      process.execPath,
      [
        "node_modules/vite/bin/vite.js",
        "build",
        "--base=/jiji/",
        "--outDir",
        root,
        "--emptyOutDir",
      ],
      { stdio: "pipe" },
    );
    server = createServer(async (req, res) => {
      try {
        const pathname = new URL(req.url!, "http://localhost").pathname;
        if (!pathname.startsWith("/jiji/")) {
          res.writeHead(404).end();
          return;
        }
        const suffix = pathname.slice("/jiji/".length) || "index.html";
        const file = resolve(root, suffix);
        if (!file.startsWith(root + "/")) {
          res.writeHead(403).end();
          return;
        }
        const mime: Record<string, string> = {
          ".html": "text/html",
          ".js": "application/javascript",
          ".css": "text/css",
          ".webmanifest": "application/manifest+json",
          ".png": "image/png",
        };
        res.writeHead(200, {
          "Content-Type": mime[extname(file)] || "application/octet-stream",
        });
        res.end(await readFile(file));
      } catch {
        res.writeHead(404).end();
      }
    });
    await new Promise<void>((resolve) =>
      server!.listen(0, "127.0.0.1", resolve),
    );
    const { port } = server.address() as { port: number };
    await page.goto(`http://127.0.0.1:${port}/jiji/`);
    await expect(page.getByTestId("study-total")).toBeVisible();
    const resources = await page.evaluate(async () => {
      const manifestUrl = (
        document.querySelector("link[rel=manifest]") as HTMLLinkElement
      ).href;
      const manifest = await (await fetch(manifestUrl)).json();
      return {
        start: new URL(manifest.start_url, manifestUrl).pathname,
        icons: await Promise.all(
          manifest.icons.map(
            async (i: { src: string }) =>
              (await fetch(new URL(i.src, manifestUrl))).status,
          ),
        ),
      };
    });
    expect(resources.start).toBe("/jiji/");
    expect(resources.icons.every((code) => code === 200)).toBe(true);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByTestId("study-total")).toContainText("0 分钟");
  } finally {
    if (server)
      await new Promise<void>((resolve) => server!.close(() => resolve()));
    await rm(root, { recursive: true, force: true });
  }
});
