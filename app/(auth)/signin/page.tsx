import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LipButton } from "@/components/buttons/lip-button";
import { auth, signIn } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/today");
  }

  return (
    <main>
      <h1 className="text-headline">stasks</h1>
      <p className="auth-screen__line">
        Plan tonight. Sign in with the Google this list belongs to.
      </p>
      <form
        className="auth-screen__cta"
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/today" });
        }}
      >
        <LipButton type="submit" variant="primary" className="lip-button--block">
          Sign in with Google
        </LipButton>
      </form>
    </main>
  );
}
