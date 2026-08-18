import { formatCaptionDate } from "@/lib/logical-clock";

type AppHeaderProps = {
  todayIso: string;
  tomorrowIso: string;
};

export function AppHeader({ todayIso, tomorrowIso }: AppHeaderProps) {
  return (
    <header className="app-header">
      <p className="app-header__dates">
        <span>Today · {formatCaptionDate(todayIso)}</span>
        <span>Tomorrow · {formatCaptionDate(tomorrowIso)}</span>
      </p>
      <p className="app-header__streak" aria-label="Streak 0">
        0
      </p>
    </header>
  );
}
