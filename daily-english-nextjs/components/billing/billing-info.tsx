"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BillingInfoProps {
  subscriptionPlan: {
    plan: string;
    isPro: boolean;
    isCanceled: boolean;
    stripeCurrentPeriodEnd: number;
  };
}

export function BillingInfo({ subscriptionPlan }: BillingInfoProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>訂閱狀態</CardTitle>
        <CardDescription>
          管理您的訂閱方案和帳單資訊
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">目前方案</span>
          <Badge variant={subscriptionPlan.isPro ? "default" : "secondary"}>
            {subscriptionPlan.plan === "pro" ? "Pro" : "免費"}
          </Badge>
        </div>

        {subscriptionPlan.isPro && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">訂閱狀態</span>
              <span className="text-sm">
                {subscriptionPlan.isCanceled ? (
                  <Badge variant="destructive">已取消</Badge>
                ) : (
                  <Badge variant="default">活躍</Badge>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {subscriptionPlan.isCanceled ? "訂閱結束日期" : "下次扣款日期"}
              </span>
              <span className="text-sm">
                {formatDate(subscriptionPlan.stripeCurrentPeriodEnd)}
              </span>
            </div>
          </>
        )}

        {!subscriptionPlan.isPro && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              升級至 Pro 方案以解鎖所有進階功能，包括無限學習主題、AI 對話練習等。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}