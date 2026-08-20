import type { Metadata } from "next";
import { StatsScreen } from "@/components/stats/stats-screen";
import { logicalDate } from "@/lib/logical-clock";
import { loadStats, requireUserId } from "@/lib/tasks/queries";

export const metadata: Metadata = {
  title: "Stats",
};

export default async function StatsPage() {
  const userId = await requireUserId();
  const todayIso = logicalDate();
  const stats = await loadStats(userId, todayIso);

  return <StatsScreen stats={stats} />;
}
