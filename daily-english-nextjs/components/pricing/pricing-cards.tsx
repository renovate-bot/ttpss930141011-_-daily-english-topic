"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { generateUserStripe } from "@/actions/generate-user-stripe";
import { useSignInModal } from "@/hooks/use-sign-in-modal";
import type { Dictionary } from "@/types/dictionary";

interface PricingCardsProps {
  userId?: string;
  subscriptionPlan?: {
    plan: string;
    isPro: boolean;
    isCanceled: boolean;
  };
  dict: Dictionary;
}

export function PricingCards({ userId, subscriptionPlan, dict }: PricingCardsProps) {
  const router = useRouter();
  const signInModal = useSignInModal();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (priceId: string) => {
    if (!userId) {
      signInModal.open();
      return;
    }

    setIsLoading(true);
    try {
      const response = await generateUserStripe(priceId);
      if (response.url) {
        router.push(response.url);
      } else if (response.error) {
        console.error(response.error);
        // 可以加入 toast 提示錯誤
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-8">
      <div className="flex justify-center mb-8">
        <div className="relative flex rounded-full bg-muted p-1">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={cn(
              "relative rounded-full px-6 py-2 text-sm font-medium transition-all",
              billingPeriod === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {dict.pricing.billingMonthly}
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={cn(
              "relative rounded-full px-6 py-2 text-sm font-medium transition-all",
              billingPeriod === "yearly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {dict.pricing.billingYearly}
            <Badge className="ml-2 bg-green-500/10 text-green-500 hover:bg-green-500/10">
              {dict.pricing.save20}
            </Badge>
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 max-w-4xl mx-auto">
        {[dict.pricing.planFree, dict.pricing.planPro].map((plan, index) => (
          <Card
            key={index}
            className={cn(
              "relative rounded-2xl p-8 shadow-sm transition-all hover:shadow-md",
              index === 1 && "border-2 border-primary shadow-lg"
            )}
          >
            {index === 1 && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                {dict.pricing.mostPopular}
              </Badge>
            )}
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="mt-2 text-muted-foreground">{plan.tagline}</p>
              
              <div className="mt-6">
                {index === 0 ? (
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="ml-2 text-muted-foreground">/{dict.pricing.perMonth}</span>
                  </div>
                ) : (
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold">
                      {billingPeriod === "monthly" ? plan.price : (plan as any).yearlyPrice || plan.price}
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      /{billingPeriod === "monthly" ? dict.pricing.perMonth : dict.pricing.perYear}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <ul className="mb-8 space-y-4">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <svg
                    className="h-5 w-5 shrink-0 text-primary"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {index === 0 ? (
              <Button
                variant="outline"
                className="w-full"
                disabled={subscriptionPlan?.plan === "free"}
              >
                {subscriptionPlan?.plan === "free" ? dict.common.currentPlan : plan.cta}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => {
                  const priceId = billingPeriod === "monthly" 
                    ? process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID!
                    : process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID!;
                  handleSubscribe(priceId);
                }}
                disabled={isLoading || subscriptionPlan?.plan === "pro"}
              >
                {subscriptionPlan?.plan === "pro" 
                  ? dict.common.currentPlan 
                  : isLoading 
                  ? dict.common.loading 
                  : plan.cta}
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}