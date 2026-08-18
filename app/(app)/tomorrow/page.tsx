import type { Metadata } from "next";
import { PlaceholderScreen } from "../placeholder-screen";

export const metadata: Metadata = {
  title: "Tomorrow",
};

export default function TomorrowPage() {
  return (
    <PlaceholderScreen
      title="Tomorrow"
      line="Lay it out tonight so morning-you already knows."
      cta="Plan tomorrow."
    />
  );
}
