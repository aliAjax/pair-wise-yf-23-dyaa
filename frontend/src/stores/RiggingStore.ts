import { create } from "zustand";
import { loadRiggingDrafts, loadRiggingLayout, saveRiggingDrafts, saveRiggingLayout } from "../api/Rigging";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { RiggingConflict, RiggingEntry } from "../types/Rigging";
import { checkRiggingLayout } from "../utils/riggingCheck";

type State = {
  placed: RiggingEntry[];
  drafts: RiggingEntry[];
  conflicts: RiggingConflict[];
  lastSavedAt: string;
  loading: boolean;
  load: () => Promise<void>;
  addDraft: (entry: RiggingEntry) => Promise<void>;
  updateDraft: (entry: RiggingEntry) => Promise<void>;
  removeDraft: (id: number) => Promise<void>;
  review: () => Promise<boolean>;
};

export const useRiggingStore = create<State>((set, get) => ({
  placed: [],
  drafts: [],
  conflicts: [],
  lastSavedAt: "",
  loading: false,
  async load() {
    set({ loading: true });
    try {
      const [snapshot, drafts] = await Promise.all([loadRiggingLayout(), loadRiggingDrafts()]);
      set({ placed: snapshot.entries, lastSavedAt: snapshot.savedAt, drafts, conflicts: [], loading: false });
    } catch (error) {
      console.error("load Rigging failed", error);
      set({ loading: false });
    }
  },
  async addDraft(entry) {
    const drafts = [...get().drafts, { ...entry, status: "DRAFT" as const }];
    set({ drafts, conflicts: [] });
    await saveRiggingDrafts(drafts);
  },
  async updateDraft(entry) {
    const drafts = get().drafts.map((row) => (row.id === entry.id ? { ...entry, status: "DRAFT" as const } : row));
    set({ drafts, conflicts: [] });
    await saveRiggingDrafts(drafts);
  },
  async removeDraft(id) {
    const drafts = get().drafts.filter((row) => row.id !== id);
    set({ drafts, conflicts: [] });
    console.info(LOG_TEMPLATES.Rigging[3], id);
    await saveRiggingDrafts(drafts);
  },
  async review() {
    const { placed, drafts } = get();
    const candidate = [...placed, ...drafts];
    const conflicts = checkRiggingLayout(candidate);
    if (conflicts.length > 0) {
      // 复核未通过：本次摆放只留作草稿，已保存灯位与场景引用照旧。
      set({ conflicts });
      console.warn(LOG_TEMPLATES.Rigging[1], conflicts.length);
      await saveRiggingDrafts(drafts);
      return false;
    }
    const entries = candidate.map((entry) => ({ ...entry, status: "PLACED" as const }));
    const snapshot = await saveRiggingLayout(entries);
    await saveRiggingDrafts([]);
    console.info(LOG_TEMPLATES.Rigging[0], entries.length);
    set({ placed: entries, drafts: [], conflicts: [], lastSavedAt: snapshot.savedAt });
    return true;
  }
}));
