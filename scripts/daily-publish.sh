#!/bin/bash
# 每日同步橘鸦 AI 早报并发布
# 由 Hermes cron 每天 12:00 调用；也可手动执行
set -uo pipefail

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"
GIT="/Library/Developer/CommandLineTools/usr/bin/git"
REPO="$HOME/AI/AChengLinus-Wiki"
AUTHOR_NAME="AChengLinus"
AUTHOR_EMAIL="129370271+AChengLinus@users.noreply.github.com"

cd "$REPO" || { echo "❌ 仓库目录不存在：$REPO"; exit 1; }

echo "== $(date '+%F %T') 开始同步 =="

# 先与远端对齐，避免 push 被拒
if ! "$GIT" pull --rebase --autostash --quiet; then
  echo "❌ git pull 失败，放弃本次同步（避免制造冲突）"
  exit 1
fi

# 抓最近 3 天（覆盖漏跑的情况，已存在的会跳过）
if ! node scripts/sync-juya.mjs --days=3; then
  echo "❌ 抓取失败"
  exit 1
fi

if [ -z "$("$GIT" status --porcelain)" ]; then
  echo "✅ 没有新内容，无需发布"
  exit 0
fi

NEW_COUNT=$("$GIT" status --porcelain | grep -c '^?? src/content/daily/' || true)
"$GIT" add -A
"$GIT" -c user.name="$AUTHOR_NAME" -c user.email="$AUTHOR_EMAIL" \
  commit --quiet -m "chore(daily): 同步橘鸦 AI 早报 $(date +%F)（新增 ${NEW_COUNT} 篇）"

if "$GIT" push origin main; then
  echo "✅ 已推送，Vercel 将自动部署（新增 ${NEW_COUNT} 篇）"
else
  echo "❌ push 失败（检查 SSH key 是否已加到 GitHub）"
  exit 1
fi
