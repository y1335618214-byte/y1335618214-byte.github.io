import { useState } from "react";
import type { StudyRecord, ExerciseRecord, AnyRecord } from "../domain/types";
import {
  dateObject,
  localDate,
  shiftDate,
  durationText,
} from "../domain/dates";
import { periodBounds, summarize } from "../domain/statistics";
import RecordList from "../components/RecordList";
export default function Calendar({
  date,
  setDate,
  study,
  exercise,
  onEdit,
  onDelete,
}: {
  date: string;
  setDate: (d: string) => void;
  study: StudyRecord[];
  exercise: ExerciseRecord[];
  onEdit: (r: AnyRecord) => void;
  onDelete: (r: AnyRecord) => void;
}) {
  const [month, setMonth] = useState(date.slice(0, 7));
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [allDates, setAllDates] = useState(false);
  const first = `${month}-01`,
    offset = (dateObject(first).getDay() + 6) % 7,
    days = dateObject(periodBounds(first, "month").end).getDate();
  const bounds = periodBounds(date, period),
    stats = summarize(study, exercise, bounds);
  const selectDate = (d: string) => {
    setDate(d);
    setPeriod("day");
    setMonth(d.slice(0, 7));
    setAllDates(false);
  };
  const changeMonth = (delta: number) => {
    const d = dateObject(first);
    d.setMonth(d.getMonth() + delta);
    setMonth(localDate(d).slice(0, 7));
  };
  const records = [
    ...(type === "exercise" ? [] : study),
    ...(type === "study" ? [] : exercise),
  ].filter(
    (r) =>
      (allDates || r.date === date) &&
      ("project_name" in r ? r.project_name : r.activity_name)
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase()),
  );
  return (
    <>
      <p className="eyebrow">LOOK BACK, KEEP GOING</p>
      <h1>积累的足迹</h1>
      <section className="calendar">
        <div className="row">
          <button
            className="text-button"
            aria-label="上个月"
            onClick={() => changeMonth(-1)}
          >
            ←
          </button>
          <h2>{month.replace("-", " 年 ")} 月</h2>
          <button
            className="text-button"
            aria-label="下个月"
            onClick={() => changeMonth(1)}
          >
            →
          </button>
        </div>
        <div className="calendar-grid">
          {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
            <small key={d}>{d}</small>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <span key={`blank${i}`} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const d = shiftDate(first, i),
              s = study.some((r) => r.date === d),
              e = exercise.some((r) => r.date === d);
            return (
              <button
                key={d}
                className={d === date ? "selected" : ""}
                aria-label={`查看 ${d}`}
                aria-pressed={d === date}
                onClick={() => selectDate(d)}
              >
                {i + 1}
                <span className="dots">
                  {s && <i />}
                  {e && <i className="sport-dot" />}
                </span>
              </button>
            );
          })}
        </div>
        <p className="legend">
          ● 学习 <span>● 运动</span>
        </p>
      </section>
      <div className="section-heading">
        <h2>{period === "day" ? "当日统计" : "时间统计"}</h2>
        <div className="segmented">
          <button
            aria-pressed={period === "day"}
            onClick={() => setPeriod("day")}
          >
            当日
          </button>
          <button
            aria-pressed={period === "week"}
            onClick={() => setPeriod("week")}
          >
            本周
          </button>
          <button
            aria-pressed={period === "month"}
            onClick={() => setPeriod("month")}
          >
            本月
          </button>
        </div>
      </div>
      <p className="hint">
        {period === "day"
          ? `所选日期：${date}`
          : `按所选日期计算：${bounds.start} — ${bounds.end}`}
      </p>
      <div className="stats-row">
        <div>
          <small>学习时长</small>
          <strong>{durationText(stats.studyMinutes)}</strong>
        </div>
        <div>
          <small>运动时长</small>
          <strong>{durationText(stats.exerciseMinutes)}</strong>
        </div>
        <div>
          <small>运动次数</small>
          <strong>{stats.exerciseCount} 次</strong>
        </div>
      </div>
      {stats.projects.map((p) => (
        <div className="stat-project" key={p.id}>
          <div className="row">
            <span>{p.name}</span>
            <small>{durationText(p.minutes)}</small>
          </div>
          <div className="bar">
            <div
              style={{
                width: `${stats.studyMinutes ? (p.minutes / stats.studyMinutes) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      ))}
      <div className="section-heading">
        <h2>记录查询</h2>
      </div>
      <div className="fields two date-fields">
        <label>
          查询日期
          <input
            type="date"
            value={date}
            onChange={(e) => e.target.value && selectDate(e.target.value)}
          />
        </label>
        <label>
          记录类型
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">全部记录</option>
            <option value="study">学习</option>
            <option value="exercise">运动</option>
          </select>
        </label>
      </div>
      <label>
        项目名称搜索
        <input
          placeholder="搜索学习项目或运动名称"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={allDates}
          onChange={(e) => setAllDates(e.target.checked)}
        />
        搜索所有日期
      </label>
      <p className="hint">
        {allDates ? "全部日期" : date} · {records.length} 条记录
      </p>
      <RecordList records={records} onEdit={onEdit} onDelete={onDelete} />
    </>
  );
}
