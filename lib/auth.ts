import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

function isAllowlisted(email: string | null | undefined): boolean {
  const allowed = process.env.AUTH_ALLOWLIST_EMAIL?.trim().toLowerCase();
  const got = email?.trim().toLowerCase();
  return Boolean(allowed && got && allowed === got);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile?.email_verified !== true) {
        return "/denied";
      }

      if (!isAllowlisted(user.email)) {
        return "/denied";
      }

      return true;
    },
  },
});
