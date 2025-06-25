import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { UserRole } from "@prisma/client";

export async function getUserSubscriptionPlan(userId: string) {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user is on a pro plan.
  const isPro =
    user.stripePriceId &&
    user.stripeCurrentPeriodEnd &&
    user.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now();

  const plan = isPro ? "pro" : "free";

  // Check if user has canceled subscription
  let isCanceled = false;
  if (user.stripeSubscriptionId && isPro) {
    const stripePlan = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );
    isCanceled = stripePlan.cancel_at_period_end;
  }

  return {
    ...user,
    stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd?.getTime() ?? 0,
    isPro,
    isAdmin: user.role === UserRole.ADMIN,
    plan,
    isCanceled,
  };
}

export async function checkUserSubscription(userId?: string | null) {
  if (!userId) {
    return { isPro: false, isAdmin: false };
  }

  const userSubscriptionPlan = await getUserSubscriptionPlan(userId);

  return {
    isPro: userSubscriptionPlan.isPro,
    isAdmin: userSubscriptionPlan.isAdmin,
  };
}