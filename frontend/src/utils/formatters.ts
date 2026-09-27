export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const fillTemplate = (template: string, params: Record<string, string | number>) => Object.entries(params).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
export const formatCm = (value: number) => `${formatNumber(value)} cm`;
export const formatKg = (value: number) => `${formatNumber(value)} kg`;
export const formatWatt = (value: number) => `${formatNumber(value)} W`;
