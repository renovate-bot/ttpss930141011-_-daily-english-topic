"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Dictionary } from "@/types/dictionary";

interface BillingInfoProps {
  subscriptionPlan: {
    plan: string;
    isPro: boolean;
    isCanceled: boolean;
    stripeCurrentPeriodEnd: number;
  };
  dict: Dictionary;
}

export function BillingInfo({ subscriptionPlan, dict }: BillingInfoProps) {
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
        <CardTitle>{dict.billing.subscription.title}</CardTitle>
        <CardDescription>
          {dict.billing.subscription.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{dict.billing.subscription.currentPlan}</span>
          <Badge variant={subscriptionPlan.isPro ? "default" : "secondary"}>
            {subscriptionPlan.plan === "pro" ? dict.pricing.planPro.name : dict.pricing.planFree.name}
          </Badge>
        </div>

        {subscriptionPlan.isPro && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{dict.billing.subscription.status}</span>
              <span className="text-sm">
                {subscriptionPlan.isCanceled ? (
                  <Badge variant="destructive">{dict.billing.subscription.canceled}</Badge>
                ) : (
                  <Badge variant="default">{dict.billing.subscription.active}</Badge>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {subscriptionPlan.isCanceled ? dict.billing.subscription.endsOn : dict.billing.subscription.nextBilling}
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
              {dict.billing.subscription.upgradePrompt}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}