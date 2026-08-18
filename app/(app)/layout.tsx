import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/nav/app-header";
import { AppNav } from "@/components/nav/app-nav";
import { auth } from "@/lib/auth";
import { catchUp } from "@/lib/jobs/catch-up";
import { logicalTomorrow } from "@/lib/logical-clock";

export default async function AppShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  const now = new Date();
  const { logicalDate: todayIso } = await catchUp(now);
  const tomorrowIso = logicalTomorrow(now);

  return (
    <div className="app-shell">
      <AppNav />
      <div className="app-shell__column">
        <div className="app-shell__content">
          <AppHeader todayIso={todayIso} tomorrowIso={tomorrowIso} />
          {children}
        </div>
      </div>
    </div>
  );
}

