import { useMemo } from "react";
import type { RiggingItem, RiggingReview } from "../types/Rigging";
import { reviewRiggingLayout } from "../utils/riggingCheck";

// 吊挂复核实时结果：间距不足 80cm、单杆总重超 650kg 即不通过
export function useRiggingReview(items: RiggingItem[]): RiggingReview {
  return useMemo(() => reviewRiggingLayout(items), [items]);
}
