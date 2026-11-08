import { useEffect, useRef, useState } from "react";
import type {
  AnyRecord,
  StudyProject,
  ExerciseActivity,
} from "../domain/types";
import { saveStudy, saveExercise } from "../data/records";
export interface FormTarget {
  project?: StudyProject;
  activity?: ExerciseActivity;
  record?: AnyRecord;
  date: string;
}
export default function RecordForm({
  target,
  onClose,
  onSaved,
  onStatus,
}: {
  target: FormTarget;
  onClose: () => void;
  onSaved: () => void;
  onStatus: (s: string) => void;
}) {
  const { project, activity, record } = target;
  const study = !!project;
  const sr = record && "project_id" in record ? record : undefined;
  const er = record && "activity_id" in record ? record : undefined;
  const [date, setDate] = useState(record?.date || target.date);
  const [duration, setDuration] = useState(
    String(record?.duration_minutes || ""),
  );
  const [quantity, setQuantity] = useState(sr?.quantity?.toString() || "");
  const [unit, setUnit] = useState(
    sr?.unit || (project?.kind === "words" ? "个" : ""),
  );
  const [content, setContent] = useState(record?.content || "");
  const [chapters, setChapters] = useState(sr?.chapters || "");
  const [learned, setLearned] = useState(sr?.learned || "");
  const [unmastered, setUnmastered] = useState(sr?.unmastered || "");
  const [tasks, setTasks] = useState(sr?.next_tasks || "");
  const [feeling, setFeeling] = useState(er?.feeling || "");
  const [notes, setNotes] = useState(er?.notes || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
    const stop = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", stop);
    return () => window.removeEventListener("beforeunload", stop);
  }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    onStatus("正在保存…");
    try {
      if (project)
        await saveStudy(
          {
            date,
            project_id: project.id,
            duration_minutes: Number(duration),
            quantity: quantity === "" ? undefined : Number(quantity),
            unit,
            content,
            chapters,
            learned,
            unmastered,
            next_tasks: tasks,
          },
          record?.id,
        );
      else if (activity)
        await saveExercise(
          {
            date,
            activity_id: activity.id,
            duration_minutes: Number(duration),
            content,
            feeling,
            notes,
          },
          record?.id,
        );
      onStatus("已保存到本机");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败，请重试");
      onStatus("保存失败，内容未丢失");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const name = project?.name || activity?.name;
  return (
    <dialog
      ref={dialog}
      className="form-dialog"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <form onSubmit={submit}>
        <div className="row">
          <div>
            <small>{record ? "编辑记录" : "记录一次积累"}</small>
            <h2>{name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="关闭表单"
          >
            ×
          </button>
        </div>
        <div className="fields two date-fields">
          <label>
            日期
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            时长（分钟）
            <input
              autoFocus
              type="number"
              min="1"
              step="1"
              required
              inputMode="numeric"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </label>
        </div>
        {study &&
          ["words", "reading", "listening", "custom"].includes(
            project!.kind,
          ) && (
            <div className="fields two">
              <label>
                完成量
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </label>
              <label>
                数量单位
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="个 / 页 / 篇 / 分钟"
                />
              </label>
            </div>
          )}
        {project?.kind === "chapters" && (
          <label>
            学习章节或章节范围
            <input
              value={chapters}
              onChange={(e) => setChapters(e.target.value)}
              placeholder="例如：第 3 章，3.1–3.4"
            />
          </label>
        )}
        {(!study || ["str", "custom"].includes(project!.kind)) && (
          <label>
            {study
              ? project?.kind === "str"
                ? "工作内容"
                : "内容或学习任务"
              : "训练内容"}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </label>
        )}
        {study ? (
          <>
            <h3 className="form-subtitle">
              留一点思考 <small>选填</small>
            </h3>
            <label>
              今日学到了什么
              <textarea
                value={learned}
                onChange={(e) => setLearned(e.target.value)}
                rows={2}
              />
            </label>
            <label>
              哪些知识尚未掌握
              <textarea
                value={unmastered}
                onChange={(e) => setUnmastered(e.target.value)}
                rows={2}
              />
            </label>
            <label>
              后续需要完成的任务
              <textarea
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                rows={2}
              />
            </label>
          </>
        ) : (
          <>
            <label>
              训练感受
              <textarea
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                rows={2}
              />
            </label>
            <label>
              备注
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </label>
          </>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button
            type="button"
            className="secondary"
            onClick={onClose}
            disabled={busy}
          >
            取消
          </button>
          <button type="submit" className="primary" disabled={busy}>
            {busy ? "保存中…" : "保存记录"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
