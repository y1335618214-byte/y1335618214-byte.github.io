import decoration from "../assets/home-decoration.png";
import type { StudyRecord, ExerciseRecord, AnyRecord } from "../domain/types";
import { durationText } from "../domain/dates";
import { sumMinutes } from "../domain/statistics";
import RecordList from "../components/RecordList";
export default function Home({
  today,
  study,
  exercise,
  onEdit,
  onDelete,
  onNavigate,
}: {
  today: string;
  study: StudyRecord[];
  exercise: ExerciseRecord[];
  onEdit: (r: AnyRecord) => void;
  onDelete: (r: AnyRecord) => void;
  onNavigate: (p: string) => void;
}) {
  const s = study.filter((r) => r.date === today),
    e = exercise.filter((r) => r.date === today);
  return (
    <>
      <div className="page-heading">
        <div>
          <h1 className="home-quote">
            The theory is gray,but
            <br />
            the tree of life is ever green.
          </h1>
          <p className="muted">{today.replaceAll("-", " / ")} · 做你想做的</p>
        </div>
        <img
          className="home-decoration"
          src={decoration}
          alt=""
          aria-hidden="true"
        />
      </div>
      <div className="summary-grid">
        <button
          className="summary study-summary"
          onClick={() => onNavigate("学习")}
        >
          <span>
            今日学习 <span aria-hidden="true">↗</span>
          </span>
          <strong data-testid="study-total">
            {durationText(sumMinutes(s))}
          </strong>
          <small>{s.length} 条记录 · 包含 STR 项目</small>
        </button>
        <button
          className="summary exercise-summary"
          onClick={() => onNavigate("运动")}
        >
          <span>
            今日运动 <span aria-hidden="true">↗</span>
          </span>
          <strong data-testid="exercise-total">
            {durationText(sumMinutes(e))}
          </strong>
          <small>{e.length} 次训练 · 身心一起成长</small>
        </button>
      </div>
      <div className="section-heading">
        <h2>今日学习</h2>
        <button className="text-button" onClick={() => onNavigate("学习")}>
          ＋ 记一笔
        </button>
      </div>
      <RecordList records={s} onEdit={onEdit} onDelete={onDelete} />
      <div className="section-heading">
        <h2>今日运动</h2>
        <button className="text-button" onClick={() => onNavigate("运动")}>
          ＋ 记一次
        </button>
      </div>
      <RecordList records={e} onEdit={onEdit} onDelete={onDelete} />
      <p className="footnote">不必每天都完美，只要每天都向前。</p>
    </>
  );
}
