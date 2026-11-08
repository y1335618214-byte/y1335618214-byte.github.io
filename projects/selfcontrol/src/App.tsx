import StatusBar from "./components/StatusBar";
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { initializeDatabase, fixedProjects } from "./data/seed";
import { db } from "./data/db";
import { deleteRecord } from "./data/records";
import { localDate } from "./domain/dates";
import type { AnyRecord } from "./domain/types";
import RecordForm, { type FormTarget } from "./components/RecordForm";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Study from "./pages/Study";
import Exercise from "./pages/Exercise";
export default function App() {
  const [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [tab, setTab] = useState("首页"),
    [today, setToday] = useState(localDate()),
    [date, setDate] = useState(localDate()),
    [status, setStatus] = useState("本地数据已就绪"),
    [online, setOnline] = useState(navigator.onLine),
    [target, setTarget] = useState<FormTarget | null>(null);
  useEffect(() => {
    initializeDatabase()
      .then(() => setReady(true))
      .catch((e) => setError(String(e)));
  }, []);
  useEffect(() => {
    const refresh = () => {
      const next = localDate();
      setToday(next);
      if (next !== today)
        setDate((selected) => (selected === today ? next : selected));
      setOnline(navigator.onLine);
    };
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [today]);
  const data = useLiveQuery(
    async () => {
      if (!ready) return undefined;
      try {
        return {
          study: await db.studyRecords.toArray(),
          exercise: await db.exerciseRecords.toArray(),
          projects: await db.studyProjects.toArray(),
          activities: await db.exerciseActivities.toArray(),
        };
      } catch (error) {
        setError(
          `无法读取本地数据：${error instanceof Error ? error.message : String(error)}`,
        );
        return undefined;
      }
    },
    [ready],
    undefined,
  );
  const edit = (r: AnyRecord) => {
    if (!data) return;
    const project =
      "project_id" in r
        ? data.projects.find((p) => p.id === r.project_id)
        : undefined;
    const activity =
      "activity_id" in r
        ? data.activities.find((p) => p.id === r.activity_id)
        : undefined;
    if (!project && !activity) {
      setStatus("项目配置缺失，请恢复完整备份");
      return;
    }
    setTarget({ record: r, project, activity, date: r.date });
  };
  const remove = async (r: AnyRecord) => {
    if (!confirm("确定删除这条记录？此操作不能撤销。")) return;
    setStatus("正在删除…");
    try {
      await deleteRecord("project_id" in r ? "study" : "exercise", r.id);
      setStatus("已删除并保存到本机");
    } catch {
      setStatus("删除失败，请重试");
    }
  };
  const projects =
    data?.projects.sort((a, b) => {
      const ai = fixedProjects.findIndex((p) => p.id === a.id),
        bi = fixedProjects.findIndex((p) => p.id === b.id);
      return (
        (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) ||
        a.created_at.localeCompare(b.created_at)
      );
    }) || [];
  return (
    <div className="app">
      <header>
        <div className="brand">
          <strong>
            燕子<span className="brand-dot">.</span>
          </strong>
          <span>加油！加油！加油！</span>
        </div>
        <span className={`network ${online ? "" : "offline"}`}>
          ● {online ? "在线" : "离线可用"}
        </span>
      </header>
      <div className="save-status" role="status">
        {status}
      </div>
      <StatusBar hasDraft={!!target} />
      <main>
        {error ? (
          <p role="alert" className="error">
            无法打开本地数据库：{error}。请检查浏览器存储权限。
          </p>
        ) : !ready || !data ? (
          <p>正在读取本地数据…</p>
        ) : (
          <>
            {tab === "首页" && (
              <Home
                today={today}
                study={data.study}
                exercise={data.exercise}
                onEdit={edit}
                onDelete={remove}
                onNavigate={(page) => {
                  setDate(localDate());
                  setTab(page);
                }}
              />
            )}{" "}
            {tab === "学习" && (
              <Study
                date={date}
                setDate={setDate}
                projects={projects}
                records={data.study}
                onAdd={setTarget}
                onEdit={edit}
                onDelete={remove}
              />
            )}{" "}
            {tab === "运动" && (
              <Exercise
                date={date}
                setDate={setDate}
                activities={data.activities}
                records={data.exercise}
                onAdd={setTarget}
                onEdit={edit}
                onDelete={remove}
              />
            )}{" "}
            {tab === "日历" && (
              <Calendar
                date={date}
                setDate={setDate}
                study={data.study}
                exercise={data.exercise}
                onEdit={edit}
                onDelete={remove}
              />
            )}{" "}
            {tab === "我的" && (
              <Profile
                projects={projects}
                activities={data.activities}
                onStatus={setStatus}
              />
            )}
          </>
        )}
      </main>
      <nav aria-label="主导航">
        {["首页", "学习", "运动", "日历", "我的"].map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-current={tab === t ? "page" : undefined}
          >
            <span aria-hidden="true">{["⌂", "▤", "◇", "▦", "○"][i]}</span>
            {t}
          </button>
        ))}
      </nav>
      {target && (
        <RecordForm
          target={target}
          onClose={() => setTarget(null)}
          onSaved={() => setTarget(null)}
          onStatus={setStatus}
        />
      )}
    </div>
  );
}
