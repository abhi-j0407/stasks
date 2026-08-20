import type { NextRequest } from "next/server";
import { catchUp } from "@/lib/jobs/catch-up";
import { isAuthorizedCron } from "@/lib/jobs/cron-auth";

async function handle(request: NextRequest) {
  if (!isAuthorizedCron(request.headers.get("authorization"))) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const { logicalDate } = await catchUp(new Date());
  return Response.json({ ok: true, logicalDate });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
