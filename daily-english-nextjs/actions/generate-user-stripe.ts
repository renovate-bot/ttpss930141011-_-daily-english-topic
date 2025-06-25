"use server";

import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { absoluteUrl } from "@/lib/utils";

export type getUserStripeResponse = {
  url?: string;
  error?: string;
};

const billingUrl = absoluteUrl("/dashboard/billing");

export async function generateUserStripe(
  priceId: string
): Promise<getUserStripeResponse> {
  let redirectUrl: string = "";

  try {
    const session = await auth();
    if (!session?.user || !session?.user.email || !session?.user.id) {
      throw new Error("Unauthorized");
    }

    const subscriptionPlan = await getUserSubscriptionPlan(session.user.id);

    if (subscriptionPlan.isPro && subscriptionPlan.stripeCustomerId) {
      // User on Pro plan - redirect to billing portal
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: subscriptionPlan.stripeCustomerId,
        return_url: billingUrl,
      });

      redirectUrl = stripeSession.url as string;
    } else {
      // User on Free plan - create checkout session
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: billingUrl,
        cancel_url: billingUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        customer_email: session.user.email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId: session.user.id,
        },
      });

      redirectUrl = stripeSession.url as string;
    }
  } catch (error) {
    console.error("Error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "發生錯誤，請稍後再試。" };
  }

  // no revalidatePath because redirect
  return { url: redirectUrl };
}