import type {
  ExerciseActivity,
  ExerciseRecord,
  AnyRecord,
} from "../domain/types";
import type { FormTarget } from "../components/RecordForm";
import RecordList from "../components/RecordList";
export default function Exercise({
  date,
  setDate,
  activities,
  records,
  onAdd,
  onEdit,
  onDelete,
}: {
  date: string;
  setDate: (d: string) => void;
  activities: ExerciseActivity[];
  records: ExerciseRecord[];
  onAdd: (t: FormTarget) => void;
  onEdit: (r: AnyRecord) => void;
  onDelete: (r: AnyRecord) => void;
}) {
  return (
    <>
      <p className="eyebrow">MOVE YOUR BODY, CLEAR YOUR MIND</p>
      <h1>运动记录</h1>
      <label className="date-picker">
        记录日期
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
        />
      </label>
      {(["健身", "体育项目"] as const).map((group) => (
        <section key={group}>
          <div className="section-heading">
            <h2>{group}</h2>
            <span>{group === "健身" ? "力量与体能" : "热爱与活力"}</span>
          </div>
          <div className="activity-grid">
            {activities
              .filter((a) => a.group === group && !a.archived)
              .map((a) => (
                <button
                  className="activity"
                  key={a.id}
                  aria-label={`记录${a.name}`}
                  onClick={() => onAdd({ activity: a, date })}
                >
                  <strong>{a.name}</strong>
                  <span>＋</span>
                </button>
              ))}
          </div>
          {!activities.some((a) => a.group === group && !a.archived) && (
            <p className="hint">
              还没有活动，在「我的 → 项目管理」添加你的第一项运动。
            </p>
          )}
          <RecordList
            records={records.filter(
              (r) => r.date === date && r.group === group,
            )}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </section>
      ))}
    </>
  );
}
