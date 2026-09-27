import type { RiggingConflict } from "../../types/Rigging";

const TYPE_LABEL: Record<RiggingConflict["type"], string> = {
  SPACING: "碰肩间距",
  OVERWEIGHT: "吊杆超重",
  DUPLICATE_CODE: "编号重复"
};

export function RiggingConflictPanel({ conflicts }: { conflicts: RiggingConflict[] }) {
  return (
    <div className="panel conflict-panel">
      <h2>复核结果</h2>
      {conflicts.length === 0 ? (
        <p className="pass-line">当前摆放未发现冲突，提交后整杆布局将写入浏览器。</p>
      ) : (
        <ul className="conflict-list">
          {conflicts.map((conflict, index) => (
            <li key={`${conflict.type}-${index}`}>
              <span className="conflict-tag">{TYPE_LABEL[conflict.type]}</span>
              <span className="conflict-bar">{conflict.boom_bar}</span>
              {conflict.type !== "OVERWEIGHT" && conflict.fixture_codes.length === 2 && (
                <span className="conflict-pair">{conflict.fixture_codes[0]} ⇄ {conflict.fixture_codes[1]}</span>
              )}
              <p>{conflict.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
