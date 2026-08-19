"use client";

import { useState } from "react";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { TaskRowMoves } from "@/components/tasks/task-row-moves";
import type { TaskLocation, TaskRowData } from "@/lib/tasks/queries";

type TaskRowProps = {
  task: TaskRowData;
  completed?: boolean;
  completing?: boolean;
  completePending?: boolean;
  showMoves?: boolean;
  movesPending?: boolean;
  onMove?: (toLocation: TaskLocation) => void;
  onDelete?: () => void;
  onToggleComplete?: (input: { keyboard: boolean }) => void;
  handleRef?: (node: HTMLElement | null) => void;
  handleAttributes?: DraggableAttributes;
  handleListeners?: DraggableSyntheticListeners;
};

export function TaskRow({
  task,
  completed = false,
  completing = false,
  completePending = false,
  showMoves = false,
  movesPending = false,
  onMove,
  onDelete,
  onToggleComplete,
  handleRef,
  handleAttributes,
  handleListeners,
}: TaskRowProps) {
  const sortable = handleRef && handleAttributes;
  const [pressed, setPressed] = useState(false);
  const canToggle = Boolean(onToggleComplete) && !completePending && !completing;

  return (
    <article
      className={[
        "task-row",
        completed ? "task-row--done" : null,
        completing ? "task-row--completing" : null,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className={[
          "task-row__complete",
          completed ? "task-row__complete--done" : null,
          pressed ? "task-row__complete--pressed" : null,
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={!canToggle}
        aria-pressed={completed}
        aria-label={
          completed ? `Undo complete ${task.title}` : `Complete ${task.title}`
        }
        onPointerDown={(event) => {
          if (!canToggle) {
            return;
          }
          if (
            event.pointerType === "mouse" ||
            event.pointerType === "touch" ||
            event.pointerType === "pen"
          ) {
            setPressed(true);
          }
        }}
        onPointerUp={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onClick={(event) => {
          if (!canToggle || !onToggleComplete) {
            return;
          }
          onToggleComplete({ keyboard: event.detail === 0 });
        }}
      >
        <span className="task-row__complete-mark">
          {completed ? svgCheck : null}
        </span>
      </button>
      {sortable ? (
        <button
          type="button"
          className="task-row__handle"
          ref={handleRef}
          {...handleAttributes}
          {...handleListeners}
          aria-label={`Reorder ${task.title}`}
        >
          <HandleDots />
        </button>
      ) : (
        <span className="task-row__handle" aria-hidden="true">
          <HandleDots />
        </span>
      )}
      <div className="task-row__body">
        <p className="task-row__title">{task.title}</p>
        {task.notes ? <p className="task-row__notes">{task.notes}</p> : null}
      </div>
      {(showMoves && onMove) || onDelete ? (
        <TaskRowMoves
          title={task.title}
          fromLocation={task.location}
          disabled={movesPending || completePending}
          showMoves={Boolean(showMoves && onMove)}
          onMove={onMove}
          onDelete={onDelete}
        />
      ) : null}
    </article>
  );
}

function HandleDots() {
  return (
    <>
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </>
  );
}

const svgCheck = (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="task-row__check">
    <path
      d="M3.5 8.5 6.5 11.5 12.5 4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
