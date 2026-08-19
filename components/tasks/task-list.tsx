import { AddRow } from "@/components/tasks/add-row";
import { TaskRow } from "@/components/tasks/task-row";
import type { TaskLocation, TaskRowData } from "@/lib/tasks/queries";
import {
  splitByCategory,
  type TaskCategory,
} from "@/lib/tasks/split-by-category";

type TaskListProps = {
  tasks: TaskRowData[];
  location: TaskLocation;
};

export function TaskList({ tasks, location }: TaskListProps) {
  const { personal, work } = splitByCategory(tasks);

  return (
    <div className="task-list">
      <TaskSection
        category="personal"
        tasks={personal}
        location={location}
      />
      <TaskSection category="work" tasks={work} location={location} />
    </div>
  );
}

type CompletedTodayWellProps = {
  tasks: TaskRowData[];
};

export function CompletedTodayWell({ tasks }: CompletedTodayWellProps) {
  if (tasks.length === 0) {
    return null;
  }

  const { personal, work } = splitByCategory(tasks);

  return (
    <section
      className="completed-well"
      aria-labelledby="completed-today-heading"
    >
      <h2 id="completed-today-heading" className="completed-well__title">
        Completed today
      </h2>
      {personal.length > 0 ? (
        <TaskSection
          category="personal"
          tasks={personal}
          completed
          headingPrefix="completed"
          HeadingTag="h3"
        />
      ) : null}
      {work.length > 0 ? (
        <TaskSection
          category="work"
          tasks={work}
          completed
          headingPrefix="completed"
          HeadingTag="h3"
        />
      ) : null}
    </section>
  );
}

type TaskSectionProps = {
  category: TaskCategory;
  tasks: TaskRowData[];
  location?: TaskLocation;
  completed?: boolean;
  headingPrefix?: string;
  HeadingTag?: "h2" | "h3";
};

function TaskSection({
  category,
  tasks,
  location,
  completed = false,
  headingPrefix = "list",
  HeadingTag = "h2",
}: TaskSectionProps) {
  const title = category === "personal" ? "Personal" : "Work";
  const headingId = `${headingPrefix}-${category}`;

  return (
    <section className="task-section" aria-labelledby={headingId}>
      <HeadingTag
        id={headingId}
        className={
          category === "personal"
            ? "task-section__title task-section__title--personal"
            : "task-section__title task-section__title--work"
        }
      >
        {title}
      </HeadingTag>
      <div className="task-section__rows">
        <div className="task-section__items">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} completed={completed} />
          ))}
        </div>
        {completed || !location ? null : (
          <AddRow category={category} location={location} />
        )}
      </div>
    </section>
  );
}
