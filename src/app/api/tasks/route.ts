import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  projectId: z.string(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const tasks = await db.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
      aiSummary: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, status, priority, assigneeId, dueDate, projectId } =
    parsed.data;

  const task = await db.task.create({
    data: {
      title,
      description,
      status: status ?? "TODO",
      priority: priority ?? "MEDIUM",
      assigneeId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      projectId,
      creatorId: session.user.id,
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true } },
    },
  });

  await db.activity.create({
    data: {
      action: "TASK_CREATED",
      projectId,
      userId: session.user.id,
      meta: { taskId: task.id, taskTitle: title },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
