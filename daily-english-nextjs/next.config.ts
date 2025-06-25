import {withSentryConfig} from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 配置選項
  reactStrictMode: true,
  images: {
    domains: ['api.dictionaryapi.dev', 'lh3.googleusercontent.com'],
  },
  eslint: {
    // 在 production build 時跳過 ESLint
    // 注意：這樣做意味著你需要在 CI/CD 或其他地方執行 lint 檢查
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 跳過 TypeScript 檢查，因為 @types 套件在 devDependencies
    ignoreBuildErrors: true,
  },
  // 啟用 standalone 輸出模式以優化 Docker 鏡像大小
  output: 'standalone',
  // 優化打包
  experimental: {
    // 減少服務器端運行時大小
    serverMinification: true,
  },
};

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

org: "daily-english-topic",
project: "javascript-nextjs",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
tunnelRoute: "/monitoring",

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});