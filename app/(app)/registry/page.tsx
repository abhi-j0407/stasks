import type { Metadata } from "next";
import { PlaceholderScreen } from "../placeholder-screen";

export const metadata: Metadata = {
  title: "Registry",
};

export default function RegistryPage() {
  return (
    <PlaceholderScreen
      title="Registry"
      line="Park the pile. It can wait without guilt."
      cta="Park it for later."
    />
  );
}
