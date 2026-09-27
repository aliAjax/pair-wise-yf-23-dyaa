export const RiggingStatus = ["PLACED","DRAFT"] as const;
export type RiggingStatus = (typeof RiggingStatus)[number];
export const RiggingStatusText: Record<RiggingStatus, string> = Object.fromEntries(RiggingStatus.map((value) => [value, value.replace(/_/g, " ")])) as Record<RiggingStatus, string>;
