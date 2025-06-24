# syntax=docker/dockerfile:1

# ========== Stage 1: Dependencies ==========
FROM node:20-alpine AS deps
# Alpine Linux 是輕量級的 Linux 發行版

# 安裝構建依賴
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 只複製 package 文件來利用 Docker 層緩存
COPY package.json package-lock.json ./

# 安裝生產依賴
# 使用 npm ci 而不是 npm install 來獲得更快、更可靠的構建
RUN npm ci --omit=dev

# ========== Stage 2: Builder ==========
FROM node:20-alpine AS builder

WORKDIR /app

# 複製 package 文件
COPY package.json package-lock.json ./

# 安裝所有依賴（包括 devDependencies）
RUN npm ci

# 複製源代碼
COPY . .

# 設置環境變數以跳過遙測
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 生成 Prisma Client
RUN npx prisma generate

# 構建應用程式
RUN npm run build

# ========== Stage 3: Runner ==========
FROM node:20-alpine AS runner

WORKDIR /app

# 設置環境變數
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 創建非 root 用戶
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 只複製必要的文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# 複製 Next.js 構建輸出
# 使用 --chown 來設置正確的權限
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 複製 Prisma schema（如果運行時需要）
COPY --from=builder /app/prisma ./prisma

# 切換到非 root 用戶
USER nextjs

# 暴露端口
EXPOSE 3000

# 設置端口環境變數
ENV PORT=3000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# 使用 Next.js standalone 模式啟動
CMD ["node", "server.js"]