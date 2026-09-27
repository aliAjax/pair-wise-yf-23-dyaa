export const RiggingStatus = ["DRAFT", "COMMITTED"] as const;
export type RiggingStatus = (typeof RiggingStatus)[number];
export const RiggingStatusText: Record<RiggingStatus, string> = {
  DRAFT: "草稿",
  COMMITTED: "已入库"
};
