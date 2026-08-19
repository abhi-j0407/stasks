import { db } from "@/lib/db";
import { withNeonRetry } from "@/lib/db/retry";
import { todayOccupancy } from "@/lib/db/schema";

export async function recordTodayOccupancy(row: {
  userId: string;
  taskId: string;
  logicalDate: string;
}): Promise<void> {
  await withNeonRetry(() =>
    db.insert(todayOccupancy).values(row).onConflictDoNothing(),
  );
}
