import Stripe from "stripe";

function getStripeInstance() {
  if (!process.env.STRIPE_API_KEY) {
    console.warn("STRIPE_API_KEY is not set. Stripe features will be disabled.");
    return null;
  }
  
  return new Stripe(process.env.STRIPE_API_KEY, {
    apiVersion: "2025-05-28.basil",
    typescript: true,
  });
}

export const stripe = getStripeInstance() as Stripe;