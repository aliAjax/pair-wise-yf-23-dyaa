import { useEffect, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { RiggingBattenView } from "../components/common/RiggingBattenView";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { FixtureType } from "../constants/FixtureType";
import { MAX_LOAD_KG, MIN_SPACING_CM } from "../constants/Rigging";
import { RiggingStatusText } from "../constants/RiggingStatus";
import { createRiggingForm } from "../constructors/RiggingConstructor";
import { useRiggingReview } from "../hooks/useRiggingReview";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { formatCm, formatDate, formatKg, formatWatt } from "../utils/formatters";

const toNumber = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);

export function FixturesPage() {
  const review = useRiggingReview();
  const cueScenes = useCueSceneStore((state) => state.rows);
  const loadCueScenes = useCueSceneStore((state) => state.load);
  const [form, setForm] = useState(() => createRiggingForm());
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void loadCueScenes();
  }, [loadCueScenes]);

  const handleAdd = () => {
    const fixture_code = form.fixture_code.trim();
    const batten = form.batten.trim();
    if (!fixture_code || !batten) {
      setFormError(ERROR_MESSAGES.VALIDATION_FAILED);
      return;
    }
    setFormError("");
    setSaved(false);
    void review.addDraft({ ...form, fixture_code, batten, id: review.nextId, status: "DRAFT" });
    setForm(createRiggingForm({ batten, fixture_type: form.fixture_type, position_cm: form.position_cm + MIN_SPACING_CM }));
  };

  const handleReview = async () => {
    setSaved(false);
    const ok = await review.review();
    if (ok) setSaved(true);
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>灯具布置 · 吊挂复核台</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" />
      </section>

      <section className="metrics">
        <StatCard label="吊杆" value={review.battens.length} />
        <StatCard label="已保存灯位" value={review.placed.length} />
        <StatCard label="待复核草稿" value={review.drafts.length} />
      </section>

      {review.conflicts.length > 0 && (
        <section className="conflict-banner">
          <strong>复核未通过：本次摆放只留作草稿，已保存灯位与场景引用照旧。</strong>
          <ul>
            {review.conflicts.map((conflict, index) => (
              <li key={`${conflict.code}-${index}`}>
                {conflict.detail}　<strong>冲突灯：{conflict.a} ↔ {conflict.b}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="workbench">
        <div className="stack">
          <div className="panel wide">
            <h2>吊杆布局总览</h2>
            <p className="hint">
              规则：同一吊杆灯中心间距 ≥ {MIN_SPACING_CM}cm，总重 ≤ {MAX_LOAD_KG}kg。
              最后保存：{review.lastSavedAt ? formatDate(review.lastSavedAt) : "尚未保存（当前为种子数据）"}
            </p>
            {review.battens.length === 0 && <EmptyState title="暂无灯位，请从右侧录入" />}
            {review.battens.map((summary) => (
              <div key={summary.batten} className="batten-block">
                <div className="batten-head">
                  <strong>{summary.batten}</strong>
                  <span>{summary.count} 盏</span>
                  <span className={summary.overloaded ? "bad-text" : ""}>总重 {formatKg(summary.totalKg)} / {formatKg(MAX_LOAD_KG)}</span>
                  <span className={summary.minSpacingCm !== null && summary.minSpacingCm < MIN_SPACING_CM ? "bad-text" : ""}>
                    最小间距 {summary.minSpacingCm === null ? "—" : formatCm(summary.minSpacingCm)}
                  </span>
                </div>
                <RiggingBattenView entries={review.all.filter((entry) => entry.batten === summary.batten)} conflictIds={review.conflictIds} />
              </div>
            ))}
          </div>

          <div className="panel wide">
            <h2>灯位明细</h2>
            {review.all.length === 0 && <EmptyState title="暂无灯位" />}
            {review.all.length > 0 && (
              <table className="rigging-table">
                <thead>
                  <tr><th>编号</th><th>类型</th><th>吊杆</th><th>横向位置</th><th>重量</th><th>功率</th><th>状态</th><th>操作</th></tr>
                </thead>
                <tbody>
                  {review.all.map((entry) => (
                    <tr key={entry.id} className={review.conflictIds.has(entry.id) ? "conflict-row" : ""}>
                      <td>{entry.fixture_code}</td>
                      <td>{entry.fixture_type}</td>
                      <td>{entry.batten}</td>
                      <td>
                        {entry.status === "DRAFT"
                          ? <input type="number" min={0} value={entry.position_cm} onChange={(event) => void review.updateDraft({ ...entry, position_cm: toNumber(event.target.valueAsNumber) })} />
                          : formatCm(entry.position_cm)}
                      </td>
                      <td>
                        {entry.status === "DRAFT"
                          ? <input type="number" min={0} value={entry.weight_kg} onChange={(event) => void review.updateDraft({ ...entry, weight_kg: toNumber(event.target.valueAsNumber) })} />
                          : formatKg(entry.weight_kg)}
                      </td>
                      <td>{formatWatt(entry.power_w)}</td>
                      <td><StatusBadge value={RiggingStatusText[entry.status]} /></td>
                      <td>{entry.status === "DRAFT" && <button className="danger" onClick={() => void review.removeDraft(entry.id)}>删除</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <h2>录入灯具</h2>
            <div className="form-grid">
              <label>编号
                <input value={form.fixture_code} placeholder="如 FX-104" onChange={(event) => setForm({ ...form, fixture_code: event.target.value })} />
              </label>
              <label>类型
                <select value={form.fixture_type} onChange={(event) => setForm({ ...form, fixture_type: event.target.value })}>
                  {FixtureType.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label>吊杆
                <input list="batten-list" value={form.batten} onChange={(event) => setForm({ ...form, batten: event.target.value })} />
                <datalist id="batten-list">
                  {review.battens.map((summary) => <option key={summary.batten} value={summary.batten} />)}
                </datalist>
              </label>
              <label>横向位置（cm）
                <input type="number" min={0} value={form.position_cm} onChange={(event) => setForm({ ...form, position_cm: toNumber(event.target.valueAsNumber) })} />
              </label>
              <label>重量（kg）
                <input type="number" min={0} value={form.weight_kg} onChange={(event) => setForm({ ...form, weight_kg: toNumber(event.target.valueAsNumber) })} />
              </label>
              <label>功率（W）
                <input type="number" min={0} value={form.power_w} onChange={(event) => setForm({ ...form, power_w: toNumber(event.target.valueAsNumber) })} />
              </label>
              <button className="primary" onClick={handleAdd}>加入本次摆放（草稿）</button>
              {formError && <p className="bad-text">{formError}</p>}
            </div>
          </div>

          <div className="panel">
            <h2>复核与保存</h2>
            <p className="hint">草稿 {review.drafts.length} 盏待复核；通过后整杆布局写入浏览器，切换页面不丢失。</p>
            <button className="primary" disabled={review.loading} onClick={() => void handleReview()}>复核并保存整杆布局</button>
            {saved && <p className="ok-text">复核通过，整杆布局已写入浏览器。</p>}
          </div>

          <div className="panel">
            <h2>场景引用</h2>
            <p className="hint">{cueScenes.length} 个场景 Cue 正在引用灯位；草稿与冲突不影响已保存灯位和场景引用。</p>
            {cueScenes.slice(0, 3).map((scene) => (
              <div key={scene.id} className="row"><strong>{scene.name}</strong><StatusBadge value={scene.scene_status} /></div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
