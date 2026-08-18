import type { TaskCategory } from "@/lib/tasks/split-by-category";

type AddRowProps = {
  category: TaskCategory;
};

export function AddRow({ category }: AddRowProps) {
  const placeholder =
    category === "personal" ? "Add a personal task" : "Add a work task";

  return (
    <div className="add-row">
      <input
        className="add-row__input"
        type="text"
        placeholder={placeholder}
        disabled
        readOnly
        aria-label={placeholder}
        title="Adding comes later"
      />
    </div>
  );
}
