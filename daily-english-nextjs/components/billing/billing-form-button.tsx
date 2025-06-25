"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generateUserStripe } from "@/actions/generate-user-stripe";
import { openCustomerPortal } from "@/actions/open-customer-portal";

interface BillingFormButtonProps {
  subscriptionPlan: {
    isPro: boolean;
    isCanceled: boolean;
    stripeCustomerId?: string | null;
  };
}

export function BillingFormButton({ subscriptionPlan }: BillingFormButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    
    try {
      if (subscriptionPlan.isPro && subscriptionPlan.stripeCustomerId) {
        // 開啟客戶入口網站
        const response = await openCustomerPortal();
        if (response.url) {
          router.push(response.url);
        } else if (response.error) {
          console.error(response.error);
          // 可以加入 toast 提示錯誤
        }
      } else {
        // 導向升級頁面
        router.push("/pricing");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      size="lg"
      className="w-full sm:w-auto"
    >
      {isLoading
        ? "處理中..."
        : subscriptionPlan.isPro
        ? "管理訂閱"
        : "升級至 Pro"}
    </Button>
  );
}