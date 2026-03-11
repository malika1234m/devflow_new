import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateTaskSummary(
  taskTitle: string,
  taskDescription: string,
  comments: string[]
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `You are a project management assistant. Summarize the following task concisely in 2-3 sentences, highlighting key progress, blockers, and next steps.

Task: ${taskTitle}
Description: ${taskDescription || "No description provided"}
${comments.length > 0 ? `Comments:\n${comments.join("\n")}` : "No comments yet"}

Provide a concise, actionable summary.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return content.text;
  }
  return "Unable to generate summary.";
}

export async function generateProjectReport(
  projectName: string,
  tasks: { title: string; status: string; priority: string }[]
): Promise<string> {
  const taskList = tasks
    .map((t) => `- [${t.status}] ${t.title} (${t.priority} priority)`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `Generate a brief project status report for "${projectName}".

Tasks:
${taskList}

Include: overall progress, what's done, what's in progress, blockers, and recommendations. Be concise and professional.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return content.text;
  }
  return "Unable to generate report.";
}
