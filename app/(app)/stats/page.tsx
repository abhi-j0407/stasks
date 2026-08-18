import type { Metadata } from "next";
import { PlaceholderScreen } from "../placeholder-screen";

export const metadata: Metadata = {
  title: "Stats",
};

export default function StatsPage() {
  return (
    <PlaceholderScreen
      title="Stats"
      line="Streaks and heat live here later. For now, the ritual is enough."
      cta="Keep going"
    />
  );
}
