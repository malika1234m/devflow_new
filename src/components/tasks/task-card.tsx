"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn, formatDate } from "@/lib/utils";
import { PriorityBadge } from "@/components/ui/badge";

export interface TaskCardData {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  dueDate: Date | null;
  assignee: { id: string; name: string | null; image: string | null } | null;
  _count: { comments: number };
}

interface TaskCardProps {
  task: TaskCardData;
  onClick: (task: TaskCardData) => void;
}

const priorityBar: Record<string, string> = {
  LOW: "bg-gray-300",
  MEDIUM: "bg-yellow-400",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={cn(
        "group relative cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm",
        "hover:border-indigo-300 hover:shadow-md transition-all",
        isDragging && "opacity-50 cursor-grabbing shadow-lg rotate-2"
      )}
    >
      {/* Priority bar on left edge */}
      <div className={cn("absolute left-0 top-3 bottom-3 w-1 rounded-r-full", priorityBar[task.priority])} />

      <div className="pl-2">
        {/* Title */}
        <p className="text-sm font-medium text-gray-900 leading-snug mb-2">
          {task.title}
        </p>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2">
          <PriorityBadge priority={task.priority} />

          <div className="flex items-center gap-2">
            {/* Due date */}
            {task.dueDate && (
              <span className={cn(
                "text-xs",
                new Date(task.dueDate) < new Date() ? "text-red-500 font-medium" : "text-gray-400"
              )}>
                {formatDate(task.dueDate)}
              </span>
            )}

            {/* Comments count */}
            {task._count.comments > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-gray-400">
                <CommentIcon />
                {task._count.comments}
              </span>
            )}

            {/* Assignee avatar */}
            {task.assignee && (
              <div title={task.assignee.name ?? ""}>
                {task.assignee.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={task.assignee.image}
                    alt={task.assignee.name ?? ""}
                    className="h-5 w-5 rounded-full"
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {task.assignee.name?.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
