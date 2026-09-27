import { useEffect, useMemo } from "react";
import { useRiggingStore } from "../stores/RiggingStore";
import { summarizeBattens } from "../utils/riggingCheck";

export function useRiggingReview() {
  const store = useRiggingStore();
  const { load } = store;
  useEffect(() => {
    void load();
  }, [load]);
  const all = useMemo(() => [...store.placed, ...store.drafts], [store.placed, store.drafts]);
  const battens = useMemo(() => summarizeBattens(all), [all]);
  const conflictIds = useMemo(() => {
    const ids = new Set<number>();
    for (const conflict of store.conflicts) {
      ids.add(conflict.aId);
      ids.add(conflict.bId);
    }
    return ids;
  }, [store.conflicts]);
  const nextId = useMemo(() => all.reduce((max, entry) => Math.max(max, entry.id), 0) + 1, [all]);
  return { ...store, all, battens, conflictIds, nextId };
}
