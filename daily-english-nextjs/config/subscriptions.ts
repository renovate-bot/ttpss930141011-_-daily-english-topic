import { PlansRow, SubscriptionPlan } from "@/types/subscription";

export const pricingData: SubscriptionPlan[] = [
  {
    title: "Free",
    description: "For Beginners",
    benefits: [
      "Up to 100 monthly posts",
      "Basic analytics and reporting",
      "Access to standard templates",
    ],
    limitations: [
      "No priority access to new features.",
      "Limited customer support",
      "No custom branding",
      "Limited access to business resources.",
    ],
    prices: {
      monthly: 0,
      yearly: 0,
    },
    stripeIds: {
      monthly: null,
      yearly: null,
    },
  },
  {
    title: "Pro",
    description: "Unlock Advanced Features",
    benefits: [
      "Up to 500 monthly posts",
      "Advanced analytics and reporting",
      "Access to business templates",
      "Priority customer support",
      "Exclusive webinars and training.",
    ],
    limitations: [
      "No custom branding",
      "Limited access to business resources.",
    ],
    prices: {
      monthly: 10,
      yearly: 96,
    },
    stripeIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID as string | null,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID as string | null,
    },
  },
];

export const plansColumns = ["free", "pro"] as const;

export const comparePlans: PlansRow[] = [
  {
    feature: "Access to Analytics",
    free: true,
    pro: true,
    tooltip: "All plans include basic analytics for tracking performance.",
  },
  {
    feature: "Custom Branding",
    free: null,
    pro: "500/mo",
    tooltip: "Custom branding is available from the Pro plan onwards.",
  },
  {
    feature: "Priority Support",
    free: null,
    pro: "Email",
  },
  {
    feature: "Advanced Reporting",
    free: null,
    pro: null,
    tooltip:
      "Advanced reporting is available in Business and Enterprise plans.",
  },
  {
    feature: "Dedicated Manager",
    free: null,
    pro: null,
    tooltip: "Enterprise plan includes a dedicated account manager.",
  },
  {
    feature: "API Access",
    free: "Limited",
    pro: "Standard",
  },
  {
    feature: "Monthly Webinars",
    free: false,
    pro: true,
    tooltip: "Pro and higher plans include access to monthly webinars.",
  },
  {
    feature: "Custom Integrations",
    free: false,
    pro: false,
    tooltip:
      "Custom integrations are available in Business and Enterprise plans.",
  },
  {
    feature: "Roles and Permissions",
    free: null,
    pro: "Basic",
    tooltip:
      "User roles and permissions management improves with higher plans.",
  },
  {
    feature: "Onboarding Assistance",
    free: false,
    pro: "Self-service",
    tooltip: "Higher plans include more comprehensive onboarding assistance.",
  },
  // Add more rows as needed
];
