export type ToastTone = "complete" | "delete";

export type ToastInput = {
  message: string;
  tone: ToastTone;
  actionLabel?: string;
  durationMs?: number;
  onAction?: () => void;
};

export type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
  actionLabel?: string;
  durationMs: number;
  onAction?: () => void;
};

let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function toast(input: ToastInput): string {
  const id = crypto.randomUUID();
  toasts = [
    ...toasts,
    {
      id,
      message: input.message,
      tone: input.tone,
      actionLabel: input.actionLabel,
      durationMs: input.durationMs ?? 3000,
      onAction: input.onAction,
    },
  ];
  emit();
  return id;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToastSnapshot() {
  return toasts;
}
