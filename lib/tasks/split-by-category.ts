export type TaskCategory = "personal" | "work";

export function splitByCategory<T extends { category: TaskCategory }>(
  items: T[],
): { personal: T[]; work: T[] } {
  const personal: T[] = [];
  const work: T[] = [];

  for (const item of items) {
    if (item.category === "personal") {
      personal.push(item);
    } else {
      work.push(item);
    }
  }

  return { personal, work };
}
