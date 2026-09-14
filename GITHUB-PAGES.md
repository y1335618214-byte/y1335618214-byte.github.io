# 将个人网站发布到 GitHub

本网站已经是可直接发布的静态网页，无需安装 Node.js 或运行构建命令。

## 推荐：GitHub 个人网站

1. 登录自己的 GitHub 账号，点击右上角 `+` → `New repository`。
2. 本网站仓库为 `y1335618214-byte/y1335618214-byte.github.io`，设为 `Public`。
3. 创建仓库后，将以下文件上传到仓库的根目录。若使用 ZIP，请先解压，上传解压后的文件，不要只上传 ZIP：

   ```text
   index.html
   styles.css
   assets/
     yan-zhengjie.jpg
     bioark-smart-box.png
   .nojekyll
   README.md
   GITHUB-PAGES.md
   ```

4. 打开仓库 `Settings` → `Pages`。
5. 在 `Build and deployment` 下选择 `Source: Deploy from a branch`。
6. 选择实际保存网页文件的分支（通常为 `main`），目录选择 `/(root)`，点击 `Save`。
7. 等待发布完成，回到 Pages 页面点击 `Visit site`。个人网站地址为 [y1335618214-byte.github.io](https://y1335618214-byte.github.io/)。

若该名字的仓库已经存在，请先检查它已有的网站内容，不要直接覆盖。也可另建一个普通项目仓库并按照同样方式开启 Pages；其网址会包含仓库名。本网站的相对资源路径同时兼容这两种方式。

## GitHub 主页简介

如果也想在 GitHub 账号主页显示简介，可创建一个与自己 GitHub 用户名完全相同的公开仓库，将本项目 README 的个人介绍部分放入该仓库的 `README.md`。网站仓库和个人简介仓库是两个不同用途的仓库。

## 修改内容

- 姓名、学校、项目、荣誉和邮箱：编辑 `index.html`。
- 颜色、布局、字号：编辑 `styles.css`。
- 个人照片和项目图：替换 `assets/` 中相应文件，保留文件名即可。
- GitHub 用户名确定后，可在页面中加入真实 GitHub 主页链接。

项目图来自用户提供的 BioArk 项目网站；个人照片提取自用户提供的简历。原始完整简历未包含在公开文件中。

官方说明：[创建 GitHub Pages 网站](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)、[配置发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。
