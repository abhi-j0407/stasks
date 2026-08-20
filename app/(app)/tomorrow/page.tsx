import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-states/empty-state";
import { TaskList } from "@/components/tasks/task-list";
import { logicalDate } from "@/lib/logical-clock";
import { listIncomplete, requireUserId } from "@/lib/tasks/queries";

export const metadata: Metadata = {
  title: "Tomorrow",
};

export default async function TomorrowPage() {
  const userId = await requireUserId();
  const todayIso = logicalDate();
  const tasks = await listIncomplete(userId, "tomorrow");

  return (
    <main className="list-screen">
      <h1 className="list-screen__title">Tomorrow</h1>
      {tasks.length === 0 ? (
        <EmptyState
          mark="tomorrow"
          headline="Tonight is open."
          line="Lay it out tonight so morning-you already knows."
          cta="Plan tomorrow."
        />
      ) : null}
      <TaskList tasks={tasks} location="tomorrow" todayIso={todayIso} />
    </main>
  );
}
