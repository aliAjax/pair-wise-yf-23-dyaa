import { ERROR_MESSAGES } from "../constants/errorMessages";
import { RIGGING_RULES } from "../constants/RiggingRules";
import type { RiggingBarStat, RiggingConflict, RiggingItem, RiggingReview } from "../types/Rigging";

const fill = (template: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template);

export function groupByBar(items: RiggingItem[]): Map<string, RiggingItem[]> {
  const groups = new Map<string, RiggingItem[]>();
  for (const item of items) {
    const list = groups.get(item.boom_bar) ?? [];
    list.push(item);
    groups.set(item.boom_bar, list);
  }
  return groups;
}

function checkDuplicateCodes(items: RiggingItem[]): RiggingConflict[] {
  const seen = new Map<string, number>();
  const conflicts: RiggingConflict[] = [];
  items.forEach((item, index) => {
    if (item.fixture_code === "") return;
    const prev = seen.get(item.fixture_code);
    if (prev !== undefined) {
      conflicts.push({
        type: "DUPLICATE_CODE",
        boom_bar: item.boom_bar,
        fixture_codes: [item.fixture_code],
        message: `灯具编号「${item.fixture_code}」重复录入（第 ${prev + 1} 行与第 ${index + 1} 行）`
      });
    } else {
      seen.set(item.fixture_code, index);
    }
  });
  return conflicts;
}

function checkBarSpacing(bar: string, rows: RiggingItem[]): RiggingConflict[] {
  const sorted = [...rows].sort((a, b) => a.position_x - b.position_x);
  const conflicts: RiggingConflict[] = [];
  for (let i = 1; i < sorted.length; i += 1) {
    const gap = sorted[i].position_x - sorted[i - 1].position_x;
    if (gap < RIGGING_RULES.MIN_SPACING_CM) {
      conflicts.push({
        type: "SPACING",
        boom_bar: bar,
        fixture_codes: [sorted[i - 1].fixture_code, sorted[i].fixture_code],
        message: fill(ERROR_MESSAGES.RIGGING_SPACING_CONFLICT, {
          bar,
          a: sorted[i - 1].fixture_code,
          b: sorted[i].fixture_code,
          gap
        })
      });
    }
  }
  return conflicts;
}

export function buildBarStats(items: RiggingItem[]): RiggingBarStat[] {
  return Array.from(groupByBar(items).entries()).map(([boom_bar, rows]) => {
    const total_weight_kg = rows.reduce((sum, row) => sum + row.weight_kg, 0);
    return {
      boom_bar,
      total_weight_kg,
      total_power_w: rows.reduce((sum, row) => sum + row.power_w, 0),
      count: rows.length,
      overweight: total_weight_kg > RIGGING_RULES.MAX_BAR_WEIGHT_KG
    };
  });
}

export function reviewRiggingLayout(items: RiggingItem[]): RiggingReview {
  const conflicts = checkDuplicateCodes(items);
  for (const [bar, rows] of groupByBar(items)) {
    conflicts.push(...checkBarSpacing(bar, rows));
    const total_weight_kg = rows.reduce((sum, row) => sum + row.weight_kg, 0);
    if (total_weight_kg > RIGGING_RULES.MAX_BAR_WEIGHT_KG) {
      conflicts.push({
        type: "OVERWEIGHT",
        boom_bar: bar,
        fixture_codes: rows.map((row) => row.fixture_code),
        message: fill(ERROR_MESSAGES.RIGGING_OVERWEIGHT, { bar, weight: total_weight_kg })
      });
    }
  }
  return { passed: conflicts.length === 0, conflicts, bar_stats: buildBarStats(items) };
}
