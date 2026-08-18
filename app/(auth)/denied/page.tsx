import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Not this account",
};

export default async function DeniedPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/today");
  }

  return (
    <main>
      <h1 className="text-headline">This list isn&apos;t for that account.</h1>
      <p className="auth-screen__line">
        stasks is personal. That Google isn&apos;t on the list. No hard
        feelings.
      </p>
      <Link href="/signin" className="auth-screen__link">
        Use a different account
      </Link>
    </main>
  );
}
