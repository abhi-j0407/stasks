import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { TaskRowMoves } from "@/components/tasks/task-row-moves";
import type { TaskLocation, TaskRowData } from "@/lib/tasks/queries";

type TaskRowProps = {
  task: TaskRowData;
  completed?: boolean;
  showMoves?: boolean;
  movesPending?: boolean;
  onMove?: (toLocation: TaskLocation) => void;
  handleRef?: (node: HTMLElement | null) => void;
  handleAttributes?: DraggableAttributes;
  handleListeners?: DraggableSyntheticListeners;
};

export function TaskRow({
  task,
  completed = false,
  showMoves = false,
  movesPending = false,
  onMove,
  handleRef,
  handleAttributes,
  handleListeners,
}: TaskRowProps) {
  const sortable = handleRef && handleAttributes;

  return (
    <article
      className={completed ? "task-row task-row--done" : "task-row"}
    >
      <button
        type="button"
        className={
          completed
            ? "task-row__complete task-row__complete--done"
            : "task-row__complete"
        }
        disabled
        aria-label={
          completed ? `${task.title}, completed` : `Complete ${task.title}`
        }
        title="Complete comes later"
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
      {showMoves && onMove ? (
        <TaskRowMoves
          title={task.title}
          fromLocation={task.location}
          disabled={movesPending}
          onMove={onMove}
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
