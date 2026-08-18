import type { Metadata } from "next";
import { PlaceholderScreen } from "../placeholder-screen";

export const metadata: Metadata = {
  title: "Today",
};

export default function TodayPage() {
  return (
    <PlaceholderScreen
      title="Today"
      line="One honest list. Tap a key when you finish."
      cta="Keep going"
    />
  );
}
