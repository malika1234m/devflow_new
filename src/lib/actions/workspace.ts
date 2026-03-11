"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { redirect } from "next/navigation";
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
