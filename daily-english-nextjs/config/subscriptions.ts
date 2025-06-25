export const pricingData = [
  {
    plan: "Free",
    tagline: "探索基礎英文學習",
    quota: 5,
    features: [
      "每月 5 個學習主題",
      "基礎單字查詢功能",
      "閱讀簡易文章",
      "基本發音練習",
    ],
  },
  {
    plan: "Pro",
    tagline: "解鎖進階學習功能",
    quota: -1,
    features: [
      "無限學習主題",
      "深度單字解析與例句",
      "AI 對話練習",
      "個人學習進度追蹤",
      "客製化學習計畫",
      "離線學習支援",
      "優先客服支援",
    ],
  },
];

export const storeSubscriptionPlans = [
  {
    id: "pro",
    name: "Pro",
    description: "Pro 訂閱方案",
    features: [
      "無限學習主題",
      "深度單字解析與例句",
      "AI 對話練習",
      "個人學習進度追蹤",
      "客製化學習計畫",
      "離線學習支援",
      "優先客服支援",
    ],
    stripePriceId: "",
    prices: {
      monthly: {
        amount: 15,
        priceIds: {
          test: "",
          production: "",
        },
      },
      yearly: {
        amount: 144,
        priceIds: {
          test: "",
          production: "",
        },
      },
    },
  },
];