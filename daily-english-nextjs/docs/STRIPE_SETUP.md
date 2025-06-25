# Stripe 訂閱功能設定指南

## 前置準備

1. 建立 Stripe 帳號：https://stripe.com
2. 取得 API 金鑰（測試環境和正式環境）

## 設定步驟

### 1. 設定環境變數

複製 `.env.example` 到 `.env.local` 並填入以下資訊：

```bash
# Stripe API 金鑰（從 Stripe Dashboard 取得）
STRIPE_API_KEY="sk_test_..."

# Stripe Webhook 密鑰（設定 webhook 後取得）
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe 價格 ID（建立產品後取得）
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID="price_..."
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID="price_..."
```

### 2. 在 Stripe Dashboard 建立產品

1. 前往 Stripe Dashboard > 產品
2. 建立新產品「Daily English Topic Pro」
3. 建立兩個定價：
   - 月付：$15/月
   - 年付：$144/年（相當於 $12/月）
4. 記錄價格 ID

### 3. 設定 Webhook

1. 前往 Stripe Dashboard > 開發人員 > Webhooks
2. 新增端點：
   - 端點 URL：`https://your-domain.com/api/webhooks/stripe`
   - 選擇事件：
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
3. 記錄 Webhook 簽名密鑰

### 4. 更新資料庫

執行 Prisma migration 來更新資料庫結構：

```bash
cd daily-english-nextjs
npx prisma migrate dev --name add-stripe-fields
```

### 5. 測試訂閱流程

1. 使用 Stripe 測試卡號：`4242 4242 4242 4242`
2. 測試訂閱流程：
   - 訪問 `/pricing` 頁面
   - 點擊「升級至 Pro」
   - 完成 Stripe Checkout 流程
   - 檢查 `/dashboard/billing` 頁面

## 主要功能

### 已實作功能

- ✅ Prisma schema with Stripe fields
- ✅ User role system (USER/ADMIN)
- ✅ Pricing page (Free/Pro plans)
- ✅ Billing management page
- ✅ Stripe webhook integration
- ✅ Checkout session creation
- ✅ Customer portal access

### 頁面路由

- `/[lang]/pricing` - 價格方案頁面
- `/[lang]/dashboard/billing` - 帳單管理頁面

### API 路由

- `/api/webhooks/stripe` - Stripe webhook 端點

## 注意事項

1. 確保 webhook 端點可公開訪問（本地開發可使用 ngrok）
2. 生產環境請使用正式的 API 金鑰
3. 定期檢查 Stripe Dashboard 的 webhook 日誌
4. 建議設定 webhook 重試機制