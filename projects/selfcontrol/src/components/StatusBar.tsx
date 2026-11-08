import { usePwa } from "../pwa";
export default function StatusBar({ hasDraft }: { hasDraft: boolean }) {
  const {
    offlineReady: [ready],
    needRefresh: [update, setUpdate],
    updateServiceWorker,
  } = usePwa();
  return (
    <>
      {ready && <span className="cache-ready">应用已缓存，可离线打开</span>}
      {update && (
        <aside className="update-banner" role="status">
          <span>
            新版本已准备好。
            {hasDraft ? "请先保存或关闭当前表单。" : "可刷新使用新版本。"}
          </span>
          <button
            disabled={hasDraft}
            className="primary"
            onClick={() => void updateServiceWorker(true)}
          >
            刷新更新
          </button>
          <button className="text-button" onClick={() => setUpdate(false)}>
            稍后
          </button>
        </aside>
      )}
    </>
  );
}
