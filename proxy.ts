import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const publicPaths = new Set(["/signin", "/denied"]);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const loggedIn = Boolean(req.auth?.user);

  if (loggedIn && publicPaths.has(pathname)) {
    return NextResponse.redirect(new URL("/today", req.nextUrl));
  }

  if (!loggedIn && !publicPaths.has(pathname)) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icons/|sw.js|manifest.webmanifest).*)",
  ],
};
