"use client";

import { useState, useTransition, useOptimistic } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard, TaskCardData } from "./task-card";
import { CreateTaskModal } from "./create-task-modal";
import { updateTaskStatus } from "@/lib/actions/task";
import { cn } from "@/lib/utils";

type Status = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

const COLUMNS: { id: Status; label: string; color: string; dot: string }[] = [
  { id: "TODO", label: "To Do", color: "bg-gray-50 border-gray-200", dot: "bg-gray-400" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  { id: "IN_REVIEW", label: "In Review", color: "bg-yellow-50 border-yellow-200", dot: "bg-yellow-500" },
  { id: "DONE", label: "Done", color: "bg-green-50 border-green-200", dot: "bg-green-500" },
];

interface Member {
  user: { id: string; name: string | null; image: string | null };
}

interface KanbanBoardProps {
  initialTasks: TaskCardData[];
  projectId: string;
  workspaceId: string;
  members: Member[];
}

export function KanbanBoard({ initialTasks, projectId, workspaceId, members }: KanbanBoardProps) {
  const [tasks, setOptimisticTasks] = useOptimistic(initialTasks);
  const [activeTask, setActiveTask] = useState<TaskCardData | null>(null);
  const [createModalStatus, setCreateModalStatus] = useState<Status | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskCardData | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function getTasksByStatus(status: Status) {
    return tasks.filter((t) => t.status === status);
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // over a column header
    const overColumn = COLUMNS.find((c) => c.id === overId);
    if (overColumn) {
      setOptimisticTasks((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, status: overColumn.id } : t))
      );
      return;
    }

    // over another task
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && overTask.status !== tasks.find((t) => t.id === activeId)?.status) {
      setOptimisticTasks((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, status: overTask.status } : t))
      );
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    const overColumn = COLUMNS.find((c) => c.id === over.id);
    const overTask = tasks.find((t) => t.id === over.id);
    const newStatus = overColumn?.id ?? overTask?.status;

    if (newStatus && newStatus !== task.status) {
      startTransition(async () => {
        await updateTaskStatus(task.id, newStatus, projectId, workspaceId);
      });
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colTasks = getTasksByStatus(col.id);
            return (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={colTasks}
                onAddTask={() => setCreateModalStatus(col.id)}
                onTaskClick={setSelectedTask}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-3 opacity-90">
              <TaskCard task={activeTask} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Create task modal */}
      {createModalStatus && (
        <CreateTaskModal
          projectId={projectId}
          workspaceId={workspaceId}
          defaultStatus={createModalStatus}
          members={members}
          onClose={() => setCreateModalStatus(null)}
        />
      )}

      {/* Task detail drawer */}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
}

// ─── Column ──────────────────────────────────────────────────────────────────

interface ColumnProps {
  column: typeof COLUMNS[0];
  tasks: TaskCardData[];
  onAddTask: () => void;
  onTaskClick: (task: TaskCardData) => void;
}

function KanbanColumn({ column, tasks, onAddTask, onTaskClick }: ColumnProps) {
  return (
    <div
      className={cn(
        "flex w-72 flex-shrink-0 flex-col rounded-xl border p-3",
        column.color
      )}
    >
      {/* Column header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("h-2.5 w-2.5 rounded-full", column.dot)} />
          <span className="text-sm font-semibold text-gray-700">{column.label}</span>
          <span className="rounded-full bg-white px-1.5 py-0.5 text-xs font-medium text-gray-500 border border-gray-200">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="rounded-lg p-1 text-gray-400 hover:bg-white hover:text-indigo-600 transition-colors"
          title={`Add task to ${column.label}`}
        >
          <PlusIcon />
        </button>
      </div>

      {/* Drop zone + tasks */}
      <SortableContext
        id={column.id}
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          id={column.id}
          className="flex flex-1 flex-col gap-2 min-h-[200px]"
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}

          {tasks.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-8">
              <p className="text-xs text-gray-400">Drop tasks here</p>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add task link at bottom */}
      <button
        onClick={onAddTask}
        className="mt-3 flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-white hover:text-indigo-600 transition-colors"
      >
        <PlusIcon /> Add task
      </button>
    </div>
  );
}

// ─── Task detail drawer ───────────────────────────────────────────────────────

function TaskDetailDrawer({ task, onClose }: { task: TaskCardData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Task details</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <XIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            {task.description && (
              <p className="mt-2 text-sm text-gray-600">{task.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Status">
              <span className="text-sm font-medium text-gray-900">
                {task.status.replace(/_/g, " ")}
              </span>
            </DetailItem>
            <DetailItem label="Priority">
              <span className="text-sm font-medium text-gray-900">{task.priority}</span>
            </DetailItem>
            {task.dueDate && (
              <DetailItem label="Due date">
                <span className="text-sm text-gray-900">
                  {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </DetailItem>
            )}
            {task.assignee && (
              <DetailItem label="Assignee">
                <div className="flex items-center gap-2">
                  {task.assignee.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={task.assignee.image} alt="" className="h-5 w-5 rounded-full" />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                      {task.assignee.name?.slice(0, 1)}
                    </div>
                  )}
                  <span className="text-sm text-gray-900">{task.assignee.name}</span>
                </div>
              </DetailItem>
            )}
          </div>

          <div className="rounded-lg bg-indigo-50 p-4 text-sm text-indigo-700">
            <p className="font-medium">AI Summary</p>
            <p className="mt-1 text-indigo-600">
              Coming in Step 6 — click &quot;Summarize&quot; to get an AI-generated status summary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
