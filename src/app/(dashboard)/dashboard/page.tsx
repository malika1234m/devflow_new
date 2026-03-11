import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspaces = await db.workspace.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      _count: { select: { projects: true, members: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const recentTasks = await db.task.findMany({
    where: {
      assigneeId: session.user.id,
      status: { not: "DONE" },
    },
    include: {
      project: { select: { name: true, workspaceId: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-600">Here&apos;s what&apos;s happening across your workspaces.</p>
      </div>

      {/* Workspaces */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Workspaces</h2>
          <Link
            href="/workspace/new"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            New workspace
          </Link>
        </div>

        {workspaces.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
            <p className="text-gray-500">No workspaces yet.</p>
            <Link href="/workspace/new" className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline">
              Create your first workspace →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/workspace/${ws.id}`}
                className="rounded-xl border border-gray-200 bg-white p-6 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm">
                    {ws.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{ws.name}</p>
                    <span className={`text-xs font-medium ${ws.plan === "PRO" ? "text-indigo-600" : "text-gray-500"}`}>
                      {ws.plan}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>{ws._count.projects} projects</span>
                  <span>{ws._count.members} members</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* My Tasks */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">My open tasks</h2>
        {recentTasks.length === 0 ? (
          <p className="text-gray-500 text-sm">No tasks assigned to you.</p>
        ) : (
          <div className="space-y-2">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.project.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  {task.dueDate && (
                    <span className="text-xs text-gray-400">{formatDate(task.dueDate)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    TODO: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    IN_REVIEW: "bg-yellow-100 text-yellow-700",
    DONE: "bg-green-100 text-green-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.TODO}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    LOW: "text-gray-400",
    MEDIUM: "text-yellow-500",
    HIGH: "text-orange-500",
    URGENT: "text-red-500",
  };
  return (
    <span className={`text-xs font-medium ${styles[priority] ?? "text-gray-400"}`}>
      {priority}
    </span>
  );
}
