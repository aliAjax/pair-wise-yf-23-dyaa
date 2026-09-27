import type { RiggingStatus } from "./RiggingStatus";

export interface RiggingEntry {
  id: number;
  fixture_code: string;
  fixture_type: string;
  batten: string;
  position_cm: number;
  weight_kg: number;
  power_w: number;
  status: RiggingStatus;
}

export interface RiggingConflict {
  code: string;
  batten: string;
  aId: number;
  bId: number;
  a: string;
  b: string;
  detail: string;
  spacingCm?: number;
  totalKg?: number;
}

export interface BattenSummary {
  batten: string;
  count: number;
  totalKg: number;
  minSpacingCm: number | null;
  overloaded: boolean;
}
