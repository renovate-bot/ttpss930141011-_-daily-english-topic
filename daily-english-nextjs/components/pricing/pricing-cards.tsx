"use client";

import { useState } from "react";
import Link from "next/link";
import { UserSubscriptionPlan } from "@/types/subscription";
import { useSignInModal } from '@/hooks/use-sign-in-modal'
import { SubscriptionPlan } from "@/types/subscription";
import { pricingData } from "@/config/subscriptions";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BillingFormButton } from "@/components/forms/billing-form-button";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Check, X } from "lucide-react";
import { Dictionary } from "@/types/dictionary";

interface PricingCardsProps {
  userId?: string;
  subscriptionPlan?: UserSubscriptionPlan;
  dict: Dictionary;
}

export function PricingCards({ userId, subscriptionPlan, dict }: PricingCardsProps) {
  console.log(subscriptionPlan, dict)
  const { open: openSignInModal } = useSignInModal()
  const isYearlyDefault =
    !subscriptionPlan?.stripeCustomerId || subscriptionPlan.interval === "year"
      ? true
      : false;
  const [isYearly, setIsYearly] = useState<boolean>(!!isYearlyDefault);

  const toggleBilling = () => {
    setIsYearly(!isYearly);
  };

  const PricingCard = ({ offer }: { offer: SubscriptionPlan }) => {
    return (
      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-3xl border backdrop-blur-lg transition-all duration-300 hover:shadow-xl",
          offer.title.toLocaleLowerCase() === "pro"
            ? "-m-0.5 border-2 border-purple-400 bg-white/15 shadow-lg shadow-purple-500/20"
            : "border-white/20 bg-white/10 hover:bg-white/15",
        )}
        key={offer.title}
      >
        <div className="min-h-[150px] items-start space-y-4 bg-white/5 backdrop-blur-sm p-6 border-b border-white/10">
          <p className="flex font-urban text-sm font-bold uppercase tracking-wider text-gray-300">
            {offer.title}
          </p>

          <div className="flex flex-row">
            <div className="flex items-end">
              <div className="flex text-left text-3xl font-semibold leading-6">
                {isYearly && offer.prices.monthly > 0 ? (
                  <>
                    <span className="mr-2 text-gray-400 line-through">
                      ${offer.prices.monthly}
                    </span>
                    <span>${offer.prices.yearly / 12}</span>
                  </>
                ) : (
                  `$${offer.prices.monthly}`
                )}
              </div>
              <div className="-mb-1 ml-2 text-left text-sm font-medium text-gray-300">
                <div>/month</div>
              </div>
            </div>
          </div>
          {offer.prices.monthly > 0 ? (
            <div className="text-left text-sm text-gray-400">
              {isYearly
                ? `$${offer.prices.yearly} will be charged when annual`
                : "when charged monthly"}
            </div>
          ) : null}
        </div>

        <div className="flex h-full flex-col justify-between gap-16 p-6 text-gray-100">
          <ul className="space-y-2 text-left text-sm font-medium leading-normal">
            {offer.benefits.map((feature) => (
              <li className="flex items-start gap-x-3" key={feature}>
                <Check className="size-5 shrink-0 text-purple-500" />
                <p>{feature}</p>
              </li>
            ))}

            {offer.limitations.length > 0 &&
              offer.limitations.map((feature) => (
                <li
                  className="flex items-start text-gray-400"
                  key={feature}
                >
                  <X className="mr-3 size-5 shrink-0" />
                  <p>{feature}</p>
                </li>
              ))}
          </ul>

          {userId && subscriptionPlan ? (
            offer.title === "Free" ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    className: "rounded-full",
                  }),
                  "w-full",
                )}
              >
                Go to dashboard
              </Link>
            ) : (
              <BillingFormButton
                year={isYearly}
                offer={offer}
                subscriptionPlan={subscriptionPlan}
              />
            )
          ) : (
            <Button
              variant={
                offer.title.toLocaleLowerCase() === "pro"
                  ? "default"
                  : "outline"
              }
              className="rounded-full"
              onClick={openSignInModal}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <MaxWidthWrapper>
      <section className="flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          Choose Your Plan
        </h1>
        <p className="text-lg text-gray-300 mb-8 max-w-2xl">
          Select the perfect plan for your English learning journey
        </p>
        <div className="mb-4 mt-10 flex items-center gap-5">
          <ToggleGroup
            type="single"
            size="sm"
            defaultValue={isYearly ? "yearly" : "monthly"}
            onValueChange={toggleBilling}
            aria-label="toggle-year"
            className="h-9 overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-sm p-1 *:h-7 *:text-gray-300"
          >
            <ToggleGroupItem
              value="yearly"
              className="rounded-full px-5 transition-all data-[state=on]:!bg-purple-500 data-[state=on]:!text-white"
              aria-label="Toggle yearly billing"
            >
              Yearly (-20%)
            </ToggleGroupItem>
            <ToggleGroupItem
              value="monthly"
              className="rounded-full px-5 transition-all data-[state=on]:!bg-purple-500 data-[state=on]:!text-white"
              aria-label="Toggle monthly billing"
            >
              Monthly
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid gap-5 bg-inherit py-5 lg:grid-cols-3">
          {pricingData.map((offer) => (
            <PricingCard offer={offer} key={offer.title} />
          ))}
        </div>

        <p className="mt-3 text-balance text-center text-base text-gray-300">
          Email{" "}
          <a
            className="font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors"
            href="mailto:support@dailyenglish.com"
          >
            support@dailyenglish.com
          </a>{" "}
          for to contact our support team.
          <br />
          <strong>
            You can test the subscriptions and won&apos;t be charged.
          </strong>
        </p>
      </section>
    </MaxWidthWrapper>
  );
}
