import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ workspaceId: string; projectId: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { workspaceId, projectId } = await params;

  const [project, workspace] = await Promise.all([
    db.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, image: true } },
            _count: { select: { comments: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    db.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    }),
  ]);

  if (!project || !workspace) notFound();

  // verify access
  const isMember = workspace.members.some((m) => m.userId === session.user!.id);
  if (!isMember) redirect("/dashboard");

  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = project.tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-5">
        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span>/</span>
          <Link href={`/workspace/${workspaceId}`} className="hover:text-gray-700">
            {workspace.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{project.name}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            {project.description && (
              <p className="mt-1 text-sm text-gray-500">{project.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>Created {formatDate(project.createdAt)}</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-4 flex items-center gap-6">
          <StatPill label="Total" value={totalTasks} />
          <StatPill label="In Progress" value={inProgressTasks} color="text-blue-600" />
          <StatPill label="Done" value={doneTasks} color="text-green-600" />

          {/* Progress bar */}
          <div className="flex flex-1 items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <KanbanBoard
          initialTasks={project.tasks.map((t) => ({
            ...t,
            dueDate: t.dueDate,
          }))}
          projectId={projectId}
          workspaceId={workspaceId}
          members={workspace.members}
        />
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  color = "text-gray-900",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}
