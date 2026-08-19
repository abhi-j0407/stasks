"use client";

import { useEffect, useId } from "react";
import { LipButton } from "@/components/buttons/lip-button";

type ConfirmSheetProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmSheet({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className="confirm-sheet-scrim" onClick={onCancel}>
      <div
        className="confirm-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="confirm-sheet__title">
          {title}
        </h2>
        <p id={bodyId} className="confirm-sheet__body">
          {body}
        </p>
        <div className="confirm-sheet__actions">
          <LipButton
            variant="ghost"
            className="lip-button--block"
            autoFocus
            onClick={onCancel}
          >
            {cancelLabel}
          </LipButton>
          <LipButton
            variant="destructive"
            className="lip-button--block"
            onClick={onConfirm}
          >
            {confirmLabel}
          </LipButton>
        </div>
      </div>
    </div>
  );
}
