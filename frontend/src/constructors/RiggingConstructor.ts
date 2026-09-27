import type { RiggingEntry } from "../types/Rigging";

export const createDefaultRiggingEntry = (overrides: Partial<RiggingEntry> = {}): RiggingEntry => ({
  id: 0,
  fixture_code: "",
  fixture_type: "SPOT",
  batten: "1号吊杆",
  position_cm: 0,
  weight_kg: 0,
  power_w: 0,
  status: "DRAFT",
  ...overrides
});

export const createRiggingForm = createDefaultRiggingEntry;
export const createRiggingResponse = createDefaultRiggingEntry;
