import { LOG_TEMPLATES } from "../constants/logTemplates";
import { RIGGING_STORAGE_KEYS } from "../constants/RiggingRules";
import { createRiggingLayout } from "../constructors/RiggingConstructor";
import type { RiggingItem, RiggingLayout } from "../types/Rigging";

// 吊挂复核台为纯本地存储：草稿与已入库（committed）布局分键存放，互不覆盖。
const readLayout = (key: string): RiggingLayout | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as RiggingLayout) : null;
  } catch {
    return null;
  }
};

const writeLayout = (key: string, layout: RiggingLayout) => {
  localStorage.setItem(key, JSON.stringify(layout));
};

export async function loadRiggingLayout(): Promise<RiggingLayout | null> {
  return readLayout(RIGGING_STORAGE_KEYS.COMMITTED);
}

export async function loadRiggingDraft(): Promise<RiggingLayout | null> {
  return readLayout(RIGGING_STORAGE_KEYS.DRAFT);
}

// 复核通过：整杆布局正式写入浏览器，旧草稿清除
export async function commitRiggingLayout(items: RiggingItem[]): Promise<RiggingLayout> {
  const layout = createRiggingLayout(items, "COMMITTED");
  writeLayout(RIGGING_STORAGE_KEYS.COMMITTED, layout);
  localStorage.removeItem(RIGGING_STORAGE_KEYS.DRAFT);
  console.info(LOG_TEMPLATES.Rigging[1], layout.updated_at);
  console.info(LOG_TEMPLATES.Rigging[3], RIGGING_STORAGE_KEYS.COMMITTED);
  return layout;
}

// 复核失败：本次摆放只留作草稿，已保存的灯位与场景引用照旧
export async function retainRiggingDraft(items: RiggingItem[]): Promise<RiggingLayout> {
  const layout = createRiggingLayout(items, "DRAFT");
  writeLayout(RIGGING_STORAGE_KEYS.DRAFT, layout);
  console.warn(LOG_TEMPLATES.Rigging[2], layout.updated_at);
  return layout;
}
