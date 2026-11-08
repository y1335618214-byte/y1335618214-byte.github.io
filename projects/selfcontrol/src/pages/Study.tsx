import type { StudyProject, StudyRecord, AnyRecord } from "../domain/types";
import type { FormTarget } from "../components/RecordForm";
import { durationText } from "../domain/dates";
import { sumMinutes } from "../domain/statistics";
import RecordList from "../components/RecordList";
export default function Study({
  date,
  setDate,
  projects,
  records,
  onAdd,
  onEdit,
  onDelete,
}: {
  date: string;
  setDate: (d: string) => void;
  projects: StudyProject[];
  records: StudyRecord[];
  onAdd: (t: FormTarget) => void;
  onEdit: (r: AnyRecord) => void;
  onDelete: (r: AnyRecord) => void;
}) {
  const day = records.filter((r) => r.date === date);
  return (
    <>
      <p className="eyebrow">LEARN A LITTLE, EVERY DAY</p>
      <h1>学习记录</h1>
      <label className="date-picker">
        记录日期
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
        />
      </label>
      <div className="project-grid">
        {projects
          .filter((p) => !p.archived)
          .map((p, i) => {
            const rows = day.filter((r) => r.project_id === p.id);
            const quantities = new Map<string, number>();
            rows.forEach((r) => {
              if (r.quantity !== undefined)
                quantities.set(
                  r.unit,
                  (quantities.get(r.unit) || 0) + r.quantity,
                );
            });
            return (
              <article className="project-card" key={p.id}>
                <div className="row">
                  <span className="project-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <small>{p.fixed ? "每日项目" : "自定义"}</small>
                </div>
                <h2>{p.name}</h2>
                <p>
                  {durationText(sumMinutes(rows))}
                  <small> · {rows.length} 条记录</small>
                </p>
                {quantities.size > 0 && (
                  <p className="muted">
                    {[...quantities]
                      .map(([u, q]) => `${Number(q.toFixed(6))} ${u}`)
                      .join(" / ")}
                  </p>
                )}
                <button
                  className="secondary"
                  aria-label={`记录${p.name}`}
                  onClick={() => onAdd({ project: p, date })}
                >
                  ＋ 记录
                </button>
              </article>
            );
          })}
      </div>
      <p className="hint">自定义项目可在「我的 → 项目管理」中添加。</p>
      <div className="section-heading">
        <h2>当日明细</h2>
        <span>{day.length} 条</span>
      </div>
      <RecordList records={day} onEdit={onEdit} onDelete={onDelete} />
    </>
  );
}
