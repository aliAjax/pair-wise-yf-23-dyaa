// 吊挂复核台硬性规则：同一吊杆中心间距下限（厘米）、总重上限（公斤）
export const RIGGING_RULES = {
  MIN_SPACING_CM: 80,
  MAX_BAR_WEIGHT_KG: 650
} as const;

// 整杆布局写入浏览器的 localStorage 键位
export const RIGGING_STORAGE_KEYS = {
  COMMITTED: "stage-light:rigging-layout",
  DRAFT: "stage-light:rigging-draft"
} as const;
