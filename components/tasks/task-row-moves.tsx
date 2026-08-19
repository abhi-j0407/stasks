"use client";

import { useId, useState } from "react";
import { LipButton } from "@/components/buttons/lip-button";
import {
  destinationsFor,
  MOVE_LABEL,
  moveButtonVariant,
  type TaskLocation,
} from "@/lib/tasks/move-task";

type TaskRowMovesProps = {
  title: string;
  fromLocation: TaskLocation;
  disabled?: boolean;
  onMove: (toLocation: TaskLocation) => void;
};

export function TaskRowMoves({
  title,
  fromLocation,
  disabled = false,
  onMove,
}: TaskRowMovesProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const destinations = destinationsFor(fromLocation);

  return (
    <>
      <button
        type="button"
        className="task-row__overflow"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Move actions for ${title}`}
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
              onClick={() => onMove(toLocation)}
            >
              {MOVE_LABEL[toLocation]}
            </LipButton>
          ))}
        </div>
      ) : null}
    </>
  );
}
