import {
  weekdayLetter,
  type DayCount,
  type DayRate,
  type StatsSnapshot,
  type WindowStats,
} from "@/lib/stats";

function FlameMark() {
  return (
    <svg
      className="stats-streak__flame"
      viewBox="0 0 16 16"
      width="32"
      height="32"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="13"
        width="10"
        height="2.5"
        rx="1.25"
        fill="#FFC800"
        opacity="0.55"
      />
      <path
        d="M8 1.6c2.1 2.3 4.8 5 4.8 8.1a4.8 4.8 0 1 1-9.6 0C3.2 6.6 5.9 3.9 8 1.6Z"
        fill="#FF9600"
      />
      <circle cx="8" cy="10.1" r="2.15" fill="#FFC800" />
    </svg>
  );
}

function CountBars({
  counts,
  maxCount,
  dense,
}: {
  counts: DayCount[];
  maxCount: number;
  dense?: boolean;
}) {
  const scale = maxCount === 0 ? 1 : maxCount;

  return (
    <div className={dense ? "stats-bars stats-bars--dense" : "stats-bars"}>
      {counts.map((day) => (
        <div key={day.date} className="stats-bars__day">
          <div
            className="stats-bar"
            role="img"
            aria-label={`${day.date}, ${day.count} done`}
          >
            <span
              className="stats-bar__fill"
              style={{ width: `${(day.count / scale) * 100}%` }}
            />
          </div>
          {dense ? null : (
            <span className="stats-bars__label">{weekdayLetter(day.date)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function RateBars({ rates, dense }: { rates: DayRate[]; dense?: boolean }) {
  return (
    <div className={dense ? "stats-bars stats-bars--dense" : "stats-bars"}>
      {rates.map((day) => {
        const label =
          day.sat === 0
            ? `${day.date}, nothing sat on Today`
            : `${day.date}, ${day.completed} of ${day.sat} on Today`;
        return (
          <div key={day.date} className="stats-bars__day">
            <div className="stats-bar" role="img" aria-label={label}>
              {day.rate === null ? null : (
                <span
                  className="stats-bar__fill"
                  style={{ width: `${day.rate * 100}%` }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
  title,
  window,
  dense,
}: {
  title: string;
  window: WindowStats;
  dense?: boolean;
}) {
  return (
    <section className="stats-card">
      <header className="stats-card__head">
        <h2 className="stats-card__title">{title}</h2>
        <p className="stats-number">{window.total}</p>
      </header>
      <CountBars counts={window.counts} maxCount={window.maxCount} dense={dense} />
      <p className="stats-card__caption">On Today</p>
      <RateBars rates={window.rates} dense={dense} />
      <p className="stats-rate-summary">
        <span className="stats-number">{window.completedOnToday}</span>
        <span className="stats-rate-summary__of">
          {" "}
          / {window.satOnToday} on Today
        </span>
      </p>
      <div className="stats-split">
        <p className="stats-split__item stats-split__item--personal">
          <span className="stats-split__label">Personal</span>
          <span className="stats-number">{window.split.personal}</span>
        </p>
        <p className="stats-split__item stats-split__item--work">
          <span className="stats-split__label">Work</span>
          <span className="stats-number">{window.split.work}</span>
        </p>
      </div>
    </section>
  );
}

export function StatsScreen({ stats }: { stats: StatsSnapshot }) {
  const { current, best } = stats.streak;

  return (
    <main className="stats-screen">
      <h1 className="list-screen__title">Stats</h1>

      <section className="stats-card stats-card--streak">
        <div className="stats-streak">
          <FlameMark />
          <p className="stats-number" aria-label={`Current streak ${current}`}>
            {current}
          </p>
        </div>
        <p className="stats-streak__best" aria-label={`Best streak ${best}`}>
          Best {best}
        </p>
        {current === 0 ? (
          <p className="stats-card__line">A complete starts the run.</p>
        ) : null}
      </section>

      <WindowCard title="Last 7 days" window={stats.last7} />
      <WindowCard title="Last 30 days" window={stats.last30} dense />

      <section className="stats-card stats-card--overdue">
        <header className="stats-card__head">
          <h2 className="stats-card__title">Overdue</h2>
          <span className="task-row__overdue-pill">Overdue</span>
        </header>
        <p
          className="stats-number"
          aria-label={`${stats.overdueCount} overdue`}
        >
          {stats.overdueCount}
        </p>
        <p className="stats-card__line">
          {stats.overdueCount === 0
            ? "Clear board."
            : "Missed. Still on the board."}
        </p>
      </section>
    </main>
  );
}
