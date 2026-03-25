import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ content: z.string().min(1).max(2000) });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const task = await db.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true },
  });
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const comment = await db.comment.create({
    data: {
      content: parsed.data.content,
      taskId,
      userId: session.user.id,
    },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  await db.activity.create({
    data: {
      action: "COMMENT_ADDED",
      projectId: task.projectId,
      userId: session.user.id,
      meta: { taskId, commentId: comment.id },
    },
  });

  return NextResponse.json(comment);
}
