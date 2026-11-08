(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WordMemBackup = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const FORMAT = 'wordmem-learning-backup';
  const VERSION = 1;
  const MAX_BYTES = 2 * 1024 * 1024;
  const ACTIVE_KEY = 'wordmem-active-batch-v2';
  const MAX_TIME = 8640000000000000;
  const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const blank = () => Object.create(null);
  const learningKey = id => id === 'demo' ? 'word-island-demo' : 'wordmem-learning-' + id;
  const deadlineKey = id => id === 'demo' ? 'wordmem-deadline-v1' : 'wordmem-deadline-' + id;

  function fail(message, code = 'INVALID_BACKUP') {
    const error = new Error(message);
    error.code = code;
    throw error;
  }
  function record(value, allowed, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail(label + '格式不正确。');
    for (const key of Object.keys(value)) {
      if (['__proto__', 'prototype', 'constructor'].includes(key) || (allowed && !allowed.includes(key))) {
        fail(label + '包含不支持的字段。');
      }
    }
    return value;
  }
  function integer(value, min, max, label) {
    if (!Number.isSafeInteger(value) || value < min || value > max) fail(label + '超出有效范围。');
    return value;
  }
  function deepFreeze(value) {
    if (value && typeof value === 'object') {
      Object.values(value).forEach(deepFreeze);
      Object.freeze(value);
    }
    return value;
  }

  function create({ batches, storage, now = () => Date.now() }) {
    if (!storage) storage = globalThis.localStorage;
    const ids = Object.keys(batches);
    if (!ids.length || ids.some(id => id !== 'demo' && !/^photo-\d{3}$/.test(id))) fail('词表配置不正确。');
    const catalogs = new Map(ids.map(id => [id, {
      words: new Set(batches[id].words.map(w => w.en)),
      groups: new Set(batches[id].words.map(w => w.group)),
      list: batches[id].words.map(w => w.en)
    }]));
    const preparedPlans = new WeakMap();

    function state(value, id) {
      record(value, ['ratings', 'ratingTimes', 'seen', 'settings', 'index', 'round', 'review', 'queueIds'], '学习记录');
      const catalog = catalogs.get(id);
      const ratings = blank(), ratingTimes = blank(), seen = blank();
      const incomingRatings = record(value.ratings === undefined ? {} : value.ratings, null, '自评记录');
      const incomingTimes = record(value.ratingTimes === undefined ? {} : value.ratingTimes, null, '自评时间');
      const incomingSeen = record(value.seen === undefined ? {} : value.seen, null, '浏览记录');
      for (const [word, rating] of Object.entries(incomingRatings)) {
        if (!catalog.words.has(word) || !['good', 'mid', 'bad'].includes(rating)) fail('备份包含不属于本词表的单词或无效自评。');
        ratings[word] = rating;
        ratingTimes[word] = own(incomingTimes, word) ? integer(incomingTimes[word], 0, MAX_TIME, '自评时间') : 0;
      }
      for (const word of Object.keys(incomingTimes)) {
        if (!own(ratings, word)) fail('自评时间缺少对应的单词记录。');
      }
      for (const [word, visited] of Object.entries(incomingSeen)) {
        if (!catalog.words.has(word) || typeof visited !== 'boolean') fail('备份中的浏览记录无效。');
        if (visited) seen[word] = true;
      }
      const inputSettings = record(value.settings === undefined ? {} : value.settings, ['direction', 'scope', 'order', 'think', 'answer'], '循环设置');
      const settings = { direction: 'en', scope: 'all', order: 'sequence', think: 3, answer: 2, ...inputSettings };
      if (!['en', 'zh'].includes(settings.direction) || !['sequence', 'random'].includes(settings.order) ||
          (!['all', 'weak'].includes(settings.scope) && !catalog.groups.has(settings.scope))) fail('备份中的循环设置无效。');
      for (const name of ['think', 'answer']) {
        if (typeof settings[name] !== 'number' || !Number.isFinite(settings[name]) || settings[name] < 1 || settings[name] > 60) fail('循环时间必须在 1 到 60 秒之间。');
      }
      let queueIds;
      if (value.queueIds !== undefined) {
        if (!Array.isArray(value.queueIds) || value.queueIds.length > catalog.words.size || new Set(value.queueIds).size !== value.queueIds.length || value.queueIds.some(word => typeof word !== 'string' || !catalog.words.has(word))) fail('备份中的循环词序无效。');
        queueIds = [...value.queueIds];
      } else {
        queueIds = batches[id].words.filter(w => settings.scope === 'all' || (settings.scope === 'weak' && ratings[w.en] !== 'good') || w.group === settings.scope).map(w => w.en);
      }
      const index = integer(value.index === undefined ? 0 : value.index, 0, Math.max(0, queueIds.length - 1), '学习位置');
      const round = integer(value.round === undefined ? 1 : value.round, 1, 1000000000, '循环轮数');
      let review = null;
      if (value.review !== undefined && value.review !== null) {
        const input = record(value.review, ['words', 'round', 'start', 'end', 'total'], '十词回顾');
        if (!Array.isArray(input.words) || input.words.length < 1 || input.words.length > 10 || new Set(input.words).size !== input.words.length || input.words.some(word => typeof word !== 'string' || !catalog.words.has(word))) fail('备份中的回顾清单无效。');
        review = {
          words: [...input.words],
          round: integer(input.round, 1, 1000000000, '回顾轮数'),
          start: integer(input.start, 1, catalog.words.size, '回顾起点'),
          end: integer(input.end, 1, catalog.words.size, '回顾终点'),
          total: integer(input.total, 1, catalog.words.size, '回顾词数')
        };
        if (review.end > review.total || review.end - review.start + 1 !== review.words.length) fail('备份中的回顾范围不一致。');
      }
      return { ratings, ratingTimes, seen, settings, index, round, review, queueIds };
    }

    function validate(data) {
      record(data, ['format', 'version', 'exportedAt', 'activeBatch', 'batches'], '备份文件');
      if (data.format !== FORMAT || data.version !== VERSION) fail('这不是支持的单词学习备份，或备份版本不受支持。', 'UNSUPPORTED_BACKUP');
      if (typeof data.exportedAt !== 'string' || !Number.isFinite(Date.parse(data.exportedAt)) || new Date(data.exportedAt).toISOString() !== data.exportedAt) fail('备份日期无效。');
      if (!catalogs.has(data.activeBatch)) fail('备份中的当前词表不存在。');
      record(data.batches, ids, '批次记录');
      if (!Object.keys(data.batches).length) fail('备份中没有批次记录。');
      const normalized = { format: FORMAT, version: VERSION, exportedAt: data.exportedAt, activeBatch: data.activeBatch, batches: blank() };
      for (const [id, entry] of Object.entries(data.batches)) {
        record(entry, ['learning', 'deadline'], '批次记录');
        if (!own(entry, 'learning') || !own(entry, 'deadline')) fail('批次记录不完整。');
        normalized.batches[id] = {
          learning: entry.learning === null ? null : state(entry.learning, id),
          deadline: entry.deadline === null ? null : integer(entry.deadline, 1, MAX_TIME, '倒计时截止时间')
        };
      }
      return normalized;
    }

    function readState(id, raw) {
      if (raw === null) return null;
      try { return state(JSON.parse(raw), id); }
      catch (error) { fail('当前浏览器的学习记录无法读取；为避免覆盖，操作已停止。请先保留现有浏览器数据。', 'CURRENT_DATA_INVALID'); }
    }
    function readDeadline(raw) {
      if (raw === null || raw === '' || raw === '0') return null;
      const number = Number(raw);
      if (!Number.isSafeInteger(number) || number <= 0 || number > MAX_TIME) fail('当前倒计时记录无效，操作已停止。', 'CURRENT_DATA_INVALID');
      return number;
    }
    function getItem(key) {
      try { return storage.getItem(key); }
      catch { fail('浏览器不允许读取学习记录，请检查本地存储权限。', 'STORAGE_UNAVAILABLE'); }
    }
    function exportData() {
      const active = getItem(ACTIVE_KEY);
      const data = { format: FORMAT, version: VERSION, exportedAt: new Date(now()).toISOString(), activeBatch: catalogs.has(active) ? active : (ids.find(id => id !== 'demo') || ids[0]), batches: blank() };
      for (const id of ids) data.batches[id] = { learning: readState(id, getItem(learningKey(id))), deadline: readDeadline(getItem(deadlineKey(id))) };
      return data;
    }
    function summarize(data) {
      let batchCount = 0, ratedCount = 0, seenCount = 0, deadlineCount = 0, demoRatedCount = 0;
      const latest = new Map();
      for (const [id, entry] of Object.entries(data.batches)) {
        if (entry.learning || entry.deadline !== null) batchCount++;
        if (entry.deadline !== null) deadlineCount++;
        if (!entry.learning) continue;
        const learning = entry.learning;
        ratedCount += Object.keys(learning.ratings).length;
        seenCount += Object.keys(learning.seen).length;
        if (id === 'demo') { demoRatedCount += Object.keys(learning.ratings).length; continue; }
        for (const [word, rating] of Object.entries(learning.ratings)) {
          const time = learning.ratingTimes[word] || 0;
          if (!latest.has(word) || time >= latest.get(word).time) latest.set(word, { rating, time });
        }
      }
      return { exportedAt: data.exportedAt, batchCount, ratedCount, seenCount, deadlineCount, demoRatedCount, uniqueRatedCount: latest.size, masteredCount: [...latest.values()].filter(x => x.rating === 'good').length };
    }
    function serialize() { return JSON.stringify(exportData(), null, 2); }
    function prepare(text) {
      if (typeof text !== 'string') fail('请读取 JSON 备份文件。');
      if (text.length > MAX_BYTES || new TextEncoder().encode(text).byteLength > MAX_BYTES) fail('备份文件超过 2 MB，请选择正确的备份文件。', 'FILE_TOO_LARGE');
      let input;
      try { input = JSON.parse(text); }
      catch { fail('文件不是有效的 JSON 备份。'); }
      const data = deepFreeze(validate(input));
      const prepared = deepFreeze({ summary: summarize(data) });
      preparedPlans.set(prepared, data);
      return prepared;
    }
    function merge(current, incoming) {
      if (!current) return incoming;
      if (!incoming) return current;
      // Keep the current session, including a pending ten-word review.
      const result = { ...current, ratings: { ...current.ratings }, ratingTimes: { ...current.ratingTimes }, seen: { ...current.seen, ...incoming.seen } };
      for (const [word, rating] of Object.entries(incoming.ratings)) {
        if (!own(result.ratings, word) || (incoming.ratingTimes[word] || 0) > (result.ratingTimes[word] || 0)) {
          result.ratings[word] = rating;
          result.ratingTimes[word] = incoming.ratingTimes[word] || 0;
        }
      }
      return result;
    }
    function apply(prepared) {
      if (!preparedPlans.has(prepared)) fail('请先选择并预览备份文件，再确认合并。');
      const incoming = preparedPlans.get(prepared);
      const originals = new Map(), writes = new Map();
      const read = key => { const raw = getItem(key); originals.set(key, raw); return raw; };
      for (const [id, entry] of Object.entries(incoming.batches)) {
        const key = learningKey(id), raw = read(key), current = readState(id, raw);
        if (entry.learning) {
          const combined = merge(current, entry.learning);
          if (!current || JSON.stringify(current) !== JSON.stringify(combined)) writes.set(key, JSON.stringify(combined));
        }
        const clockKey = deadlineKey(id), clock = readDeadline(read(clockKey));
        if (clock === null && entry.deadline !== null) writes.set(clockKey, String(entry.deadline));
      }
      const active = read(ACTIVE_KEY);
      if (!catalogs.has(active)) writes.set(ACTIVE_KEY, incoming.activeBatch);
      const touched = [];
      try {
        for (const [key, value] of writes) {
          touched.push(key);
          storage.setItem(key, value);
        }
      } catch {
        let incomplete = false;
        for (const key of touched.reverse()) {
          try {
            const original = originals.get(key);
            if (original === null) storage.removeItem(key); else storage.setItem(key, original);
          } catch { incomplete = true; }
        }
        if (incomplete) fail('导入未完成，且部分原记录未能恢复。请保留备份文件，不要清理浏览器数据。', 'RESTORE_FAILED_PARTIAL');
        fail('无法保存导入记录；已恢复原有记录。请检查浏览器存储空间后重试。', 'RESTORE_FAILED');
      }
      return Object.freeze({ changedKeys: writes.size, summary: prepared.summary });
    }
    function download() {
      const data = exportData();
      const text = JSON.stringify(data, null, 2);
      const filename = 'wordmem-backup-' + data.exportedAt.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z') + '.json';
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = filename;
      document.body.appendChild(link);
      try { link.click(); }
      finally { link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000); }
      return { filename, summary: summarize(data) };
    }
    return Object.freeze({ exportData, serialize, prepare, apply, download });
  }
  return Object.freeze({ create, FORMAT, VERSION, MAX_BYTES });
});
