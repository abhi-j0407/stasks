"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  useDndContext,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  defaultAnimateLayoutChanges,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createContext,
  useContext,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "@/components/feedback/toast-store";
import { setStreak } from "@/components/nav/streak-store";
import { AddRow } from "@/components/tasks/add-row";
import { TaskRow } from "@/components/tasks/task-row";
import { clearOverdue } from "@/lib/actions/clear-overdue";
import { completeTask } from "@/lib/actions/complete-task";
import { deleteTask, restoreDeletedTask } from "@/lib/actions/delete-task";
import { moveTask } from "@/lib/actions/move-task";
import { reorderTasks } from "@/lib/actions/reorder-tasks";
import { updatePlannedDate } from "@/lib/actions/update-planned-date";
import { celebrationKind } from "@/lib/streak";
import { COMPLETE_TOAST } from "@/lib/tasks/complete-task";
import { DELETE_TOAST } from "@/lib/tasks/delete-task";
import type { TaskLocation, TaskRowData } from "@/lib/tasks/queries";
import {
  applyReorderPatches,
  planReorder,
  resolveDropTarget,
  sameTaskOrder,
} from "@/lib/tasks/reorder-tasks";
import {
  splitByCategory,
  type TaskCategory,
} from "@/lib/tasks/split-by-category";

type Activation = "pointer" | "keyboard";

const ActivationContext = createContext<Activation | null>(null);

const snapDrop = { duration: 0, easing: "linear" } as const;

const collisionDetection: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  const collisions = pointer.length > 0 ? pointer : closestCorners(args);
  const overItem = collisions.find(
    (collision) => collision.id !== "personal" && collision.id !== "work",
  );
  return overItem ? [overItem] : collisions;
};

type SortableTaskListProps = {
  tasks: TaskRowData[];
  location: TaskLocation;
  todayIso: string;
};

