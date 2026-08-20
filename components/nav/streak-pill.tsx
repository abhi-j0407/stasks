"use client";

type StreakPillProps = {
  current: number;
};

export function StreakPill({ current }: StreakPillProps) {
  return (
    <p className="app-header__streak" aria-label={`Streak ${current}`}>
      <span className="streak-pill__flame" aria-hidden="true">
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
      <span className="streak-pill__count">{current}</span>
    </p>
  );
}
