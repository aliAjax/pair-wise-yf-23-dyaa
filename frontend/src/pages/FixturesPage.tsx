import { useEffect } from "react";
import { BoomBarStrip } from "../components/common/BoomBarStrip";
import { EmptyState } from "../components/common/EmptyState";
import { RiggingConflictPanel } from "../components/common/RiggingConflictPanel";
import { RiggingFormTable } from "../components/common/RiggingFormTable";
import { StatCard } from "../components/common/StatCard";
import { RiggingStatusText } from "../constants/RiggingStatus";
import { useRiggingReview } from "../hooks/useRiggingReview";
import { useRiggingStore } from "../stores/RiggingStore";
import { formatDate } from "../utils/formatters";

export function FixturesPage() {
  const { items, status, updatedAt, notice, loading, hydrate, addItem, updateItem, removeItem, submit, dismissNotice } =
    useRiggingStore();
  const review = useRiggingReview(items);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const conflictCodes = new Set(review.conflicts.flatMap((conflict) => conflict.fixture_codes));

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">rigging review</p>
          <h1>吊挂复核台</h1>
          <p className="sub">同一吊杆灯中心间距不足 80cm 或总重超过 650kg 时仅存草稿，已入库灯位与场景引用不受影响。</p>
        </div>
        <div className="head-side">
          {status && <span className={`badge rig-status ${status === "DRAFT" ? "draft" : "committed"}`}>{RiggingStatusText[status]}</span>}
          {updatedAt && <time>最近摆放 {formatDate(updatedAt)}</time>}
        </div>
      </header>

      {notice && (
        <div className={`notice ${status === "DRAFT" ? "warn" : "ok"}`} onClick={dismissNotice}>
          {notice}
        </div>
      )}

      <section className="metrics">
        <StatCard label="录入灯位" value={items.length} />
        <StatCard label="占用吊杆" value={review.bar_stats.length} />
        <StatCard label="复核冲突" value={review.conflicts.length} />
      </section>

      {loading && items.length === 0 ? (
        <EmptyState title="正在读取浏览器中保存的摆放…" />
      ) : (
        <section className="workbench rigging-layout">
          <div className="panel-col">
            <RiggingFormTable
              items={items}
              conflicts={review.conflicts}
              onAdd={addItem}
              onChange={updateItem}
              onRemove={removeItem}
            />
            <BoomBarStrip items={items} barStats={review.bar_stats} conflicts={review.conflicts} />
          </div>
          <div className="side-col">
            <RiggingConflictPanel conflicts={review.conflicts} />
            <div className="panel submit-panel">
              <h2>提交复核</h2>
              <p>
                规则：同杆相邻灯中心间距 ≥ 80cm，单杆总重 ≤ 650kg。
                {!review.passed && " 未通过时本次摆放只留作草稿，冲突灯具已在下方标出。"}
              </p>
              <div className="conflict-codes">
                {Array.from(conflictCodes).map((code) => (
                  <span key={code} className="chip danger">{code}</span>
                ))}
              </div>
              <button type="button" className="btn primary" onClick={() => void submit()}>
                {review.passed ? "复核通过并写入浏览器" : "保存为草稿"}
              </button>
            </div>
          </div>
        </section>
      )}
    </section>
  );
}
