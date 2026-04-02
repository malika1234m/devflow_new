import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { BillingPanel } from "@/components/billing/billing-panel";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function BillingPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { workspaceId } = await params;

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: { where: { userId: session.user.id } },
    },
  });

  if (!workspace) notFound();

  const member = workspace.members[0];
  if (!member) redirect("/dashboard");

  // Only owners manage billing
  if (member.role !== "OWNER") redirect(`/workspace/${workspaceId}`);

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <ChevronIcon />
        <Link href={`/workspace/${workspaceId}`} className="hover:text-gray-700">
          {workspace.name}
        </Link>
        <ChevronIcon />
        <span className="font-medium text-gray-900">Billing</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your subscription for <span className="font-medium">{workspace.name}</span>.
        </p>
      </div>

      <BillingPanel
        workspaceId={workspaceId}
        currentPlan={workspace.plan}
        subscriptionId={workspace.stripeSubscriptionId}
      />
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
