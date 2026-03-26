import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { MembersPanel } from "@/components/workspace/members-panel";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function MembersPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { workspaceId } = await params;

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!workspace) notFound();

  const currentMember = workspace.members.find((m) => m.userId === session.user!.id);
  if (!currentMember) redirect("/dashboard");
  if (!["OWNER", "ADMIN"].includes(currentMember.role)) {
    redirect(`/workspace/${workspaceId}`);
  }

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
        <span className="font-medium text-gray-900">Members</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Team members</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage who has access to <span className="font-medium">{workspace.name}</span> and their roles.
        </p>
      </div>

      <MembersPanel
        workspaceId={workspaceId}
        initialMembers={workspace.members}
        currentUserId={session.user!.id}
        currentUserRole={currentMember.role as "OWNER" | "ADMIN" | "MEMBER"}
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
