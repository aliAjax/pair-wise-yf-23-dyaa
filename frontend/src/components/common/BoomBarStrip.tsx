import { RIGGING_RULES } from "../../constants/RiggingRules";
import type { RiggingBarStat, RiggingConflict, RiggingItem } from "../../types/Rigging";
import { formatPowerW, formatWeightKg } from "../../utils/formatters";

type Props = {
  items: RiggingItem[];
  barStats: RiggingBarStat[];
  conflicts: RiggingConflict[];
};

const STRIP_WIDTH_PX = 560;
const PAD_PX = 24;

export function BoomBarStrip({ items, barStats, conflicts }: Props) {
  const maxX = Math.max(RIGGING_RULES.MIN_SPACING_CM, ...items.map((item) => item.position_x), 0);
  const toLeft = (x: number) => PAD_PX + (maxX === 0 ? 0 : (x / maxX) * (STRIP_WIDTH_PX - PAD_PX * 2));

  const spacingPairs = new Set(
    conflicts
      .filter((conflict) => conflict.type === "SPACING")
      .map((conflict) => `${conflict.boom_bar}__${conflict.fixture_codes.join("__")}`)
  );

  return (
    <div className="panel">
      <h2>整杆布局示意</h2>
      {barStats.length === 0 ? (
        <div className="empty">录入灯位后按吊杆展示占位</div>
      ) : (
        <div className="bars">
          {barStats.map((stat) => {
            const onBar = items.filter((item) => item.boom_bar === stat.boom_bar);
            const sorted = [...onBar].sort((a, b) => a.position_x - b.position_x);
            const badCodes = new Set(
              conflicts.filter((c) => c.boom_bar === stat.boom_bar).flatMap((c) => c.fixture_codes)
            );
            return (
              <div key={stat.boom_bar} className={`bar ${stat.overweight ? "overweight" : ""}`}>
                <div className="bar-meta">
                  <strong>{stat.boom_bar}</strong>
                  <span className={stat.overweight ? "warn" : ""}>
                    总重 {formatWeightKg(stat.total_weight_kg)} / {RIGGING_RULES.MAX_BAR_WEIGHT_KG}
                  </span>
                  <span>功率 {formatPowerW(stat.total_power_w)}</span>
                  <span>{stat.count} 台</span>
                </div>
                <div className="bar-strip" style={{ width: STRIP_WIDTH_PX }}>
                  {sorted.slice(1).map((item, index) => {
                    const prev = sorted[index];
                    const pairKey = `${item.boom_bar}__${prev.fixture_code}__${item.fixture_code}`;
                    const close = spacingPairs.has(pairKey);
                    if (!close) return null;
                    const left = toLeft(prev.position_x);
                    const width = toLeft(item.position_x) - left;
                    return <span key={pairKey} className="clash-arc" style={{ left, width }} title={`${prev.fixture_code} ↔ ${item.fixture_code} 间距不足`} />;
                  })}
                  {sorted.map((item) => (
                    <span
                      key={item.id}
                      className={`fixture-dot ${badCodes.has(item.fixture_code) ? "danger" : ""}`}
                      style={{ left: toLeft(item.position_x) }}
                      title={`${item.fixture_code} · ${item.fixture_type} · ${item.position_x}cm`}
                    >
                      <i />
                      <em>{item.fixture_code}</em>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
