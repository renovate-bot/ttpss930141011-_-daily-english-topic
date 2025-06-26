import { PlansRow, SubscriptionPlan } from "@/types/subscription";

export const pricingData: SubscriptionPlan[] = [
  {
    title: "Free",
    description: "Start Your Learning Journey",
    benefits: [
      "Quick double-click translation",
      "Bookmark favorite topics",
      "Access to daily topics",
      "Basic word lookup",
    ],
    limitations: [
      "No deep translation analysis",
      "No AI teacher Emma voice calls",
      "Limited to 3 topics per day",
      "No priority support",
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
    description: "Real Human-Like Conversations",
    benefits: [
      "Everything in Free plan",
      "🎙️ REAL voice conversations (not text-to-speech!)",
      "Natural human-like AI teacher Emma",
      "Instant pronunciation feedback",
      "Deep translation with AI analysis",
      "Unlimited topic access",
      "45 minutes daily conversation practice",
      "Personalized learning pace",
      "Grammar corrections in real-time",
      "Progress tracking dashboard",
      "Priority customer support",
    ],
    limitations: [],
    prices: {
      monthly: 9.99,
      yearly: 99.99,
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
    feature: "Voice Quality",
    free: "—",
    pro: "Natural human-like voice",
    tooltip: "Powered by OpenAI Realtime API for authentic conversations, not robotic TTS.",
  },
  {
    feature: "Daily Conversation Time",
    free: "0 minutes",
    pro: "45 minutes",
    tooltip: "Daily minutes of natural, human-like voice conversations with AI teacher Emma.",
  },
  {
    feature: "Quick Translation",
    free: true,
    pro: true,
    tooltip: "Double-click any word for instant translation.",
  },
  {
    feature: "Deep Translation Analysis",
    free: false,
    pro: true,
    tooltip: "AI-powered detailed word analysis with examples, synonyms, and etymology.",
  },
  {
    feature: "AI Teacher Emma Voice Calls",
    free: false,
    pro: "Human-like realtime voice",
    tooltip: "REAL human-like conversations using OpenAI Realtime API - not robotic text-to-speech!",
  },
  {
    feature: "Daily Topics Access",
    free: "3 per day",
    pro: "Unlimited",
    tooltip: "Number of English learning topics you can access daily.",
  },
  {
    feature: "Bookmark Topics",
    free: true,
    pro: true,
    tooltip: "Save your favorite topics for later review.",
  },
  {
    feature: "Grammar Feedback",
    free: false,
    pro: true,
    tooltip: "Get personalized grammar corrections during conversations.",
  },
  {
    feature: "Pronunciation Practice",
    free: "Basic",
    pro: "Advanced with AI feedback",
    tooltip: "Practice pronunciation with real-time AI analysis.",
  },
  {
    feature: "Learning Progress Tracking",
    free: false,
    pro: true,
    tooltip: "Track your vocabulary growth and conversation skills over time.",
  },
  {
    feature: "Personalized Learning Pace",
    free: false,
    pro: true,
    tooltip: "AI adapts to your learning speed and level.",
  },
  {
    feature: "Customer Support",
    free: "Community",
    pro: "Priority Email",
    tooltip: "Get help when you need it.",
  },
];
