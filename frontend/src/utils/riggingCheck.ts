import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { MAX_LOAD_KG, MIN_SPACING_CM } from "../constants/Rigging";
import type { BattenSummary, RiggingConflict, RiggingEntry } from "../types/Rigging";
import { fillTemplate } from "./formatters";

export const groupByBatten = (entries: RiggingEntry[]) => {
  const groups = new Map<string, RiggingEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.batten) ?? [];
    list.push(entry);
    groups.set(entry.batten, list);
  }
  return groups;
};

export function checkRiggingLayout(entries: RiggingEntry[]): RiggingConflict[] {
  const conflicts: RiggingConflict[] = [];
  for (const [batten, list] of groupByBatten(entries)) {
    const sorted = [...list].sort((a, b) => a.position_cm - b.position_cm);
    for (let i = 1; i < sorted.length; i += 1) {
      const prev = sorted[i - 1];
      const current = sorted[i];
      const spacing = current.position_cm - prev.position_cm;
      if (spacing < MIN_SPACING_CM) {
        conflicts.push({
          code: ERROR_CODES.RIGGING_SPACING_CONFLICT,
          batten,
          aId: prev.id,
          bId: current.id,
          a: prev.fixture_code,
          b: current.fixture_code,
          spacingCm: spacing,
          detail: fillTemplate(ERROR_MESSAGES.RIGGING_SPACING_CONFLICT, { batten, a: prev.fixture_code, b: current.fixture_code, spacing })
        });
      }
    }
    const totalKg = sorted.reduce((sum, entry) => sum + entry.weight_kg, 0);
    if (totalKg > MAX_LOAD_KG) {
      const heaviest = [...sorted].sort((a, b) => b.weight_kg - a.weight_kg);
      const first = heaviest[0];
      const second = heaviest[1] ?? heaviest[0];
      conflicts.push({
        code: ERROR_CODES.RIGGING_OVERLOAD,
        batten,
        aId: first.id,
        bId: second.id,
        a: first.fixture_code,
        b: second.fixture_code,
        totalKg,
        detail: fillTemplate(ERROR_MESSAGES.RIGGING_OVERLOAD, { batten, total: totalKg, a: first.fixture_code, b: second.fixture_code })
      });
    }
  }
  return conflicts;
}

export function summarizeBattens(entries: RiggingEntry[]): BattenSummary[] {
  return [...groupByBatten(entries)].map(([batten, list]) => {
    const sorted = [...list].sort((a, b) => a.position_cm - b.position_cm);
    let minSpacingCm: number | null = null;
    for (let i = 1; i < sorted.length; i += 1) {
      const spacing = sorted[i].position_cm - sorted[i - 1].position_cm;
      minSpacingCm = minSpacingCm === null ? spacing : Math.min(minSpacingCm, spacing);
    }
    const totalKg = list.reduce((sum, entry) => sum + entry.weight_kg, 0);
    return { batten, count: list.length, totalKg, minSpacingCm, overloaded: totalKg > MAX_LOAD_KG };
  });
}
