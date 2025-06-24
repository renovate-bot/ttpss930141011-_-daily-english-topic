# Docker 鏡像優化說明

## 優化策略

### 1. 多階段構建
- **Stage 1 (deps)**: 只安裝生產依賴
- **Stage 2 (builder)**: 構建應用程式
- **Stage 3 (runner)**: 最小化運行時鏡像

### 2. 使用 Alpine Linux
- 基礎鏡像從 `node:20` (約 1GB) 改為 `node:20-alpine` (約 150MB)
- Alpine 是專為容器設計的輕量級 Linux 發行版

### 3. Next.js Standalone 模式
- 在 `next.config.ts` 中設置 `output: 'standalone'`
- 自動樹搖和優化，只包含實際使用的依賴
- 將 node_modules 從 700MB+ 減少到約 20-30MB

### 4. 優化層緩存
- 先複製 package 文件，再複製源代碼
- 只有依賴變更時才重新安裝

### 5. 安全性改進
- 使用非 root 用戶運行應用
- 添加健康檢查端點

## 預期結果
- 原始鏡像大小: ~1.4GB
- 優化後鏡像大小: ~140MB → ~80MB（進一步優化）
- 構建時間: 顯著減少（利用層緩存）

## 使用方式

### 本地構建
```bash
# 構建鏡像
docker build -t daily-english-nextjs .

# 運行容器
docker run -p 3000:3000 --env-file .env daily-english-nextjs
```

### 使用 Docker Compose
```bash
# 構建並啟動
docker-compose up --build

# 在背景運行
docker-compose up -d
```

## 進一步優化建議

1. **使用 distroless 鏡像**（如果不需要 shell）
   ```dockerfile
   FROM gcr.io/distroless/nodejs20-debian12
   ```

2. **壓縮靜態資源**
   - 使用 Brotli 或 Gzip 預壓縮
   - 配置 CDN 來服務靜態資源

3. **優化依賴**
   - 定期審查和移除未使用的依賴
   - 使用 `npm audit` 檢查安全性

4. **使用 BuildKit**
   ```bash
   DOCKER_BUILDKIT=1 docker build .
   ```

## 監控鏡像大小
```bash
# 查看鏡像大小
docker images daily-english-nextjs

# 分析各層大小
docker history daily-english-nextjs
```