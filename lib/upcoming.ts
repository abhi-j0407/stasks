import { addLogicalDays } from "./logical-clock";

export const UPCOMING_CHIP = "UPCOMING";

type TaskLocation = "today" | "tomorrow" | "registry";

export function isUpcoming(input: {
  location: TaskLocation;
  plannedDate: string | null;
  t: string;
}): boolean {
  if (input.location !== "registry" || input.plannedDate == null) {
    return false;
  }

  return (
    input.plannedDate === addLogicalDays(input.t, 1) ||
    input.plannedDate === addLogicalDays(input.t, 2)
  );
}
