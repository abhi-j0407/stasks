"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import {
  getStreakSnapshot,
  setStreak,
  subscribeStreak,
} from "@/components/nav/streak-store";

type StreakPillProps = {
  current: number;
};

const MILESTONE_SPARKS = [
  { x: -11, y: -13, color: "var(--color-fox)", delay: "0ms" },
  { x: 10, y: -12, color: "var(--color-bee)", delay: "40ms" },
  { x: -14, y: 2, color: "var(--color-bee)", delay: "80ms" },
  { x: 13, y: 4, color: "var(--color-fox)", delay: "50ms" },
  { x: 0, y: -16, color: "var(--color-fox)", delay: "20ms" },
  { x: 4, y: 12, color: "var(--color-bee)", delay: "70ms" },
] as const;

export function StreakPill({ current }: StreakPillProps) {
  const live = useSyncExternalStore(
    subscribeStreak,
    getStreakSnapshot,
    getStreakSnapshot,
  );
  const displayed = live.current ?? current;
  const play = live.play;
  const countClass =
    play === "milestone"
      ? "streak-pill__count streak-pill__count--milestone"
      : play === "tick"
        ? "streak-pill__count streak-pill__count--tick"
        : "streak-pill__count";

  return (
    <p className="app-header__streak" aria-label={`Streak ${displayed}`}>
      <span className="streak-pill__mark" aria-hidden="true">
        <span className="streak-pill__flame">
          <svg viewBox="0 0 16 16" width="14" height="14">
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
        </span>
        {play === "milestone" ? (
          <span className="streak-pill__burst">
            {MILESTONE_SPARKS.map((spark, index) => (
              <span
                key={index}
                className="streak-pill__spark"
                style={
                  {
                    backgroundColor: spark.color,
                    animationDelay: spark.delay,
                    "--spark-x": `${spark.x}px`,
                    "--spark-y": `${spark.y}px`,
                  } as CSSProperties
                }
              />
            ))}
          </span>
        ) : null}
      </span>
      <span
        className={countClass}
        onAnimationEnd={(event) => {
          if (event.target !== event.currentTarget || play === "none") {
            return;
          }
          setStreak({ current: displayed, play: "none" });
        }}
      >
        {displayed}
      </span>
    </p>
  );
}
