import type { ReactNode } from "react";
import { AppNav } from "@/components/nav/app-nav";

export default function AppShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <AppNav />
      <div className="app-shell__column">
        <div className="app-shell__content">{children}</div>
      </div>
    </div>
  );
}
