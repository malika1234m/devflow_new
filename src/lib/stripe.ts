import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    features: ["3 projects", "5 team members", "Basic AI summaries"],
    limits: { projects: 3, members: 5 },
  },
  PRO: {
    name: "Pro",
    price: 12,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Unlimited projects",
      "Unlimited members",
      "Advanced AI reports",
      "Priority support",
    ],
    limits: { projects: Infinity, members: Infinity },
  },
} as const;
