import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-states/empty-state";
import {
  CompletedTodayWell,
  TaskList,
} from "@/components/tasks/task-list";
import { logicalDate } from "@/lib/logical-clock";
import {
  listCompletedToday,
  listIncomplete,
  requireUserId,
} from "@/lib/tasks/queries";

export const metadata: Metadata = {
  title: "Today",
};

export default async function TodayPage() {
  const userId = await requireUserId();
  const todayIso = logicalDate();
  const [tasks, completed] = await Promise.all([
    listIncomplete(userId, "today"),
    listCompletedToday(userId, todayIso),
  ]);
  const showEmpty = tasks.length === 0 && completed.length === 0;

  return (
    <main className="list-screen">
      <h1 className="list-screen__title">Today</h1>
      {showEmpty ? (
        <EmptyState
          mark="today"
          headline="Open board."
          line="One honest list when you're ready."
          cta="Keep going."
        />
      ) : null}
      <TaskList tasks={tasks} location="today" todayIso={todayIso} />
      <CompletedTodayWell tasks={completed} />
    </main>
  );
}