export function SortableTaskList({
  tasks,
  location,
  todayIso,
}: SortableTaskListProps) {
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(tasks);
  const [draft, setDraft] = useState<TaskRowData[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activation, setActivation] = useState<Activation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const items = draft ?? optimisticTasks;
  const startRef = useRef(items);
  const completeTimer = useRef<number | null>(null);
  const { personal, work } = splitByCategory(items);
  const activeTask = activeId
    ? items.find((task) => task.id === activeId)
    : undefined;

  useEffect(() => {
    return () => {
      if (completeTimer.current !== null) {
        window.clearTimeout(completeTimer.current);
      }
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    startRef.current = items;
    setActiveId(String(event.active.id));
    setActivation(
      event.activatorEvent instanceof KeyboardEvent ? "keyboard" : "pointer",
    );
    setError(null);
    setDraft(items);
  }

  function handleDragOver(event: DragOverEvent) {
    if (!event.over) {
      return;
    }
    const activeId = String(event.active.id);
    const overId = String(event.over.id);
    setDraft((current) => {
      if (!current) {
        return current;
      }
      const next = previewMove(current, activeId, overId);
      if (!next || sameTaskOrder(current, next)) {
        return current;
      }
      return next;
    });
  }

  function handleDragCancel() {
    setDraft(null);
    setActiveId(null);
    setActivation(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id);
    const origin = startRef.current;
    let next = origin;
    if (event.over) {
      const previewed = previewMove(origin, taskId, String(event.over.id));
      if (previewed) {
        next = previewed;
      }
    }
    const from = positionOf(origin, taskId);
    const to = positionOf(next, taskId);

    setDraft(null);
    setActiveId(null);
    setActivation(null);

    if (
      !from ||
      !to ||
      (from.toCategory === to.toCategory && from.toIndex === to.toIndex)
    ) {
      return;
    }

    startTransition(async () => {
      setOptimisticTasks(next);
      const result = await reorderTasks({
        taskId,
        location,
        toCategory: to.toCategory,
        toIndex: to.toIndex,
      });
      if (!result.ok) {
        setError(result.message);
      }
    });
  }

  function persistComplete(taskId: string, next: TaskRowData[]) {
    setCompletingId(null);
    startTransition(async () => {
      setOptimisticTasks(next);
      const result = await completeTask({ taskId });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setStreak({
        current: result.current,
        play: celebrationKind(result.firstOfDay, result.current),
      });
      toast({ message: COMPLETE_TOAST, tone: "complete" });
    });
  }

  function handleToggleComplete(taskId: string, keyboard: boolean) {
    if (activeId || completingId || isPending) {
      return;
    }

    const next = items.filter((task) => task.id !== taskId);
    setError(null);

    const skipMotion =
      keyboard ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (skipMotion) {
      persistComplete(taskId, next);
      return;
    }

    setCompletingId(taskId);
    completeTimer.current = window.setTimeout(() => {
      persistComplete(taskId, next);
    }, 200);
  }

  function handleDelete(taskId: string) {
    if (activeId || completingId) {
      return;
    }

    const next = items.filter((task) => task.id !== taskId);
    setError(null);
    startTransition(async () => {
      setOptimisticTasks(next);
      const result = await deleteTask({ taskId });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      toast({
        message: DELETE_TOAST,
        tone: "delete",
        actionLabel: "Undo",
        durationMs: 5000,
        onAction: () => {
          startTransition(async () => {
            const restored = await restoreDeletedTask({
              snapshot: result.snapshot,
            });
            if (!restored.ok) {
              setError(restored.message);
            }
          });
        },
      });
    });
  }

  function handleLocationMove(taskId: string, toLocation: TaskLocation) {
    if (activeId || completingId) {
      return;
    }

    const next = items.filter((task) => task.id !== taskId);
    setError(null);
    startTransition(async () => {
      setOptimisticTasks(next);
      const result = await moveTask({
        taskId,
        fromLocation: location,
        toLocation,
      });
      if (!result.ok) {
        setError(result.message);
      }
    });
  }

  function handleClearOverdue(taskId: string) {
    if (activeId || completingId) {
      return;
    }

    const next = items.map((task) =>
      task.id === taskId ? { ...task, overdue: false } : task,
    );
    setError(null);
    startTransition(async () => {
      setOptimisticTasks(next);
      const result = await clearOverdue({ taskId });
      if (!result.ok) {
        setError(result.message);
      }
    });
  }

  function handlePlannedDateChange(taskId: string, plannedDate: string | null) {
    if (activeId || completingId) {
      return;
    }

    const current = items.find((task) => task.id === taskId);
    if (!current || current.plannedDate === plannedDate) {
      return;
    }

    const next = items.map((task) =>
      task.id === taskId ? { ...task, plannedDate } : task,
    );
    setError(null);
    startTransition(async () => {
      setOptimisticTasks(next);
      const result = await updatePlannedDate({ taskId, plannedDate });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      if (result.location !== "registry") {
        setOptimisticTasks(next.filter((task) => task.id !== taskId));
      }
    });
  }

  return (
    <ActivationContext.Provider value={activation}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        accessibility={{ announcements: listAnnouncements(items) }}
      >
        <div
          className={
            activeId ? "task-list task-list--dragging" : "task-list"
          }
        >
          {error ? (
            <p className="task-list__error" aria-live="polite">
              {error}
            </p>
          ) : null}
          <CategorySection
            category="personal"
            tasks={personal}
            location={location}
            todayIso={todayIso}
            completingId={completingId}
            pending={isPending}
            onMove={handleLocationMove}
            onDelete={handleDelete}
            onClearOverdue={handleClearOverdue}
            onPlannedDateChange={handlePlannedDateChange}
            onToggleComplete={handleToggleComplete}
          />
          <CategorySection
            category="work"
            tasks={work}
            location={location}
            todayIso={todayIso}
            completingId={completingId}
            pending={isPending}
            onMove={handleLocationMove}
            onDelete={handleDelete}
            onClearOverdue={handleClearOverdue}
            onPlannedDateChange={handlePlannedDateChange}
            onToggleComplete={handleToggleComplete}
          />
        </div>
        <DragOverlay dropAnimation={snapDrop}>
          {activeTask ? (
            <OverlayTile
              task={activeTask}
              activation={activation}
              todayIso={todayIso}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </ActivationContext.Provider>
  );
}

type CategorySectionProps = {
  category: TaskCategory;
  tasks: TaskRowData[];
  location: TaskLocation;
  todayIso: string;
  completingId: string | null;
  pending: boolean;
  onMove: (taskId: string, toLocation: TaskLocation) => void;
  onDelete: (taskId: string) => void;
  onClearOverdue: (taskId: string) => void;
  onPlannedDateChange: (taskId: string, plannedDate: string | null) => void;
  onToggleComplete: (taskId: string, keyboard: boolean) => void;
};

function OverlayTile({
  task,
  activation,
  todayIso,
}: {
  task: TaskRowData;
  activation: Activation | null;
  todayIso: string;
}) {
  const { activeNodeRect } = useDndContext();

  return (
    <div
      className={
        activation === "keyboard"
          ? "task-row-overlay task-row-overlay--keyboard"
          : "task-row-overlay"
      }
      style={
        activeNodeRect?.width ? { width: activeNodeRect.width } : undefined
      }
    >
      <TaskRow task={task} todayIso={todayIso} />
    </div>
  );
}

function CategorySection({
  category,
  tasks,
  location,
  todayIso,
  completingId,
  pending,
  onMove,
  onDelete,
  onClearOverdue,
  onPlannedDateChange,
  onToggleComplete,
}: CategorySectionProps) {
  const { setNodeRef } = useDroppable({ id: category });
  const title = category === "personal" ? "Personal" : "Work";
  const headingId = `list-${category}`;
  const ids = tasks.map((task) => task.id);

  return (
    <section className="task-section" aria-labelledby={headingId}>
      <h2
        id={headingId}
        className={
          category === "personal"
            ? "task-section__title task-section__title--personal"
            : "task-section__title task-section__title--work"
        }
      >
        {title}
      </h2>
      <div className="task-section__rows" ref={setNodeRef}>
        <SortableContext
          id={category}
          items={ids}
          strategy={verticalListSortingStrategy}
        >
          <div className="task-section__items">
            {tasks.map((task) => (
              <SortableTaskRow
                key={task.id}
                task={task}
                todayIso={todayIso}
                completing={completingId === task.id}
                pending={pending}
                onMove={onMove}
                onDelete={onDelete}
                onClearOverdue={onClearOverdue}
                onPlannedDateChange={onPlannedDateChange}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </SortableContext>
        <AddRow category={category} location={location} />
      </div>
    </section>
  );
}

function SortableTaskRow({
  task,
  todayIso,
  completing,
  pending,
  onMove,
  onDelete,
  onClearOverdue,
  onPlannedDateChange,
  onToggleComplete,
}: {
  task: TaskRowData;
  todayIso: string;
  completing: boolean;
  pending: boolean;
  onMove: (taskId: string, toLocation: TaskLocation) => void;
  onDelete: (taskId: string) => void;
  onClearOverdue: (taskId: string) => void;
  onPlannedDateChange: (taskId: string, plannedDate: string | null) => void;
  onToggleComplete: (taskId: string, keyboard: boolean) => void;
}) {
  const activation = useContext(ActivationContext);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    animateLayoutChanges: (args) =>
      activation === "keyboard" ? false : defaultAnimateLayoutChanges(args),
    transition:
      activation === "keyboard" ? { duration: 0, easing: "linear" } : undefined,
  });

  return (
    <div
      ref={setNodeRef}
      className={
        isDragging
          ? "task-row-sortable task-row-sortable--active"
          : "task-row-sortable"
      }
      style={{
        transform: CSS.Translate.toString(transform),
        transition: activation === "keyboard" ? "none" : transition,
      }}
    >
      <TaskRow
        task={task}
        todayIso={todayIso}
        completing={completing}
        completePending={pending}
        showMoves
        movesPending={pending}
        onMove={(toLocation) => onMove(task.id, toLocation)}
        onDelete={() => onDelete(task.id)}
        onClearOverdue={() => onClearOverdue(task.id)}
        onPlannedDateChange={(plannedDate) =>
          onPlannedDateChange(task.id, plannedDate)
        }
        onToggleComplete={({ keyboard }) =>
          onToggleComplete(task.id, keyboard)
        }
        handleRef={setActivatorNodeRef}
        handleAttributes={attributes}
        handleListeners={listeners}
      />
    </div>
  );
}

function previewMove(
  items: TaskRowData[],
  activeId: string,
  overId: string,
): TaskRowData[] | null {
  const move = resolveDropTarget(items, activeId, overId);
  if (!move) {
    return null;
  }
  const patches = planReorder(
    items.map(({ id, category }) => ({ id, category })),
    move,
  );
  if (!patches) {
    return null;
  }
  return applyReorderPatches(items, patches);
}

function positionOf(items: TaskRowData[], taskId: string) {
  const item = items.find((task) => task.id === taskId);
  if (!item) {
    return null;
  }
  const dest = items.filter((task) => task.category === item.category);
  return {
    toCategory: item.category,
    toIndex: dest.findIndex((task) => task.id === taskId),
  };
}

function listAnnouncements(items: TaskRowData[]) {
  function titleOf(id: UniqueIdentifier) {
    if (id === "personal") {
      return "Personal";
    }
    if (id === "work") {
      return "Work";
    }
    return items.find((task) => task.id === id)?.title ?? "a task";
  }

  return {
    onDragStart({ active }: { active: { id: UniqueIdentifier } }) {
      return `Picked up ${titleOf(active.id)}.`;
    },
    onDragOver({
      active,
      over,
    }: {
      active: { id: UniqueIdentifier };
      over: { id: UniqueIdentifier } | null;
    }) {
      if (!over) {
        return;
      }
      return `Moved ${titleOf(active.id)} over ${titleOf(over.id)}.`;
    },
    onDragEnd({
      active,
      over,
    }: {
      active: { id: UniqueIdentifier };
      over: { id: UniqueIdentifier } | null;
    }) {
      if (!over) {
        return `Dropped ${titleOf(active.id)}.`;
      }
      return `Dropped ${titleOf(active.id)} in ${titleOf(over.id)}.`;
    },
    onDragCancel({ active }: { active: { id: UniqueIdentifier } }) {
      return `Reorder cancelled. ${titleOf(active.id)} stayed put.`;
    },
  };
}
