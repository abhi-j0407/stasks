import { LipButton } from "@/components/buttons/lip-button";
import registryMark from "@/components/empty-states/registry.svg";
import todayMark from "@/components/empty-states/today.svg";
import tomorrowMark from "@/components/empty-states/tomorrow.svg";

const marks = {
  today: todayMark,
  tomorrow: tomorrowMark,
  registry: registryMark,
} as const;

type EmptyStateProps = {
  mark: keyof typeof marks;
  headline: string;
  line: string;
  cta: string;
};

export function EmptyState({ mark, headline, line, cta }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__art">
        <img src={marks[mark]} alt="" width={200} height={160} />
      </div>
      <h2 className="empty-state__headline">{headline}</h2>
      <p className="empty-state__line">{line}</p>
      <div className="empty-state__cta">
        <LipButton variant="primary" className="lip-button--block">
          {cta}
        </LipButton>
      </div>
    </div>
  );
}
