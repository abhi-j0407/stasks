"use client";

import { useRef, useState, useTransition } from "react";
import { createTask } from "@/lib/actions/create-task";
import type { TaskLocation } from "@/lib/tasks/create-task-input";
import type { TaskCategory } from "@/lib/tasks/split-by-category";

type AddRowProps = {
  category: TaskCategory;
  location: TaskLocation;
};

export function AddRow({ category, location }: AddRowProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const placeholder =
    category === "personal" ? "Add a personal task" : "Add a work task";
  const showNotes = title.trim().length > 0;

  function handleAction(formData: FormData) {
    const trimmed = String(formData.get("title") ?? "").trim();
    if (!trimmed || isPending) {
      return;
    }

    const snapshot = { title, notes };
    setTitle("");
    setNotes("");
    setError(null);

    startTransition(async () => {
      const result = await createTask(formData);

      if (!result.ok) {
        setTitle((current) => (current === "" ? snapshot.title : current));
        setNotes((current) => (current === "" ? snapshot.notes : current));
        setError(result.message);
      }

      titleRef.current?.focus();
    });
  }

  const errorId = `add-row-error-${location}-${category}`;

  return (
    <form
      className={error ? "add-row add-row--error" : "add-row"}
      action={handleAction}
      autoComplete="off"
    >
      <input type="hidden" name="location" value={location} />
      <input type="hidden" name="category" value={category} />
      <input
        ref={titleRef}
        className="add-row__input"
        type="text"
        name="title"
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          if (error) {
            setError(null);
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        enterKeyHint="done"
      />
      {showNotes ? (
        <input
          className="add-row__input add-row__notes"
          type="text"
          name="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notes"
          aria-label="Notes"
          enterKeyHint="done"
        />
      ) : null}
      {error ? (
        <p id={errorId} className="add-row__error" aria-live="polite">
          {error}
        </p>
      ) : null}
    </form>
  );
}
