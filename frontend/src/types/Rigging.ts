// 吊挂复核台单台灯位录入项：编号、类型、吊杆、横向位置、重量、功率
export interface RiggingItem {
  id: number;
  fixture_code: string;
  fixture_type: string;
  boom_bar: string;
  position_x: number;
  weight_kg: number;
  power_w: number;
}

export type RiggingConflictType = "SPACING" | "OVERWEIGHT" | "DUPLICATE_CODE";

export interface RiggingConflict {
  type: RiggingConflictType;
  boom_bar: string;
  fixture_codes: string[];
  message: string;
}

export interface RiggingBarStat {
  boom_bar: string;
  total_weight_kg: number;
  total_power_w: number;
  count: number;
  overweight: boolean;
}

export interface RiggingReview {
  passed: boolean;
  conflicts: RiggingConflict[];
  bar_stats: RiggingBarStat[];
}

export type RiggingLayoutStatus = "DRAFT" | "COMMITTED";

export interface RiggingLayout {
  items: RiggingItem[];
  status: RiggingLayoutStatus;
  updated_at: string;
}
