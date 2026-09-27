import { create } from "zustand";
import { commitRiggingLayout, loadRiggingDraft, loadRiggingLayout, retainRiggingDraft } from "../api/Rigging";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { createDefaultRiggingItem } from "../constructors/RiggingConstructor";
import type { RiggingConflict, RiggingItem, RiggingLayoutStatus } from "../types/Rigging";
import { reviewRiggingLayout } from "../utils/riggingCheck";

type RiggingState = {
  items: RiggingItem[];
  status: RiggingLayoutStatus | null;
  updatedAt: string | null;
  conflicts: RiggingConflict[];
  loading: boolean;
  notice: string | null;
  hydrate: () => Promise<void>;
  addItem: () => void;
  updateItem: (id: number, patch: Partial<Omit<RiggingItem, "id">>) => void;
  removeItem: (id: number) => void;
  submit: () => Promise<boolean>;
  dismissNotice: () => void;
};

export const useRiggingStore = create<RiggingState>((set, get) => ({
  items: [],
  status: null,
  updatedAt: null,
  conflicts: [],
  loading: false,
  notice: null,

  // 切换页面回来：优先恢复最近一次摆放（草稿优先于已入库布局）
  async hydrate() {
    set({ loading: true });
    const draft = await loadRiggingDraft();
    const committed = await loadRiggingLayout();
    const latest = draft ?? committed;
    set({
      items: latest ? latest.items : [],
      status: latest ? latest.status : null,
      updatedAt: latest ? latest.updated_at : null,
      conflicts: latest && latest.status === "DRAFT" ? reviewRiggingLayout(latest.items).conflicts : [],
      notice: draft ? "当前为未通过复核的草稿，已保存灯位未受影响" : null,
      loading: false
    });
  },

  addItem() {
    set((state) => ({ items: [...state.items, createDefaultRiggingItem()], notice: null }));
    console.info(LOG_TEMPLATES.Rigging[0]);
  },

  updateItem(id, patch) {
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      notice: null
    }));
  },

  removeItem(id) {
    set((state) => ({ items: state.items.filter((item) => item.id !== id), notice: null }));
  },

  // 吊挂复核：通过才整杆入库；不通过只留草稿，已保存灯位和场景引用照旧
  async submit() {
    const { items } = get();
    const review = reviewRiggingLayout(items);
    if (review.passed) {
      const layout = await commitRiggingLayout(items);
      set({ status: layout.status, updatedAt: layout.updated_at, conflicts: [], notice: "复核通过，整杆布局已写入浏览器" });
      return true;
    }
    const layout = await retainRiggingDraft(items);
    set({ status: layout.status, updatedAt: layout.updated_at, conflicts: review.conflicts, notice: null });
    return false;
  },

  dismissNotice() {
    set({ notice: null });
  }
}));
