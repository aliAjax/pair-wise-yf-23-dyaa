import { LOG_TEMPLATES } from "../constants/logTemplates";
import { RIGGING_DRAFT_STORAGE_KEY, RIGGING_LAYOUT_STORAGE_KEY } from "../constants/Rigging";
import { mockData } from "../mocks/seedData";
import type { RiggingEntry } from "../types/Rigging";

export interface RiggingLayoutSnapshot {
  savedAt: string;
  entries: RiggingEntry[];
}

const readJson = <T,>(key: string): T | null => {
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    // 本地存储不可用时回退到种子数据，保证复核台仍可打开。
    return null;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 写入失败时只记录日志，页面内状态仍然保留。
    console.warn("rigging storage write failed", key);
  }
};

export async function loadRiggingLayout(): Promise<RiggingLayoutSnapshot> {
  const snapshot = readJson<RiggingLayoutSnapshot>(RIGGING_LAYOUT_STORAGE_KEY);
  if (snapshot && Array.isArray(snapshot.entries)) return snapshot;
  return { savedAt: "", entries: (mockData.rigging as unknown as RiggingEntry[]).map((entry) => ({ ...entry })) };
}

export async function saveRiggingLayout(entries: RiggingEntry[]): Promise<RiggingLayoutSnapshot> {
  const snapshot: RiggingLayoutSnapshot = { savedAt: new Date().toISOString(), entries };
  writeJson(RIGGING_LAYOUT_STORAGE_KEY, snapshot);
  console.info(LOG_TEMPLATES.Rigging[2], entries.length);
  return snapshot;
}

export async function loadRiggingDrafts(): Promise<RiggingEntry[]> {
  return readJson<RiggingEntry[]>(RIGGING_DRAFT_STORAGE_KEY) ?? [];
}

export async function saveRiggingDrafts(entries: RiggingEntry[]): Promise<RiggingEntry[]> {
  writeJson(RIGGING_DRAFT_STORAGE_KEY, entries);
  return entries;
}
