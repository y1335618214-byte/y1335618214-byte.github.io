import type { AnyRecord } from "../domain/types";
import { durationText } from "../domain/dates";
export default function RecordList({
  records,
  onEdit,
  onDelete,
  empty = "还没有记录，从今天的一小步开始。",
}: {
  records: AnyRecord[];
  onEdit: (r: AnyRecord) => void;
  onDelete: (r: AnyRecord) => void;
  empty?: string;
}) {
  if (!records.length)
    return (
      <div className="empty">
        <span>○</span>
        <p>{empty}</p>
      </div>
    );
  return (
    <div className="record-list">
      {[...records]
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            b.created_at.localeCompare(a.created_at),
        )
        .map((r) => {
          const study = "project_id" in r;
          const name = study ? r.project_name : r.activity_name;
          const details = study
            ? [
                ["章节", r.chapters],
                ["内容", r.content],
                ["学到了", r.learned],
                ["待掌握", r.unmastered],
                ["后续任务", r.next_tasks],
              ]
            : [
                ["训练内容", r.content],
                ["训练感受", r.feeling],
                ["备注", r.notes],
              ];
          return (
            <article className="record" key={r.id}>
              <div className="row">
                <div>
                  <small>
                    {r.date} · {study ? "学习" : r.group}
                  </small>
                  <h3>{name}</h3>
                </div>
                <strong className="minutes">
                  {durationText(r.duration_minutes)}
                </strong>
              </div>
              {study && r.quantity !== undefined && (
                <p className="quantity">
                  {r.quantity} {r.unit}
                </p>
              )}
              {details
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <p className="detail" key={label}>
                    <span>{label}</span>
                    {value}
                  </p>
                ))}
              <div className="record-actions">
                <button onClick={() => onEdit(r)} aria-label={`编辑${name}`}>
                  编辑
                </button>
                <button onClick={() => onDelete(r)} aria-label={`删除${name}`}>
                  删除
                </button>
              </div>
            </article>
          );
        })}
    </div>
  );
}
