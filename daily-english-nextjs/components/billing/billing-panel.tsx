"use client";

import { useState } from "react";
import { generateUserStripe } from "@/actions/generate-user-stripe";
import { openCustomerPortal } from "@/actions/open-customer-portal";

import { UserSubscriptionPlan } from "@/types/subscription";
import { pricingData } from "@/config/subscriptions";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Loader2 } from "lucide-react";

type PLANS = "free" | "pro";
type INTERVALS = "month" | "year";
type CURRENCIES = "CAD";

// Constants from the old elitin app
const PLANS = {
  FREE: "free",
  PRO: "pro",
} as const;

const INTERVALS = {
  MONTH: "month",
  YEAR: "year",
} as const;

const CURRENCIES = {
  CAD: "CAD",
} as const;

interface BillingPanelProps {
  userSubscriptionPlan: UserSubscriptionPlan;
}

export default function BillingPanel({
  userSubscriptionPlan,
}: BillingPanelProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPlanId, setSelectedPlanId] = useState<PLANS>(
    (userSubscriptionPlan?.title?.toLowerCase() as PLANS) || PLANS.FREE,
  );

  const [selectedPlanInterval, setSelectedPlanInterval] = useState<INTERVALS>(
    INTERVALS.MONTH,
  );

  // Default to USD
  const currency = CURRENCIES.CAD;

  // Find the plan in the pricing data
  // const currentPlan = pricingData.find(
  //   (plan) => plan.title.toLowerCase() === userSubscriptionPlan?.title?.toLowerCase()
  // );

  const handleUpgrade = async () => {
    setIsLoading(true);

    try {
      const selectedPlan = pricingData.find(
        (plan) => plan.title.toLowerCase() === selectedPlanId,
      );

      if (!selectedPlan) {
        throw new Error("Selected plan not found");
      }

      const priceId =
        selectedPlanInterval === INTERVALS.MONTH
          ? selectedPlan.stripeIds.monthly
          : selectedPlan.stripeIds.yearly;

      if (!priceId) {
        throw new Error("Price ID not found");
      }

      await generateUserStripe(priceId);
    } catch (error) {
      console.error("Error upgrading subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);

    try {
      if (!userSubscriptionPlan.stripeCustomerId) {
        throw new Error("No customer ID found");
      }

      await openCustomerPortal(userSubscriptionPlan.stripeCustomerId);
    } catch (error) {
      console.error("Error opening customer portal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <Alert className="!pl-14">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>This is a demo app.</AlertTitle>
        <AlertDescription className="text-balance">
          This is a demo app that uses Stripe test environment. You can find a
          list of test card numbers on the{" "}
          <a
            href="https://stripe.com/docs/testing#cards"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-8"
          >
            Stripe docs
          </a>
          .
        </AlertDescription>
      </Alert>

      {/* Plans */}
      <div className="flex w-full flex-col items-start rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-2 p-6">
          <h2 className="text-xl font-medium text-primary">Plan</h2>
          <p className="flex items-start gap-1 text-sm font-normal text-primary/60">
            You are currently on the{" "}
            <span className="flex h-[18px] items-center rounded-md bg-primary/10 px-1.5 text-sm font-medium text-primary/80">
              {userSubscriptionPlan.title || "Starter"}
            </span>
            plan.
          </p>
        </div>

        {(!userSubscriptionPlan.isPaid ||
          userSubscriptionPlan.title?.toLowerCase() === "starter") && (
            <div className="flex w-full flex-col items-center justify-evenly gap-2 border-border p-6 pt-0">
              {pricingData.map((plan) => (
                <div
                  key={plan.title}
                  tabIndex={0}
                  role="button"
                  className={cn(
                    "flex w-full select-none items-center rounded-md border border-border hover:border-primary/60",
                    selectedPlanId === plan.title.toLowerCase() &&
                    "border-primary/60",
                  )}
                  onClick={() =>
                    setSelectedPlanId(plan.title.toLowerCase() as PLANS)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      setSelectedPlanId(plan.title.toLowerCase() as PLANS);
                  }}
                >
                  <div className="flex w-full flex-col items-start p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-primary">
                        {plan.title}
                      </span>
                      {plan.title.toLowerCase() !== "starter" && (
                        <span className="flex items-center rounded-md bg-primary/10 px-1.5 text-sm font-medium text-primary/80">
                          {currency === CURRENCIES.CAD ? "$" : "€"}{" "}
                          {selectedPlanInterval === INTERVALS.MONTH
                            ? plan.prices.monthly / 100
                            : plan.prices.yearly / 100}{" "}
                          /{" "}
                          {selectedPlanInterval === INTERVALS.MONTH
                            ? "month"
                            : "year"}
                        </span>
                      )}
                    </div>
                    <p className="text-start text-sm font-normal text-primary/60">
                      {plan.description}
                    </p>
                  </div>

                  {/* Billing Switch */}
                  {plan.title.toLowerCase() !== "starter" && (
                    <div className="flex items-center gap-2 px-4">
                      <label
                        htmlFor="interval-switch"
                        className="text-start text-sm text-primary/60"
                      >
                        {selectedPlanInterval === INTERVALS.MONTH
                          ? "Monthly"
                          : "Yearly"}
                      </label>
                      <Switch
                        id="interval-switch"
                        checked={selectedPlanInterval === INTERVALS.YEAR}
                        onCheckedChange={() =>
                          setSelectedPlanInterval((prev) =>
                            prev === INTERVALS.MONTH
                              ? INTERVALS.YEAR
                              : INTERVALS.MONTH,
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        {userSubscriptionPlan.isPaid &&
          userSubscriptionPlan.title?.toLowerCase() !== "starter" && (
            <div className="flex w-full flex-col items-center justify-evenly gap-2 border-border p-6 pt-0">
              <div className="flex w-full items-center overflow-hidden rounded-md border border-primary/60">
                <div className="flex w-full flex-col items-start p-4">
                  <div className="flex items-end gap-2">
                    <span className="text-base font-medium text-primary">
                      {userSubscriptionPlan.title}
                    </span>
                    <p className="flex items-start gap-1 text-sm font-normal text-primary/60">
                      {userSubscriptionPlan.isCanceled ? (
                        <span className="flex h-[18px] items-center text-sm font-medium text-red-500">
                          Expires
                        </span>
                      ) : (
                        <span className="flex h-[18px] items-center text-sm font-medium text-green-500">
                          Renews
                        </span>
                      )}
                      on:{" "}
                      {userSubscriptionPlan.stripeCurrentPeriodEnd
                        ? new Date(
                          userSubscriptionPlan.stripeCurrentPeriodEnd,
                        ).toLocaleDateString("en-US")
                        : "N/A"}
                      .
                    </p>
                  </div>
                  <p className="text-start text-sm font-normal text-primary/60">
                    {
                      pricingData.find((p) => p.title.toLowerCase() === "pro")
                        ?.description
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

        <div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-t border-border bg-secondary px-6 py-3 dark:bg-card">
          <p className="text-sm font-normal text-primary/60">
            You will not be charged for testing the subscription upgrade.
          </p>
          {(!userSubscriptionPlan.isPaid ||
            userSubscriptionPlan.title?.toLowerCase() === "starter") && (
              <Button
                onClick={handleUpgrade}
                size="sm"
                disabled={selectedPlanId === PLANS.FREE || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Upgrade to Pro
              </Button>
            )}
        </div>
      </div>

      {/* Manage Subscription */}
      <div className="flex w-full flex-col items-start rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-2 p-6">
          <h2 className="text-xl font-medium text-primary">
            Manage Subscription
          </h2>
          <p className="flex items-start gap-1 text-sm font-normal text-primary/60">
            Update your payment method, billing address, and more.
          </p>
        </div>

        <div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-t border-border bg-secondary px-6 py-3 dark:bg-card">
          <p className="text-sm font-normal text-primary/60">
            You will be redirected to the Stripe Customer Portal.
          </p>
          <Button
            onClick={handleManageSubscription}
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Manage
          </Button>
        </div>
      </div>
    </div>
  );
}
