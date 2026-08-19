"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toast } from "@/components/feedback/toast-store";
import { TaskRow } from "@/components/tasks/task-row";
import { undoComplete } from "@/lib/actions/complete-task";
import { deleteTask, restoreDeletedTask } from "@/lib/actions/delete-task";
import { DELETE_TOAST } from "@/lib/tasks/delete-task";
import type { TaskRowData } from "@/lib/tasks/queries";
import {
  splitByCategory,
  type TaskCategory,
} from "@/lib/tasks/split-by-category";

type CompletedTodayWellProps = {
  tasks: TaskRowData[];
};

export function CompletedTodayWell({ tasks }: CompletedTodayWellProps) {
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(tasks);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { personal, work } = splitByCategory(optimisticTasks);

  function handleUndo(taskId: string) {
    if (isPending) {
      return;
    }

    const next = optimisticTasks.filter((task) => task.id !== taskId);
    setError(null);
    startTransition(async () => {
      setOptimisticTasks(next);
      const result = await undoComplete({ taskId });
      if (!result.ok) {
        setError(result.message);
      }
    });
  }

  function handleDelete(taskId: string) {
    if (isPending) {
      return;
    }

    const next = optimisticTasks.filter((task) => task.id !== taskId);
    setError(null);
    startTransition(async () => {
      setOptimisticTasks(next);
      const result = await deleteTask({ taskId });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      toast({
        message: DELETE_TOAST,
        tone: "delete",
        actionLabel: "Undo",
        durationMs: 5000,
        onAction: () => {
          startTransition(async () => {
            const restored = await restoreDeletedTask({
              snapshot: result.snapshot,
            });
            if (!restored.ok) {
              setError(restored.message);
            }
          });
        },
      });
    });
  }

  if (optimisticTasks.length === 0 && !error) {
    return null;
  }

  return (
    <section
      className="completed-well"
      aria-labelledby="completed-today-heading"
    >
      <h2 id="completed-today-heading" className="completed-well__title">
        Completed today
      </h2>
      {error ? (
        <p className="task-list__error" aria-live="polite">
          {error}
        </p>
      ) : null}
      {personal.length > 0 ? (
        <CompletedSection
          category="personal"
          tasks={personal}
          pending={isPending}
          onUndo={handleUndo}
          onDelete={handleDelete}
        />
      ) : null}
      {work.length > 0 ? (
        <CompletedSection
          category="work"
          tasks={work}
          pending={isPending}
          onUndo={handleUndo}
          onDelete={handleDelete}
        />
      ) : null}
    </section>
  );
}

function CompletedSection({
  category,
  tasks,
  pending,
  onUndo,
  onDelete,
}: {
  category: TaskCategory;
  tasks: TaskRowData[];
  pending: boolean;
  onUndo: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}) {
  const title = category === "personal" ? "Personal" : "Work";
  const headingId = `completed-${category}`;

  return (
    <section className="task-section" aria-labelledby={headingId}>
      <h3
        id={headingId}
        className={
          category === "personal"
            ? "task-section__title task-section__title--personal"
            : "task-section__title task-section__title--work"
        }
      >
        {title}
      </h3>
      <div className="task-section__rows">
        <div className="task-section__items">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              completed
              completePending={pending}
              onDelete={() => onDelete(task.id)}
              onToggleComplete={() => onUndo(task.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
