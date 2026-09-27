import type { RiggingItem, RiggingLayout } from "../types/Rigging";

let riggingSeq = 1;

// 表单空行：录入编号、类型、吊杆、横向位置（厘米）、重量（公斤）、功率（瓦）
export const createDefaultRiggingItem = (overrides: Partial<RiggingItem> = {}): RiggingItem => ({
  id: Date.now() + riggingSeq++,
  fixture_code: "",
  fixture_type: "PAR",
  boom_bar: "1号吊杆",
  position_x: 0,
  weight_kg: 0,
  power_w: 0,
  ...overrides
});

export const createRiggingForm = createDefaultRiggingItem;

export const createRiggingLayout = (
  items: RiggingItem[],
  status: RiggingLayout["status"],
  overrides: Partial<RiggingLayout> = {}
): RiggingLayout => ({
  items,
  status,
  updated_at: new Date().toISOString(),
  ...overrides
});

export const createRiggingResponse = createRiggingLayout;
