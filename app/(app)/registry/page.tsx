import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-states/empty-state";
import { TaskList } from "@/components/tasks/task-list";
import { listIncomplete, requireUserId } from "@/lib/tasks/queries";

export const metadata: Metadata = {
  title: "Registry",
};

export default async function RegistryPage() {
  const userId = await requireUserId();
  const tasks = await listIncomplete(userId, "registry");

  return (
    <main className="list-screen">
      <h1 className="list-screen__title">Registry</h1>
      {tasks.length === 0 ? (
        <EmptyState
          mark="registry"
          headline="Room in the pile."
          line="Park the pile. It can wait without guilt."
          cta="Park it for later."
        />
      ) : null}
      <TaskList tasks={tasks} />
    </main>
  );
}
