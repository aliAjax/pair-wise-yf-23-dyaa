import { MIN_SPACING_CM } from "../../constants/Rigging";
import type { RiggingEntry } from "../../types/Rigging";

export function RiggingBattenView({ entries, conflictIds }: { entries: RiggingEntry[]; conflictIds?: Set<number> }) {
  const sorted = [...entries].sort((a, b) => a.position_cm - b.position_cm);
  const last = sorted[sorted.length - 1];
  const span = Math.max(600, Math.ceil(((last?.position_cm ?? 0) + 100) / 100) * 100);
  return (
    <div className="batten-view">
      <div className="batten-track">
        <div className="batten-rod" />
        {sorted.map((entry) => (
          <div
            key={entry.id}
            className={["batten-fixture", entry.status === "DRAFT" ? "draft" : "", conflictIds?.has(entry.id) ? "conflict" : ""].filter(Boolean).join(" ")}
            style={{ left: `${(entry.position_cm / span) * 100}%` }}
            title={`${entry.fixture_code} · ${entry.position_cm}cm · ${entry.weight_kg}kg · ${entry.power_w}W`}
          >
            <span className="dot" />
            <span className="tag">{entry.fixture_code}</span>
          </div>
        ))}
        {sorted.slice(1).map((entry, index) => {
          const prev = sorted[index];
          const gap = entry.position_cm - prev.position_cm;
          const mid = (prev.position_cm + entry.position_cm) / 2;
          return (
            <span key={`gap-${entry.id}`} className={"gap-label" + (gap < MIN_SPACING_CM ? " bad" : "")} style={{ left: `${(mid / span) * 100}%` }}>
              {gap}cm
            </span>
          );
        })}
      </div>
      <div className="batten-scale"><span>0cm</span><span>{span}cm</span></div>
    </div>
  );
}
