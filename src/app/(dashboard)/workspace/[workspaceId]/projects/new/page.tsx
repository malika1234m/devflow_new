import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { createProject } from "@/lib/actions/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function NewProjectPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { workspaceId } = await params;

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: true,
      _count: { select: { projects: true } },
    },
  });

  if (!workspace) notFound();

  const member = workspace.members.find((m) => m.userId === session.user!.id);
  if (!member || !["OWNER", "ADMIN"].includes(member.role)) redirect(`/workspace/${workspaceId}`);

  // Free plan limit check
  const isAtLimit = workspace.plan === "FREE" && workspace._count.projects >= 3;

  return (
    <div className="flex min-h-full items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href={`/workspace/${workspaceId}`}
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to {workspace.name}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">New project</h1>
          <p className="mt-1 text-gray-500">
            Projects contain tasks. Each project has its own kanban board.
          </p>
        </div>

        {isAtLimit ? (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-center">
            <p className="font-semibold text-yellow-800">Free plan limit reached</p>
            <p className="mt-1 text-sm text-yellow-700">
              You&apos;re using 3/3 projects on the Free plan.
            </p>
            <Link
              href={`/workspace/${workspaceId}/billing`}
              className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Upgrade to Pro — $12/mo
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <form action={createProject} className="space-y-5">
              <input type="hidden" name="workspaceId" value={workspaceId} />

              <Input
                label="Project name"
                name="name"
                placeholder="Website redesign, Q2 roadmap, API v2..."
                required
                autoFocus
              />

              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="What is this project about?"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">
                  Create project
                </Button>
                <Link href={`/workspace/${workspaceId}`}>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
