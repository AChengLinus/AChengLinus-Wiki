#!/usr/bin/env node
/**
 * 同步橘鸦 Juya AI 早报到「日常吐槽」
 *
 * 数据源（公开）：
 *   Markdown: https://daily.juya.uk/markdown/YYYY-MM-DD.md
 *   RSS:      https://daily.juya.uk/rss.xml
 *
 * 产出：
 *   src/content/daily/ai-daily-YYYY-MM-DD.md
 *   public/images/daily/juya/YYYY-MM-DD/cover.png（当天日报封面图，本地化）
 *
 * 用法：
 *   node scripts/sync-juya.mjs                 # 默认最近 30 天
 *   node scripts/sync-juya.mjs --days=90       # 最近 90 天
 *   node scripts/sync-juya.mjs --since=2026-07-01
 *   node scripts/sync-juya.mjs --force         # 覆盖已存在的条目
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "src/content/daily");
const IMG_ROOT = path.join(ROOT, "public/images/daily/juya");
const SOURCE = "https://daily.juya.uk";
const UA = "Mozilla/5.0 (compatible; AChengLinus-Wiki sync-juya/1.0)";

/* ---------------- 参数 ---------------- */
const argv = process.argv.slice(2);
const arg = (name, dflt = null) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : dflt;
};
const FORCE = argv.includes("--force");
const DAYS = Number(arg("days", 30));
const SINCE = arg("since", null);

/* ---------------- 日期工具（固定 Asia/Shanghai） ---------------- */
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
/** 日期格式化必须按 Asia/Shanghai，toISOString() 是 UTC，会整体偏一天 */
const d2s = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(d);
const parseDate = (s) => new Date(`${s}T00:00:00+08:00`);

function buildDateList() {
  const out = [];
  if (SINCE) {
    for (let d = parseDate(SINCE); d2s(d) <= today; d.setDate(d.getDate() + 1)) {
      out.push(d2s(d));
    }
  } else {
    const end = parseDate(today);
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      out.push(d2s(d));
    }
  }
  return out.reverse(); // 新→旧
}

/* ---------------- 解析 ---------------- */
function extractCover(md) {
  const m = md.match(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/);
  return m ? m[1] : null;
}

function cleanBody(md, date) {
  let body = md.replace(/\r\n/g, "\n");
  // 去掉首部封面图
  body = body.replace(/^!\[[^\]]*\]\([^)]+\)\s*\n+/, "");
  // 去掉与 frontmatter title 重复的一级标题
  body = body.replace(/^#\s*AI\s*早报\s*\d{4}-\d{2}-\d{2}\s*\n+/, "");
  // 去掉零宽字符 / 多余空行
  body = body.replace(/\u200b/g, "").replace(/\n{3,}/g, "\n\n");
  return body.trim();
}

/** 从「概览」段落抽取前几条要闻，作为列表页摘要 */
function buildDescription(md, date) {
  const overview = md.split(/^##\s*概览\s*$/m)[1]?.split(/^##\s+/m)[0] || md.slice(0, 2000);
  const items = [...overview.matchAll(/^-\s+(.+)$/gm)]
    .map((m) =>
      m[1]
        .replace(/\[↗\]\([^)]*\)/g, "")       // 去掉来源箭头链接
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 普通链接保留文字
        .replace(/`#[^`]*`/g, "")               // 去掉 #编号
        .replace(/[*_`>]/g, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
  let desc = items.slice(0, 3).join("；");
  if (desc.length > 120) desc = desc.slice(0, 118) + "…";
  return desc || `橘鸦 AI 早报 ${date}`;
}

/* ---------------- YAML 安全字符串 ---------------- */
const yaml = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

/* ---------------- 抓取 ---------------- */
async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
  return buf.length;
}

/* ---------------- 主流程 ---------------- */
async function main() {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  const dates = buildDateList();
  let created = 0, skipped = 0, missing = 0, failed = 0;

  for (const date of dates) {
    const slug = `ai-daily-${date}`;
    const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
    const exists = await fs
      .access(mdPath)
      .then(() => true)
      .catch(() => false);

    if (exists && !FORCE) {
      skipped++;
      continue;
    }

    let md;
    try {
      md = await fetchText(`${SOURCE}/markdown/${date}.md`);
    } catch (e) {
      console.log(`  ⚠️  ${date} 抓取失败：${e.message}`);
      failed++;
      continue;
    }
    // 站点对不存在的日期也可能返回 200，用标题校验真实性
    if (!md.includes(`AI 早报 ${date}`)) {
      missing++;
      continue;
    }

    // 封面图本地化
    let heroImage = null;
    const coverUrl = extractCover(md);
    if (coverUrl) {
      const ext = (coverUrl.match(/\.(png|jpe?g|webp|gif)/i)?.[1] || "png").toLowerCase();
      const rel = `/images/daily/juya/${date}/cover.${ext}`;
      try {
        const bytes = await download(coverUrl, path.join(ROOT, "public", rel));
        heroImage = rel;
        console.log(`  🖼️  ${date} 封面 ${(bytes / 1024).toFixed(0)}KB`);
      } catch (e) {
        console.log(`  ⚠️  ${date} 封面下载失败：${e.message}（改用外链）`);
        heroImage = coverUrl;
      }
    }

    const body = cleanBody(md, date);
    const description = buildDescription(md, date);
    const fm = [
      "---",
      `title: ${yaml(`AI 早报 ${date}`)}`,
      `description: ${yaml(description)}`,
      `updatedDate: ${yaml(date)}`,
      `badge: "AI日报"`,
      `tags: ["AI", "日报", "橘鸦"]`,
      ...(heroImage ? [`heroImage: ${yaml(heroImage)}`] : []),
      `source: ${yaml(`${SOURCE}/issues/${date}/`)}`,
      "---",
      "",
      `> 来源：[橘鸦 AI 早报 ${date}](${SOURCE}/issues/${date}/) · 内容由 AI 辅助生成，可能存在错误`,
      "",
      body,
      "",
    ].join("\n");

    await fs.writeFile(mdPath, fm, "utf8");
    created++;
    console.log(`  ✅ ${date} → src/content/daily/${slug}.md`);
  }

  console.log(
    `\n完成：新增 ${created}，跳过已存在 ${skipped}，源站无内容 ${missing}，失败 ${failed}（共尝试 ${dates.length} 天）`
  );
  console.log(`最新日期：${dates[0]}　最早：${dates[dates.length - 1]}`);
}

main().catch((e) => {
  console.error("同步失败：", e);
  process.exit(1);
});
