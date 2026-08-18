import type { TaskRowData } from "@/lib/tasks/queries";

type TaskRowProps = {
  task: TaskRowData;
  completed?: boolean;
};

export function TaskRow({ task, completed = false }: TaskRowProps) {
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
          {completed ? (
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="task-row__check"
            >
              <path
                d="M3.5 8.5 6.5 11.5 12.5 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
      </button>
      <span className="task-row__handle" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </span>
      <div className="task-row__body">
        <p className="task-row__title">{task.title}</p>
        {task.notes ? <p className="task-row__notes">{task.notes}</p> : null}
      </div>
    </article>
  );
}
