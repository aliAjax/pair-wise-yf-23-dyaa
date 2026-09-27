import { FixtureType } from "../../constants/FixtureType";
import type { RiggingConflict, RiggingItem } from "../../types/Rigging";

type Props = {
  items: RiggingItem[];
  conflicts: RiggingConflict[];
  onAdd: () => void;
  onChange: (id: number, patch: Partial<Omit<RiggingItem, "id">>) => void;
  onRemove: (id: number) => void;
};

const conflictCodesOn = (conflicts: RiggingConflict[], bar: string) =>
  new Set(
    conflicts
      .filter((conflict) => conflict.boom_bar === bar)
      .flatMap((conflict) => conflict.fixture_codes)
  );

export function RiggingFormTable({ items, conflicts, onAdd, onChange, onRemove }: Props) {
  return (
    <div className="panel rigging-form">
      <div className="panel-head">
        <h2>灯位录入</h2>
        <button type="button" className="btn" onClick={onAdd}>+ 新增灯位</button>
      </div>
      {items.length === 0 ? (
        <div className="empty">尚未录入灯具，点击「新增灯位」开始吊挂复核</div>
      ) : (
        <div className="table-scroll">
          <table className="rig-table">
            <thead>
              <tr>
                <th>灯具编号</th>
                <th>类型</th>
                <th>吊杆</th>
                <th>横向位置(cm)</th>
                <th>重量(kg)</th>
                <th>功率(W)</th>
                <th aria-label="操作" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const bad = conflictCodesOn(conflicts, item.boom_bar).has(item.fixture_code) && item.fixture_code !== "";
                return (
                  <tr key={item.id} className={bad ? "conflict-row" : ""}>
                    <td>
                      <input
                        value={item.fixture_code}
                        placeholder="如 P-01"
                        onChange={(event) => onChange(item.id, { fixture_code: event.target.value })}
                      />
                    </td>
                    <td>
                      <select
                        value={item.fixture_type}
                        onChange={(event) => onChange(item.id, { fixture_type: event.target.value })}
                      >
                        {FixtureType.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        value={item.boom_bar}
                        placeholder="如 1号吊杆"
                        onChange={(event) => onChange(item.id, { boom_bar: event.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.position_x}
                        onChange={(event) => onChange(item.id, { position_x: Number(event.target.value) })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.weight_kg}
                        onChange={(event) => onChange(item.id, { weight_kg: Number(event.target.value) })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.power_w}
                        onChange={(event) => onChange(item.id, { power_w: Number(event.target.value) })}
                      />
                    </td>
                    <td>
                      <button type="button" className="btn-link danger" onClick={() => onRemove(item.id)}>删除</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
