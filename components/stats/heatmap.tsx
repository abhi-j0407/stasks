import { formatCaptionDate } from "@/lib/logical-clock";
import type { HeatmapGrid, HeatmapWeek } from "@/lib/stats";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

function monthName(iso: string): string {
  const [year, month] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-GB", {
    month: "short",
    timeZone: "UTC",
  });
}

function monthLabels(weeks: HeatmapWeek[]): (string | null)[] {
  const labels: (string | null)[] = [];
  let lastMonth = "";
  for (const week of weeks) {
    const first = week.cells.find((cell) => cell.inRange);
    if (!first) {
      labels.push(null);
      continue;
    }
    const month = first.date.slice(0, 7);
    if (month === lastMonth) {
      labels.push(null);
    } else {
      labels.push(monthName(first.date));
      lastMonth = month;
    }
  }
  return labels;
}

export function Heatmap({ grid }: { grid: HeatmapGrid }) {
  const labels = monthLabels(grid.weeks);

  return (
    <section
      className="stats-card"
      aria-label={`Completions from ${formatCaptionDate(grid.start)} to now`}
    >
      <header className="stats-card__head">
        <h2 className="stats-card__title">Heat</h2>
        <p className="stats-number">{grid.total}</p>
      </header>
      {grid.total === 0 ? (
        <p className="stats-card__line">Heat starts here.</p>
      ) : null}
      <div className="stats-heatmap-scroll">
        <div className="stats-heatmap">
          <div className="stats-heatmap__weekdays" aria-hidden="true">
            <span className="stats-heatmap__month-spacer" />
            {WEEKDAY_LABELS.map((label, index) => (
              <span key={`${label}-${index}`} className="stats-heatmap__weekday">
                {label}
              </span>
            ))}
          </div>
          <div className="stats-heatmap__grid">
            <div
              className="stats-heatmap__months"
              style={{
                gridTemplateColumns: `repeat(${grid.weeks.length}, 13px)`,
              }}
            >
              {labels.map((label, index) => (
                <span key={grid.weeks[index]?.monday ?? index}>{label}</span>
              ))}
            </div>
            <div className="stats-heatmap__weeks">
              {grid.weeks.map((week) => (
                <div key={week.monday} className="stats-heatmap__week">
                  {week.cells.map((cell) => {
                    const title = cell.inRange
                      ? `${formatCaptionDate(cell.date)}, ${cell.count} done`
                      : undefined;
                    return (
                      <span
                        key={cell.date}
                        className={`stats-heatmap__cell stats-heatmap__cell--${cell.level}`}
                        title={title}
                        role={cell.inRange ? "img" : undefined}
                        aria-label={title}
                        aria-hidden={cell.inRange ? undefined : true}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
