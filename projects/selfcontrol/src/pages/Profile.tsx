import StoragePanel from "../components/StoragePanel";
import BackupPanel from "../components/BackupPanel";
import { useState } from "react";
import type {
  StudyProject,
  ExerciseActivity,
  Group,
  RecordType,
} from "../domain/types";
import {
  createStudyProject,
  createExerciseActivity,
  archiveProject,
} from "../data/projects";
export default function Profile({
  projects,
  activities,
  onStatus,
}: {
  projects: StudyProject[];
  activities: ExerciseActivity[];
  onStatus: (s: string) => void;
}) {
  const [name, setName] = useState(""),
    [kind, setKind] = useState("study"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (kind === "study") await createStudyProject(name);
      else await createExerciseActivity(name, kind as Group);
      setName("");
      onStatus("项目已保存到本机");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };
  const archive = async (type: RecordType, id: string) => {
    try {
      await archiveProject(type, id);
      onStatus("项目配置已保存");
    } catch (e) {
      setError(String(e));
    }
  };
  return (
    <>
      <p className="eyebrow">YOUR SPACE, YOUR DATA</p>
      <h1>我的记录空间</h1>
      <p className="muted">不用注册，专注自己。数据留在这台设备。</p>
      <BackupPanel onStatus={onStatus} />
      <section className="panel">
        <h2>项目管理</h2>
        <p className="hint">
          新增项目将在后续日期持续显示。归档只隐藏新增入口，历史记录仍会保留。
        </p>
        <form onSubmit={add}>
          <label>
            项目类别
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="study">自定义学习项目</option>
              <option value="健身">健身活动</option>
              <option value="体育项目">体育活动</option>
            </select>
          </label>
          <label>
            项目名称
            <input
              required
              maxLength={100}
              placeholder="例如：解剖学、力量训练、游泳"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <button className="primary" disabled={busy}>
            添加项目
          </button>
        </form>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="managed-projects">
          {[
            ...projects
              .filter((p) => !p.fixed)
              .map((p) => ({ ...p, type: "study" as const, category: "学习" })),
            ...activities.map((p) => ({
              ...p,
              type: "exercise" as const,
              category: p.group,
            })),
          ].map((p) => (
            <div className="managed-project" key={p.id}>
              <div>
                <strong>{p.name}</strong>
                <small>
                  {p.category}
                  {p.archived ? " · 已归档" : ""}
                </small>
              </div>
              <button
                className="text-button"
                aria-label={`${p.archived ? "恢复" : "归档"}${p.name}`}
                onClick={() => archive(p.type, p.id)}
              >
                {p.archived ? "恢复显示" : "归档"}
              </button>
            </div>
          ))}
        </div>
      </section>
      <StoragePanel />
    </>
  );
}
