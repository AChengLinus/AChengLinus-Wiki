# AChengLinus | WiKi

个人 wiki 站点，Astro 4 + Tailwind + daisyUI 构建，推送到 `main` 后由 Vercel 自动部署到 **https://wiki.acheng9616.com**。

---

## 目录结构

```
src/
├── pages/                    每个文件就是一个页面路由
│   ├── index.astro           首页 /
│   ├── blog/                 笔记（列表 + 详情 + 标签分页）
│   ├── daily/                日常分享和吐槽（列表分页 + 详情）
│   ├── projects.astro        项目
│   ├── cv.astro              个人规划
│   ├── 404.astro             404 页
│   └── rss.xml.js            RSS 输出
│
├── layouts/                  页面骨架（组合组件 + 注入全局样式）
│   ├── BaseLayout.astro      全站框架：侧栏、顶栏、页脚
│   ├── DailyItemLayout.astro 日常详情页：右侧目录 / 分享 / 简洁模式
│   └── PostLayout.astro      笔记详情页
│
├── components/
│   ├── layout/               全站框架零件 BaseHead Header Footer SideBar SideBarMenu SideBarFooter
│   ├── cards/                列表卡片 Card（竖版）/ HorizontalCard（横版）
│   ├── daily/                日常列表项 DailyListItem
│   └── cv/                   时间线 TimeLine
│
├── content/                  ★ 所有内容都在这里，其余都是代码
│   ├── blog/                 笔记（.md，可带同名文件夹放图）
│   └── daily/                日常 + AI 早报（.md）
│
├── styles/global.css         全局样式（含目录高亮、简洁模式）
├── lib/createSlug.ts         slug 生成
├── config.ts                 站点名称 / 描述 / 开关
└── content/config.ts         内容字段校验规则（加字段先改这里）
```

```
public/                       静态资源，原样复制到站点根目录
├── site/                     头像、favicon、社交分享图
├── blog/                     笔记配图
├── projects/                 项目配图
└── daily/
    ├── juya/                 AI 早报封面（脚本自动下载，不要手改）
    └── jiangcun-school/      其他日常配图
```

```
scripts/
├── sync-juya.mjs             抓取橘鸦 AI 早报 → 生成 md + 下载封面
└── daily-publish.sh          抓取 + 提交 + 推送（每天 12:00 由定时任务调用）
```

**放置规则一句话**：内容进 `src/content/`，图片进 `public/` 下对应目录，页面进 `src/pages/`，可复用零件进 `src/components/`。

---

## 写一篇日常 / 吐槽

在 `src/content/daily/` 新建 `随便起名.md`：

```markdown
---
title: "标题"
description: "一句话摘要，会显示在列表卡片上"
updatedDate: "2026-11-01"
badge: "注意"                    # 可选。写成 "AI日报" 会被归到列表的「AI 日报」筛选
tags: ["吐槽", "生活"]            # 可选，参与站内搜索
heroImage: "/daily/my-note/cover.png"   # 可选。图片放 public/daily/my-note/ 下
---

正文用 Markdown 写，图片用 `![说明](/daily/my-note/pic.png)`。
有 `## 二级标题` 时详情页右侧会自动生成目录。
```

> frontmatter 是**硬校验**：`title`、`description`、`updatedDate` 缺任何一个，`astro build` 都会直接失败。

---

## AI 早报（橘鸦）

- **自动**：每天 12:00 由定时任务拉取 → 提交 → 推送 → Vercel 部署
- **手动跑一次**：
  ```bash
  node scripts/sync-juya.mjs --days=7      # 抓最近 7 天，已存在的跳过
  ```
- **补历史**：`node scripts/sync-juya.mjs --days=180`
- **强制重抓**：加 `--force`

脚本生成 `src/content/daily/ai-daily-YYYY-MM-DD.md`，并把当天封面存到 `public/daily/juya/YYYY-MM-DD/cover.png`。数据来源 `https://daily.juya.uk`。

---

## 本地开发与构建

```bash
# 安装依赖（必须用 pnpm 8，见注意事项）
npx --yes pnpm@8.15.9 install --frozen-lockfile --registry=https://registry.npmmirror.com

npx astro dev       # 本地开发 http://localhost:4321
npx astro build     # 构建到 dist/
npx astro preview   # 预览构建结果
```

**部署**：`git push origin main` → Vercel 自动构建部署（约 30~90 秒）。不用手动上传 `dist/`，它已在 `.gitignore` 里。

---

## 常改的地方

| 想改什么 | 改哪个文件 |
|---|---|
| 站点名称（浏览器标签固定显示） | `src/config.ts` 的 `SITE_TITLE` |
| 左侧导航项 | `src/components/layout/SideBarMenu.astro` |
| 列表卡片样式 | `src/components/daily/DailyListItem.astro` |
| 详情页目录 / 分享 / 简洁模式 | `src/layouts/DailyItemLayout.astro` |
| 目录与简洁模式样式 | `src/styles/global.css` |
| 列表页搜索与筛选 | `src/pages/daily/[...page].astro` |
| 内容字段规则 | `src/content/config.ts` |
| 主题色 | `src/layouts/BaseLayout.astro` 的 `data-theme` 或 `tailwind.config.cjs` |

---

## 注意事项（踩过的坑）

1. **依赖必须用 pnpm 8 安装**。`pnpm-lock.yaml` 是 `lockfileVersion: 6.0`，用 pnpm 9+ 会升级它并拉到新版 Astro，导致 `@astrojs/sitemap` 构建报错。
2. **图片路径用正斜杠**。YAML 里写 `blog\x\01.png` 这种反斜杠会触发 `unknown escape sequence`，直接构建失败。
3. **标题锚点由 Astro 自动生成**（如 `#开发生态`），右侧目录依赖它，不要手动改 heading 的 id。
4. **搜索只覆盖标题 / 摘要 / 标签 / 日期**，不搜正文 —— 全文索引会让页面体积膨胀十几倍。
5. `/daily` 的分页是构建时静态生成的；搜索和筛选是在**全量索引**上做的前端过滤，二者互不影响。
6. 站内脚本用**事件委托**绑定：Astro 的 View Transitions 在 SPA 导航后不派发 `astro:page-load`，靠它重绑会静默失效。
