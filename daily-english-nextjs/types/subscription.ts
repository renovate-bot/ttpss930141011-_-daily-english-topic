import { User } from "@prisma/client";

export const plansColumns = ["free", "pro"] as const;

// subcriptions
export type SubscriptionPlan = {
    title: string;
    description: string;
    benefits: string[];
    limitations: string[];
    prices: {
        monthly: number;
        yearly: number;
    };
    stripeIds: {
        monthly: string | null;
        yearly: string | null;
    };
};

export type UserSubscriptionPlan = SubscriptionPlan &
    Pick<User, "stripeCustomerId" | "stripeSubscriptionId" | "stripePriceId"> & {
        stripeCurrentPeriodEnd: number;
        isPaid: boolean;
        interval: "month" | "year" | null;
        isCanceled?: boolean;
    };

// compare plans
export type ColumnType = string | boolean | null;
export type PlansRow = { feature: string; tooltip?: string } & {
    [key in (typeof plansColumns)[number]]: ColumnType;
};
