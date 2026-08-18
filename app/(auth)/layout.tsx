import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <div className="app-shell__column">
        <div className="app-shell__content auth-screen">{children}</div>
      </div>
    </div>
  );
}
