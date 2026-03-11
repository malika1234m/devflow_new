import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateTaskSummary } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await request.json();
  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 });
  }

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      comments: { include: { user: { select: { name: true } } } },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const commentTexts = task.comments.map(
    (c) => `${c.user.name}: ${c.content}`
  );

  const summary = await generateTaskSummary(
    task.title,
    task.description ?? "",
    commentTexts
  );

  // upsert summary
  const aiSummary = await db.aiSummary.upsert({
    where: { taskId },
    create: { taskId, content: summary },
    update: { content: summary },
  });

  return NextResponse.json(aiSummary);
}
