"use client";

import { useState, useEffect, useTransition } from "react";
import { TaskCardData } from "./task-card";
import { deleteTask } from "@/lib/actions/task";

type Status = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface FullTask extends Omit<TaskCardData, "_count"> {
  createdAt: string;
  updatedAt: string;
  projectId: string;
  creator: { id: string; name: string | null; image: string | null } | null;
  comments: Comment[];
  aiSummary: { content: string } | null;
  _count: { comments: number };
}

interface Member {
  user: { id: string; name: string | null; image: string | null };
}

interface TaskDetailDrawerProps {
  taskId: string;
  initialTask: TaskCardData;
  projectId: string;
  workspaceId: string;
  members: Member[];
  onClose: () => void;
  onTaskUpdate: (updates: Partial<TaskCardData> & { id: string }) => void;
  onTaskDelete: (taskId: string) => void;
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export function TaskDetailDrawer({
  taskId,
  initialTask,
  projectId,
  workspaceId,
  members,
  onClose,
  onTaskUpdate,
  onTaskDelete,
}: TaskDetailDrawerProps) {
  const [task, setTask] = useState<FullTask | null>(null);
  const [loading, setLoading] = useState(true);

  // Inline edit states
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [titleDraft, setTitleDraft] = useState(initialTask.title);
  const [descDraft, setDescDraft] = useState(initialTask.description ?? "");
  const [saving, setSaving] = useState<string | null>(null);

  // Comment state
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [, startDeleteTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/tasks/${taskId}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setTask(data);
        setTitleDraft(data.title);
        setDescDraft(data.description ?? "");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [taskId]);

  async function patchField(field: string, value: unknown) {
    setSaving(field);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTask((prev) => prev ? { ...prev, ...updated } : null);
        onTaskUpdate({
          id: taskId,
          title: updated.title,
          description: updated.description,
          status: updated.status,
          priority: updated.priority,
          dueDate: updated.dueDate ? new Date(updated.dueDate) : null,
          assignee: updated.assignee,
        });
      }
    } finally {
      setSaving(null);
    }
  }

  async function saveTitle() {
    const trimmed = titleDraft.trim();
    setEditingTitle(false);
    if (!trimmed || trimmed === task?.title) return;
    await patchField("title", trimmed);
  }

  async function saveDesc() {
    setEditingDesc(false);
    if (descDraft === (task?.description ?? "")) return;
    await patchField("description", descDraft || null);
  }

  async function submitComment() {
    const content = commentText.trim();
    if (!content) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const comment: Comment = await res.json();
        setTask((prev) =>
          prev
            ? { ...prev, comments: [...prev.comments, comment], _count: { comments: prev._count.comments + 1 } }
            : null
        );
        onTaskUpdate({ id: taskId, _count: { comments: (task?._count.comments ?? 0) + 1 } });
        setCommentText("");
      }
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleAiSummarize() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      if (res.ok) {
        const aiSummary = await res.json();
        setTask((prev) => prev ? { ...prev, aiSummary } : null);
      }
    } finally {
      setAiLoading(false);
    }
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteTask(taskId, projectId, workspaceId);
      onTaskDelete(taskId);
      onClose();
    });
  }

  const display = task ?? {
    ...initialTask,
    creator: null,
    comments: [],
    aiSummary: null,
    createdAt: "",
    updatedAt: "",
    projectId,
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <span className="text-xs text-indigo-500 animate-pulse h-4">
            {saving ? "Saving…" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-lg px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <XIcon />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                {editingTitle ? (
                  <input
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveTitle();
                      if (e.key === "Escape") { setTitleDraft(display.title); setEditingTitle(false); }
                    }}
                    className="w-full rounded-lg border border-indigo-300 px-3 py-2 text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                ) : (
                  <h3
                    onClick={() => { setEditingTitle(true); setTitleDraft(display.title); }}
                    className="text-lg font-semibold text-gray-900 cursor-pointer rounded-lg px-1 py-0.5 -mx-1 hover:bg-gray-50 transition-colors"
                    title="Click to edit"
                  >
                    {display.title}
                  </h3>
                )}
              </div>

              {/* Fields grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    value={display.status}
                    onChange={(e) => patchField("status", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={display.priority}
                    onChange={(e) => patchField("priority", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {PRIORITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
                    Assignee
                  </label>
                  <select
                    value={display.assignee?.id ?? ""}
                    onChange={(e) => patchField("assigneeId", e.target.value || null)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={display.dueDate ? new Date(display.dueDate).toISOString().split("T")[0] : ""}
                    onChange={(e) => patchField("dueDate", e.target.value || null)}
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
                  Description
                </label>
                {editingDesc ? (
                  <textarea
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    onBlur={saveDesc}
                    onKeyDown={(e) => { if (e.key === "Escape") { setDescDraft(display.description ?? ""); setEditingDesc(false); } }}
                    rows={4}
                    className="w-full rounded-lg border border-indigo-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Add a description…"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => { setEditingDesc(true); setDescDraft(display.description ?? ""); }}
                    className="min-h-[64px] cursor-pointer rounded-lg border border-transparent px-3 py-2 text-sm text-gray-600 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                    title="Click to edit"
                  >
                    {display.description || (
                      <span className="text-gray-400 italic">Add a description…</span>
                    )}
                  </div>
                )}
              </div>

              {/* AI Summary */}
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <SparklesIcon />
                    <span className="text-sm font-semibold text-indigo-700">AI Summary</span>
                  </div>
                  <button
                    onClick={handleAiSummarize}
                    disabled={aiLoading}
                    className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                  >
                    {aiLoading ? "Generating…" : display.aiSummary ? "Regenerate" : "Summarize"}
                  </button>
                </div>
                {display.aiSummary ? (
                  <p className="text-sm leading-relaxed text-indigo-700">{display.aiSummary.content}</p>
                ) : (
                  <p className="text-sm italic text-indigo-400">
                    Click &quot;Summarize&quot; to get an AI-generated status update based on the task and its comments.
                  </p>
                )}
              </div>

              {/* Comments */}
              <div>
                <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Comments ({task?.comments.length ?? 0})
                </h4>

                <div className="mb-4 space-y-3">
                  {task?.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        {comment.user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={comment.user.image} alt="" className="h-7 w-7 rounded-full" />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                            {comment.user.name?.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 rounded-lg bg-gray-50 px-3 py-2">
                        <div className="mb-1 flex items-baseline gap-2">
                          <span className="text-xs font-semibold text-gray-800">{comment.user.name}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {task?.comments.length === 0 && (
                    <p className="text-sm italic text-gray-400">No comments yet. Be the first to comment.</p>
                  )}
                </div>

                {/* Add comment input */}
                <div className="flex gap-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitComment();
                    }}
                    placeholder="Add a comment… (⌘↵ to submit)"
                    rows={2}
                    className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    onClick={submitComment}
                    disabled={!commentText.trim() || submittingComment}
                    className="self-end rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {submittingComment ? "…" : "Post"}
                  </button>
                </div>
              </div>

              {/* Meta */}
              {task?.creator && (
                <div className="border-t border-gray-100 pt-3 text-xs text-gray-400">
                  Created by {task.creator.name} ·{" "}
                  {new Date(task.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="mx-4 w-full max-w-sm rounded-xl border border-gray-100 bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-base font-semibold text-gray-900">Delete task?</h3>
            <p className="mb-5 text-sm text-gray-500">
              &quot;{display.title}&quot; will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Delete task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function XIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
