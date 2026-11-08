import { useEffect, useState } from "react";
export default function StoragePanel() {
  const [message, setMessage] = useState("正在检查存储权限…"),
    [usage, setUsage] = useState("");
  useEffect(() => {
    if (!navigator.storage) {
      setMessage("此浏览器不支持持久化存储 API");
      return;
    }
    navigator.storage
      .persisted?.()
      .then((p) =>
        setMessage(
          p ? "已获得持久化存储权限" : "尚未获得持久化存储权限，建议定期备份",
        ),
      )
      .catch(() => setMessage("无法检查存储权限"));
    navigator.storage
      .estimate?.()
      .then((e) => {
        if (e.usage !== undefined)
          setUsage(`本站已用约 ${(e.usage / 1024 / 1024).toFixed(2)} MB`);
      })
      .catch(() => {});
  }, []);
  const request = async () => {
    if (!navigator.storage?.persist) {
      setMessage("此浏览器不支持申请持久化存储");
      return;
    }
    try {
      const granted = await navigator.storage.persist();
      setMessage(
        granted
          ? "已获得持久化存储权限"
          : "浏览器未批准持久化存储，记录仍可使用，请定期备份",
      );
    } catch {
      setMessage("申请失败，记录仍可使用，请定期备份");
    }
  };
  return (
    <section className="panel">
      <h2>存储与安装</h2>
      <p className="muted">
        记录存储在当前浏览器的 IndexedDB
        中。清除网站数据、使用隐私模式或更换设备可能导致数据丢失。请定期导出备份。
      </p>
      <p className="hint">
        {message}
        {usage && ` · ${usage}`}
      </p>
      <button className="secondary" onClick={request}>
        申请持久化存储
      </button>
      <h3 className="form-subtitle">添加到手机主屏幕</h3>
      <p className="muted">
        iPhone / iPad：在 Safari 中打开，点击分享 →
        添加到主屏幕。Android：在浏览器菜单选择安装应用或添加到主屏幕。
      </p>
      <p className="hint">
        首次联网打开并完成应用缓存后，才能断网启动。离线可新增、编辑、删除和导出记录。安装入口是否显示取决于浏览器；持久化权限也不能替代备份。
      </p>
    </section>
  );
}
