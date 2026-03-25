"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be 50 chars or less"),
});

export async function createWorkspace(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = schema.safeParse({ name: formData.get("name") });
  if (!parsed.success) redirect("/workspace/new?error=invalid");

  const { name } = parsed.data;
  const baseSlug = slugify(name);

  let slug = baseSlug;
  let counter = 1;
  while (await db.workspace.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const workspace = await db.workspace.create({
    data: {
      name,
      slug,
      members: {
        create: { userId: session.user.id, role: "OWNER" },
      },
    },
  });

  redirect(`/workspace/${workspace.id}`);
}

// ─── Member management ────────────────────────────────────────────────────────

async function getCallerRole(workspaceId: string, userId: string) {
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  return member;
}

export async function inviteMember(
  workspaceId: string,
  email: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const caller = await getCallerRole(workspaceId, session.user.id);
  if (!caller || !["OWNER", "ADMIN"].includes(caller.role)) {
    return { error: "Only owners and admins can invite members" };
  }

  const invitee = await db.user.findUnique({ where: { email } });
  if (!invitee) {
    return { error: "No DevFlow account found with that email address" };
  }

  const existing = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: invitee.id } },
  });
  if (existing) {
    return { error: "This user is already a member" };
  }

  await db.workspaceMember.create({
    data: { workspaceId, userId: invitee.id, role: "MEMBER" },
  });

  revalidatePath(`/workspace/${workspaceId}/members`);
  return {};
}

export async function updateMemberRole(
  memberId: string,
  role: "ADMIN" | "MEMBER",
  workspaceId: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const caller = await getCallerRole(workspaceId, session.user.id);
  if (!caller || !["OWNER", "ADMIN"].includes(caller.role)) {
    return { error: "Insufficient permissions" };
  }

  const target = await db.workspaceMember.findUnique({ where: { id: memberId } });
  if (!target) return { error: "Member not found" };
  if (target.role === "OWNER") return { error: "Cannot change the owner's role" };
  if (caller.role === "ADMIN" && role === "ADMIN" && target.role !== "ADMIN") {
    return { error: "Admins cannot promote other members to admin" };
  }

  await db.workspaceMember.update({ where: { id: memberId }, data: { role } });

  revalidatePath(`/workspace/${workspaceId}/members`);
  return {};
}

export async function removeMember(
  memberId: string,
  workspaceId: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const caller = await getCallerRole(workspaceId, session.user.id);
  if (!caller || !["OWNER", "ADMIN"].includes(caller.role)) {
    return { error: "Insufficient permissions" };
  }

  const target = await db.workspaceMember.findUnique({ where: { id: memberId } });
  if (!target) return { error: "Member not found" };
  if (target.role === "OWNER") return { error: "Cannot remove the workspace owner" };
  if (target.userId === session.user.id) return { error: "You cannot remove yourself" };
  if (caller.role === "ADMIN" && target.role === "ADMIN") {
    return { error: "Admins cannot remove other admins" };
  }

  await db.workspaceMember.delete({ where: { id: memberId } });

  revalidatePath(`/workspace/${workspaceId}/members`);
  return {};
}
