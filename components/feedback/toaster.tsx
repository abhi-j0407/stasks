"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  dismissToast,
  getToastSnapshot,
  subscribeToasts,
  type ToastItem,
} from "@/components/feedback/toast-store";

export function Toaster() {
  const toasts = useSyncExternalStore(
    subscribeToasts,
    getToastSnapshot,
    getToastSnapshot,
  );

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-host" aria-live="polite">
      {toasts.map((item) => (
        <ToastCard key={item.id} toast={item} />
      ))}
    </div>
  );
}

function ToastCard({ toast: item }: { toast: ToastItem }) {
  const remainingMs = useRef(item.durationMs);
  const lastTick = useRef(0);

  useEffect(() => {
    lastTick.current = Date.now();

    const interval = window.setInterval(() => {
      const now = Date.now();
      if (document.hidden) {
        lastTick.current = now;
        return;
      }
      remainingMs.current -= now - lastTick.current;
      lastTick.current = now;
      if (remainingMs.current <= 0) {
        dismissToast(item.id);
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [item.id]);

  const className =
    item.tone === "delete" ? "toast toast--delete" : "toast toast--complete";

  return (
    <div className={className} role="status">
      <p className="toast__message">{item.message}</p>
      {item.actionLabel && item.onAction ? (
        <button
          type="button"
          className="toast__action"
          onClick={() => {
            item.onAction?.();
            dismissToast(item.id);
          }}
        >
          {item.actionLabel}
        </button>
      ) : null}
    </div>
  );
}
