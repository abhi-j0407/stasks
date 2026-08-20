"use client";

import { useState } from "react";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { TaskRowMoves } from "@/components/tasks/task-row-moves";
import { formatCaptionDate } from "@/lib/logical-clock";
import {
  OVERDUE_CHIP,
  overdueChipAria,
} from "@/lib/tasks/clear-overdue";
import type { TaskLocation, TaskRowData } from "@/lib/tasks/queries";
import { isUpcoming, UPCOMING_CHIP } from "@/lib/upcoming";

type TaskRowProps = {
  task: TaskRowData;
  todayIso?: string;
  completed?: boolean;
  completing?: boolean;
  completePending?: boolean;
  showMoves?: boolean;
  movesPending?: boolean;
  onMove?: (toLocation: TaskLocation) => void;
  onDelete?: () => void;
  onClearOverdue?: (input: { keyboard: boolean }) => void;
  onPlannedDateChange?: (plannedDate: string | null) => void;
  onToggleComplete?: (input: { keyboard: boolean }) => void;
  handleRef?: (node: HTMLElement | null) => void;
  handleAttributes?: DraggableAttributes;
  handleListeners?: DraggableSyntheticListeners;
};

export function TaskRow({
  task,
  todayIso,
  completed = false,
  completing = false,
  completePending = false,
  showMoves = false,
  movesPending = false,
  onMove,
  onDelete,
  onClearOverdue,
  onPlannedDateChange,
  onToggleComplete,
  handleRef,
  handleAttributes,
  handleListeners,
}: TaskRowProps) {
  const sortable = handleRef && handleAttributes;
  const [pressed, setPressed] = useState(false);
  const [chipPressed, setChipPressed] = useState(false);
  const canToggle = Boolean(onToggleComplete) && !completePending && !completing;
  const showOverdue = task.overdue && !completed;
  const canClearOverdue =
    showOverdue && Boolean(onClearOverdue) && !completePending && !movesPending;
  const showPlannedDate = task.location === "registry" && !completed;
  const plannedDatePending = completePending || movesPending;
  const showUpcoming =
    todayIso != null &&
    !completed &&
    isUpcoming({
      location: task.location,
      plannedDate: task.plannedDate,
      t: todayIso,
    });

  return (
    <article
      className={[
        "task-row",
        completed ? "task-row--done" : null,
        completing ? "task-row--completing" : null,
        showUpcoming ? "task-row--upcoming" : null,
        showOverdue ? "task-row--overdue" : null,
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
        {showPlannedDate ? (
          onPlannedDateChange ? (
            <input
              className="task-row__planned-date"
              type="date"
              value={task.plannedDate ?? ""}
              disabled={plannedDatePending}
              aria-label={`Planned date for ${task.title}`}
              onChange={(event) => {
                onPlannedDateChange(event.target.value || null);
              }}
            />
          ) : task.plannedDate ? (
            <p className="task-row__planned-date-text">
              {formatCaptionDate(task.plannedDate)}
            </p>
          ) : null
        ) : null}
      </div>
      {showUpcoming ? (
        <span className="task-row__upcoming-chip">
          <span className="task-row__upcoming-pill">{UPCOMING_CHIP}</span>
        </span>
      ) : null}
      {showOverdue ? (
        <button
          type="button"
          className={[
            "task-row__overdue-chip",
            chipPressed ? "task-row__overdue-chip--pressed" : null,
          ]
            .filter(Boolean)
            .join(" ")}
          disabled={!canClearOverdue}
          aria-label={overdueChipAria(task.title)}
          onPointerDown={(event) => {
            if (!canClearOverdue) {
              return;
            }
            if (
              event.pointerType === "mouse" ||
              event.pointerType === "touch" ||
              event.pointerType === "pen"
            ) {
              setChipPressed(true);
            }
          }}
          onPointerUp={() => setChipPressed(false)}
          onPointerCancel={() => setChipPressed(false)}
          onPointerLeave={() => setChipPressed(false)}
          onClick={(event) => {
            if (!canClearOverdue || !onClearOverdue) {
              return;
            }
            setChipPressed(false);
            onClearOverdue({ keyboard: event.detail === 0 });
          }}
        >
          <span className="task-row__overdue-pill">{OVERDUE_CHIP}</span>
        </button>
      ) : null}
      {(showMoves && onMove) || onDelete || (showOverdue && onClearOverdue) ? (
        <TaskRowMoves
          title={task.title}
          fromLocation={task.location}
          disabled={movesPending || completePending}
          showMoves={Boolean(showMoves && onMove)}
          showClearOverdue={showOverdue && Boolean(onClearOverdue)}
          onMove={onMove}
          onClearOverdue={
            onClearOverdue
              ? () => onClearOverdue({ keyboard: false })
              : undefined
          }
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
