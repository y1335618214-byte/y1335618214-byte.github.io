# SelfControl · 日积

[打开日积](https://y1335618214-byte.github.io/projects/selfcontrol/app/)

SelfControl 把学习和运动记进同一本日历。记下今天学了哪一章、跑了多久，就能按天、周或月回看自己的投入。打开后，首页左上角会看到「燕子」字样。记录保存在当前浏览器，首次联网缓存后也能离线使用。

## 实际功能

- 记录、编辑和删除学习与运动数据，并在首页汇总当天时长。
- 内置英语、生化、生理、微生物和 STR 等学习项目，也可创建、归档和恢复自定义项目与运动活动。
- 在日历中查看当日、当周和当月统计，按名称和记录类型搜索历史。
- 导出完整 JSON 备份或中文 CSV；JSON 恢复会先校验并预览变更，再按 ID 合并。
- 安装到手机主屏幕；首次联网缓存后可离线使用，新版本可提示刷新。

数据只属于当前“浏览器 + 站点地址”。清除站点数据、使用隐私模式或更换网址都可能看不到原记录，迁移前请先导出 JSON 备份。

## 技术栈

React 19、TypeScript、Vite、Dexie/IndexedDB、Workbox PWA。单元测试使用 Vitest，浏览器测试使用 Playwright。

## 本地运行

需要 Node.js 22.12+ 和 pnpm：

```sh
pnpm install --frozen-lockfile
pnpm dev
```

终端会显示本地地址。验证生产构建与离线缓存时使用：

```sh
pnpm build
pnpm preview
```

测试命令：

```sh
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
```

## GitHub Pages 构建

本仓库中的 `app/` 是正式演示的静态产物，使用对应子目录构建：

```sh
VITE_BASE=/projects/selfcontrol/app/ pnpm build
```

将 `dist/` 的全部内容复制到 `app/`。`sw.js`、`manifest.webmanifest` 和带哈希的资源必须保持同一目录结构；应用使用内部标签导航，不需要服务器端路由或环境密钥。
