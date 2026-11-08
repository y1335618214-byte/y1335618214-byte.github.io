import { useState } from "react";
import { db } from "../data/db";
import {
  exportBackup,
  parseBackup,
  previewImport,
  restoreBackup,
  type ImportPreview,
} from "../data/backup";
import { studyCsv, exerciseCsv, downloadFile } from "../data/csv";
import { localDate } from "../domain/dates";
import { tableNames, type Backup, type TableName } from "../domain/types";
const labels: Record<TableName, string> = {
  studyRecords: "学习记录",
  exerciseRecords: "运动记录",
  studyProjects: "学习项目",
  exerciseActivities: "运动活动",
  settings: "应用设置",
};
export default function BackupPanel({
  onStatus,
}: {
  onStatus: (s: string) => void;
}) {
  const [pending, setPending] = useState<{
      backup: Backup;
      preview: ImportPreview;
    } | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const perform = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  const exportData = (kind: string) =>
    perform(async () => {
      const b = await exportBackup(db);
      if (kind === "json")
        downloadFile(
          `日积-完整备份-${localDate()}.json`,
          JSON.stringify(b, null, 2),
          "application/json;charset=utf-8",
        );
      else
        downloadFile(
          `日积-${kind === "study" ? "学习" : "运动"}-${localDate()}.csv`,
          kind === "study"
            ? studyCsv(b.data.studyRecords)
            : exerciseCsv(b.data.exerciseRecords),
          "text/csv;charset=utf-8",
        );
      setMessage("已生成下载文件，请确认文件已保存。");
    });
  const selectFile = async (file?: File) => {
    setPending(null);
    if (!file) return;
    await perform(async () => {
      const backup = parseBackup(await file.text());
      setPending({ backup, preview: await previewImport(db, backup) });
    });
  };
  const restore = () =>
    perform(async () => {
      if (!pending) return;
      try {
        const result = await restoreBackup(db, pending.backup, pending.preview);
        setPending(null);
        setMessage(
          `恢复完成并校验通过：共 ${result.studyCount} 条学习记录、${result.exerciseCount} 条运动记录。`,
        );
        onStatus("备份已恢复到本机");
      } catch (e) {
        if (e instanceof Error && e.message.includes("变化"))
          setPending({
            backup: pending.backup,
            preview: await previewImport(db, pending.backup),
          });
        throw e;
      }
    });
  return (
    <section className="panel">
      <h2>备份与导出</h2>
      <p className="hint">
        完整 JSON 可恢复全部记录、项目与设置。CSV
        适合在表格软件中查看，不用于恢复。文件仅下载到你的设备。
      </p>
      <div className="export-buttons">
        <button
          className="primary"
          disabled={busy}
          onClick={() => exportData("json")}
        >
          导出完整 JSON 备份
        </button>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => exportData("study")}
        >
          导出学习 CSV
        </button>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => exportData("exercise")}
        >
          导出运动 CSV
        </button>
      </div>
      <label className="import-label">
        从 JSON 备份恢复
        <input
          type="file"
          accept=".json,application/json"
          disabled={busy}
          onChange={(e) => {
            void selectFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {pending && (
        <div className="import-preview">
          <h3>恢复预览</h3>
          <p className="hint">
            按 ID 合并：相同 ID
            覆盖，其余新增；现有的其他数据保留。覆盖无法撤销，建议先导出当前备份。
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>数据范围</th>
                  <th>新增</th>
                  <th>覆盖</th>
                  <th>保留</th>
                </tr>
              </thead>
              <tbody>
                {tableNames.map((t) => (
                  <tr key={t}>
                    <td>{labels[t]}</td>
                    <td>{pending.preview.tables[t].added}</td>
                    <td>{pending.preview.tables[t].overwritten}</td>
                    <td>{pending.preview.tables[t].retained}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="form-actions">
            <button
              className="secondary"
              disabled={busy}
              onClick={() => setPending(null)}
            >
              取消恢复
            </button>
            <button className="primary" disabled={busy} onClick={restore}>
              确认合并并恢复
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="success" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
