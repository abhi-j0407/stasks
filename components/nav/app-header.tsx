import { StreakPill } from "@/components/nav/streak-pill";
import { formatCaptionDate } from "@/lib/logical-clock";

type AppHeaderProps = {
  todayIso: string;
  tomorrowIso: string;
  currentStreak: number;
};

export function AppHeader({
  todayIso,
  tomorrowIso,
  currentStreak,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <p className="app-header__dates">
        <span>Today · {formatCaptionDate(todayIso)}</span>
        <span>Tomorrow · {formatCaptionDate(tomorrowIso)}</span>
      </p>
      <StreakPill current={currentStreak} />
    </header>
  );
}
