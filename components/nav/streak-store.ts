import type { CelebrationKind } from "@/lib/streak";

export type StreakSnapshot = {
  current: number | null;
  play: CelebrationKind;
};

let snapshot: StreakSnapshot = {
  current: null,
  play: "none",
};

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function setStreak(next: {
  current: number;
  play: CelebrationKind;
}) {
  snapshot = next;
  emit();
}

export function subscribeStreak(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getStreakSnapshot() {
  return snapshot;
}
