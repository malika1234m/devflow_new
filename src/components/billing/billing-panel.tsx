"use client";

import { useState } from "react";
import { PLANS } from "@/lib/stripe";
import { cn } from "@/lib/utils";

interface BillingPanelProps {
  workspaceId: string;
  currentPlan: "FREE" | "PRO" | "ENTERPRISE";
  subscriptionId: string | null;
}

export function BillingPanel({ workspaceId, currentPlan, subscriptionId }: BillingPanelProps) {
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleUpgrade() {
    setUpgradeLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setUpgradeLoading(false);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Current status banner */}
      <div className={cn(
        "flex items-center justify-between rounded-xl border p-5",
        currentPlan === "PRO"
          ? "border-indigo-200 bg-indigo-50"
          : "border-gray-200 bg-white"
      )}>
        <div>
          <p className="text-sm text-gray-500">Current plan</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              {currentPlan === "PRO" ? "Pro" : "Free"}
            </span>
            {currentPlan === "PRO" && (
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                Active
              </span>
            )}
          </div>
        </div>
        {currentPlan === "PRO" && subscriptionId && (
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 transition-colors"
          >
            {portalLoading ? "Loading…" : "Manage subscription"}
          </button>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Free */}
        <PlanCard
          name="Free"
          price={0}
          features={PLANS.FREE.features as unknown as string[]}
          isCurrent={currentPlan === "FREE"}
          cta={null}
        />

        {/* Pro */}
        <PlanCard
          name="Pro"
          price={PLANS.PRO.price}
          features={PLANS.PRO.features as unknown as string[]}
          isCurrent={currentPlan === "PRO"}
          highlight
          cta={
            currentPlan !== "PRO" ? (
              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className="mt-6 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {upgradeLoading ? "Redirecting…" : "Upgrade to Pro →"}
              </button>
            ) : null
          }
        />
      </div>

      {/* Fine print */}
      <p className="text-xs text-gray-400">
        Payments are processed securely by Stripe. Cancel anytime from the billing portal.
      </p>
    </div>
  );
}

interface PlanCardProps {
  name: string;
  price: number;
  features: string[];
  isCurrent: boolean;
  highlight?: boolean;
  cta: React.ReactNode;
}

function PlanCard({ name, price, features, isCurrent, highlight, cta }: PlanCardProps) {
  return (
    <div className={cn(
      "relative flex flex-col rounded-xl border p-6",
      highlight
        ? "border-indigo-300 bg-white shadow-md shadow-indigo-100"
        : "border-gray-200 bg-white",
      isCurrent && highlight && "ring-2 ring-indigo-500"
    )}>
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
            Most popular
          </span>
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900">{name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">${price}</span>
          <span className="text-sm text-gray-500">/month</span>
        </div>
      </div>

      <ul className="flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
            <CheckIcon />
            {f}
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <div className="mt-6 w-full rounded-lg border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-500">
          Current plan
        </div>
      ) : (
        cta
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
