import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/nav/app-nav";
import { auth } from "@/lib/auth";

export default async function AppShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="app-shell">
      <AppNav />
      <div className="app-shell__column">
        <div className="app-shell__content">{children}</div>
      </div>
    </div>
  );
}
