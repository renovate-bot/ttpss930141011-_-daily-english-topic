import { headers } from "next/headers";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (error) {
    return new Response(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Retrieve the subscription details from Stripe.
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    const item = subscription.items.data[0];

    // Update the user stripe into in our database.
    // Since this is the initial subscription, we need to update
    // the subscription id and customer id.
    await prisma.user.update({
      where: {
        id: session?.metadata?.userId,
      },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: item.price.id,
        stripeCurrentPeriodEnd: new Date(item.current_period_end * 1000),
      },
    });
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;

    if (invoice.billing_reason !== "subscription_create") {
      if (invoice.parent?.type !== 'subscription_details') {
        console.warn('Ignoring invoice without subscription parent', invoice.id);
        return new Response(null, { status: 200 });
      }
      const subscriptionId = invoice.parent.subscription_details?.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const item = subscription.items.data[0];
      if (!item.current_period_end) {
        throw new Error('Missing item.current_period_end');
      }

      await prisma.user.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripePriceId: item.price.id,
          stripeCurrentPeriodEnd: new Date(item.current_period_end * 1000),
        },
      });
    }
  }

  return new Response(null, { status: 200 });
}
