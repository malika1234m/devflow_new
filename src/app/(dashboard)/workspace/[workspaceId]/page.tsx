import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { PlanBadge, StatusBadge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspacePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { workspaceId } = await params;

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true, email: true } } },
        orderBy: { joinedAt: "asc" },
      },
      projects: {
        include: {
          tasks: { select: { status: true } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!workspace) notFound();

  const userId = session.user!.id;

  // check access
  const isMember = workspace.members.some((m) => m.userId === userId);
  if (!isMember) redirect("/dashboard");

  const currentMember = workspace.members.find((m) => m.userId === userId)!;
  const canManage = ["OWNER", "ADMIN"].includes(currentMember.role);

  return (
    <div className="p-8">
      {/* Workspace Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-700">
              {workspace.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">/{workspace.slug}</span>
                <PlanBadge plan={workspace.plan} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {workspace.plan === "FREE" && (
            <Link
              href={`/workspace/${workspaceId}/billing`}
              className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              Upgrade to Pro
            </Link>
          )}
          {canManage && (
            <Link
              href={`/workspace/${workspaceId}/projects/new`}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              + New project
            </Link>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard label="Projects" value={workspace.projects.length} />
        <StatCard label="Members" value={workspace.members.length} />
        <StatCard
          label="Open tasks"
          value={workspace.projects.reduce(
            (sum, p) => sum + p.tasks.filter((t) => t.status !== "DONE").length,
            0
          )}
        />
      </div>

      {/* Projects Grid */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Projects</h2>

        {workspace.projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
            <p className="text-gray-500">No projects yet.</p>
            {canManage && (
              <Link
                href={`/workspace/${workspaceId}/projects/new`}
                className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
              >
                Create your first project →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspace.projects.map((project) => {
              const done = project.tasks.filter((t) => t.status === "DONE").length;
              const total = project.tasks.length;
              const progress = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <Link
                  key={project.id}
                  href={`/workspace/${workspaceId}/projects/${project.id}`}
                  className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                      {project.name}
                    </h3>
                    <StatusBadge status={project.status} />
                  </div>

                  {project.description && (
                    <p className="mb-3 text-sm text-gray-500 line-clamp-2">{project.description}</p>
                  )}

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-xs text-gray-500">
                      <span>{done}/{total} tasks done</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-400">Created {formatDate(project.createdAt)}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Members */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Members ({workspace.members.length})</h2>
          {canManage && (
            <Link
              href={`/workspace/${workspaceId}/members`}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Manage members
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {workspace.members.map((m) => (
            <div key={m.id} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
              {m.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.user.image} alt={m.user.name ?? ""} className="h-7 w-7 rounded-full" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {m.user.name?.slice(0, 2).toUpperCase() ?? "?"}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{m.user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{m.role.toLowerCase()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
