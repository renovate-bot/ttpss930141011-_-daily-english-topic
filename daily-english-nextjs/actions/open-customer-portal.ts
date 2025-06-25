"use server";

import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { absoluteUrl } from "@/lib/utils";

export async function openCustomerPortal() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const subscriptionPlan = await getUserSubscriptionPlan(session.user.id);

    if (!subscriptionPlan.isPro || !subscriptionPlan.stripeCustomerId) {
      throw new Error("您需要先訂閱 Pro 方案");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscriptionPlan.stripeCustomerId,
      return_url: absoluteUrl("/dashboard/billing"),
    });

    return { url: portalSession.url };
  } catch (error) {
    console.error("Error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "無法開啟客戶入口網站" };
  }
}