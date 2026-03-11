"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  workspaceId: z.string().min(1),
});

export async function createProject(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = schema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    workspaceId: formData.get("workspaceId"),
  });

  if (!parsed.success) redirect("/dashboard?error=invalid");

  const { name, description, workspaceId } = parsed.data;

  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id! } },
  });
  if (!member) redirect("/dashboard?error=forbidden");

  const project = await db.project.create({
    data: { name, description, workspaceId },
  });

  await db.activity.create({
    data: {
      action: "PROJECT_CREATED",
      projectId: project.id,
      userId: session.user.id!,
      meta: { projectName: name },
    },
  });

  redirect(`/workspace/${workspaceId}/projects/${project.id}`);
}
