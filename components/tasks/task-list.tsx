import { SortableTaskList } from "@/components/tasks/sortable-task-list";
import type { TaskLocation, TaskRowData } from "@/lib/tasks/queries";

export { CompletedTodayWell } from "@/components/tasks/completed-today-well";

type TaskListProps = {
  tasks: TaskRowData[];
  location: TaskLocation;
};

export function TaskList({ tasks, location }: TaskListProps) {
  return <SortableTaskList tasks={tasks} location={location} />;
}
