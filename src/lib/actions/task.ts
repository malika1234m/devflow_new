"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  projectId: z.string().min(1),
  workspaceId: z.string().min(1),
});

export async function createTask(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priority: formData.get("priority") || "MEDIUM",
    status: formData.get("status") || "TODO",
    dueDate: formData.get("dueDate") || undefined,
    assigneeId: formData.get("assigneeId") || undefined,
    projectId: formData.get("projectId"),
    workspaceId: formData.get("workspaceId"),
  });

  if (!parsed.success) return;

  const { title, description, priority, status, dueDate, assigneeId, projectId, workspaceId } = parsed.data;

  const task = await db.task.create({
    data: {
      title,
      description,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assigneeId: assigneeId || undefined,
      projectId,
      creatorId: session.user.id!,
    },
  });

  await db.activity.create({
    data: {
      action: "TASK_CREATED",
      projectId,
      userId: session.user.id!,
      meta: { taskId: task.id, taskTitle: title },
    },
  });

  revalidatePath(`/workspace/${workspaceId}/projects/${projectId}`);
}

export async function updateTaskStatus(
  taskId: string,
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",
  projectId: string,
  workspaceId: string
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.task.update({
    where: { id: taskId },
    data: { status },
  });

  if (status === "DONE") {
    await db.activity.create({
      data: {
        action: "TASK_COMPLETED",
        projectId,
        userId: session.user.id!,
        meta: { taskId },
      },
    });
  }

  revalidatePath(`/workspace/${workspaceId}/projects/${projectId}`);
}

export async function deleteTask(
  taskId: string,
  projectId: string,
  workspaceId: string
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.task.delete({ where: { id: taskId } });

  revalidatePath(`/workspace/${workspaceId}/projects/${projectId}`);
}
