"use client";

import { useRef, useTransition } from "react";
import { createTask } from "@/lib/actions/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Member {
  user: { id: string; name: string | null; image: string | null };
}

interface CreateTaskModalProps {
  projectId: string;
  workspaceId: string;
  defaultStatus: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  members: Member[];
  onClose: () => void;
}

export function CreateTaskModal({
  projectId,
  workspaceId,
  defaultStatus,
  members,
  onClose,
}: CreateTaskModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createTask(formData);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">New task</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <XIcon />
          </button>
        </div>

        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="status" value={defaultStatus} />

          <Input
            label="Title"
            name="title"
            placeholder="What needs to be done?"
            required
            autoFocus
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Add more details..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Priority */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                name="priority"
                defaultValue="MEDIUM"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Due date */}
            <Input
              label="Due date"
              name="dueDate"
              type="date"
            />
          </div>

          {/* Assignee */}
          {members.length > 0 && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Assignee <span className="text-gray-400">(optional)</span>
              </label>
              <select
                name="assigneeId"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isPending} className="flex-1">
              Create task
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
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
