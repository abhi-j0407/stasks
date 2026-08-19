"use client";

import { useId, useState } from "react";
import { ConfirmSheet } from "@/components/feedback/confirm-sheet";
import { LipButton } from "@/components/buttons/lip-button";
import {
  destinationsFor,
  MOVE_LABEL,
  moveButtonVariant,
  type TaskLocation,
} from "@/lib/tasks/move-task";
import {
  DELETE_CONFIRM,
  DELETE_CONFIRM_BODY,
  DELETE_CONFIRM_TITLE,
  DELETE_KEEP,
} from "@/lib/tasks/delete-task";
import { CLEAR_LABEL } from "@/lib/tasks/clear-overdue";

type TaskRowMovesProps = {
  title: string;
  fromLocation: TaskLocation;
  disabled?: boolean;
  showMoves?: boolean;
  showClearOverdue?: boolean;
  onMove?: (toLocation: TaskLocation) => void;
  onClearOverdue?: () => void;
  onDelete?: () => void;
};

export function TaskRowMoves({
  title,
  fromLocation,
  disabled = false,
  showMoves = true,
  showClearOverdue = false,
  onMove,
  onClearOverdue,
  onDelete,
}: TaskRowMovesProps) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const panelId = useId();
  const destinations = showMoves && onMove ? destinationsFor(fromLocation) : [];
  const hasPanel =
    destinations.length > 0 ||
    Boolean(onDelete) ||
    (showClearOverdue && Boolean(onClearOverdue));

  if (!hasPanel) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="task-row__overflow"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Actions for ${title}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="task-row__overflow-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
      {open ? (
        <div className="task-row__moves" id={panelId}>
          {destinations.map((toLocation) => (
            <LipButton
              key={toLocation}
              variant={moveButtonVariant(toLocation)}
              className="lip-button--block"
              disabled={disabled}
              onClick={() => onMove?.(toLocation)}
            >
              {MOVE_LABEL[toLocation]}
            </LipButton>
          ))}
          {showClearOverdue && onClearOverdue ? (
            <LipButton
              variant="ghost"
              className="lip-button--block"
              disabled={disabled}
              onClick={() => {
                setOpen(false);
                onClearOverdue();
              }}
            >
              {CLEAR_LABEL}
            </LipButton>
          ) : null}
          {onDelete ? (
            <LipButton
              variant="destructive"
              className="lip-button--block"
              disabled={disabled}
              onClick={() => setConfirmDelete(true)}
            >
              {DELETE_CONFIRM}
            </LipButton>
          ) : null}
        </div>
      ) : null}
      <ConfirmSheet
        open={confirmDelete}
        title={DELETE_CONFIRM_TITLE}
        body={DELETE_CONFIRM_BODY}
        confirmLabel={DELETE_CONFIRM}
        cancelLabel={DELETE_KEEP}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          setOpen(false);
          onDelete?.();
        }}
      />
    </>
  );
}
