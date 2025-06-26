import { redirect } from "next/navigation";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import BillingPanel from "@/components/billing/billing-panel";
import { auth } from "@/auth";
import { UserSubscriptionPlan } from "@/types/subscription";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";


interface BillingPageProps {
  params: Promise<{
    lang: Locale;
  }>;
}

export default async function BillingPage({ params }: BillingPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let userSubscriptionPlan: UserSubscriptionPlan;
  try {
    userSubscriptionPlan = await getUserSubscriptionPlan(session.user.id as string);
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    // TODO: UGLY
    userSubscriptionPlan = {
      title: "Free",
      isPaid: false,
      isCanceled: false,
      description: "",
      benefits: [],
      limitations: [],
      prices: {
        monthly: 0,
        yearly: 0,
      },
      stripeIds: {
        monthly: null,
        yearly: null,
      },
      interval: "month",
      stripeCurrentPeriodEnd: 0,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
    };
  }

  return (
    <>
      <div className="flex flex-1 gap-8">
        <BillingPanel 
          userSubscriptionPlan={userSubscriptionPlan} 
          dictionary={dictionary}
        />
      </div>
    </>
  );
}
