const kpis = [
  { label: "今日维修工单", value: "38", hint: "急修 6 单，巡检 12 单", trend: "+12%", tone: "blue", icon: "clipboard-list", target: "orders" },
  { label: "在线医疗设备", value: "142", hint: "覆盖 9 个科室", trend: "+8", tone: "teal", icon: "stethoscope", target: "devices" },
  { label: "平均响应时间", value: "11m", hint: "较上周缩短 4 分钟", trend: "-26%", tone: "green", icon: "timer", target: "records" },
  { label: "待处理告警", value: "7", hint: "2 条高优先级", trend: "+2", tone: "amber", icon: "triangle-alert", target: "alerts" }
];

const rackReadouts = [
  { label: "温湿度", value: "28.4°C / 42%", hint: "右侧检测舱" },
  { label: "振动峰值", value: "2.1 mm/s", hint: "底部电源仓" },
  { label: "RFID 工具", value: "43 / 45", hint: "缺失扭矩扳手、绝缘探针" },
  { label: "电源状态", value: "91%", hint: "预计续航 7.2 小时" }
];

const sensorSeries = {
  temperature: [27.6, 27.9, 28.1, 28.4, 29.2, 28.7, 28.4, 28.8, 29.4, 29.1, 28.5, 28.3],
  vibration: [1.8, 2.0, 2.2, 2.1, 3.6, 2.4, 2.2, 2.3, 2.8, 2.2, 2.0, 2.1],
  load: [62, 64, 63, 68, 73, 71, 69, 70, 75, 77, 72, 70]
};

const sensorStrip = [
  { label: "消毒 UV 强度", value: "72%" },
  { label: "摄像头在线", value: "4 / 4" },
  { label: "定位精度", value: "±0.8 m" }
];

const workOrders = [
  { id: "WO-260526-018", priority: "high", priorityText: "高", device: "呼吸机 VM-3108", category: "生命支持", location: "ICU 北区 12 床", engineer: "燕政洁", status: "现场处理中", statusTone: "warn", sla: "00:18" },
  { id: "WO-260526-017", priority: "medium", priorityText: "中", device: "输液泵 IP-2093", category: "输注设备", location: "急诊抢救室", engineer: "高宏伟", status: "等待配件", statusTone: "info", sla: "01:24" },
  { id: "WO-260526-015", priority: "high", priorityText: "高", device: "血气分析仪 BG-771", category: "检验设备", location: "检验科 2 区", engineer: "史鑫妹", status: "复检中", statusTone: "warn", sla: "00:42" },
  { id: "WO-260526-011", priority: "low", priorityText: "低", device: "监护仪 PM-8831", category: "监护设备", location: "心内科 6 楼", engineer: "于洋懿", status: "已预约", statusTone: "good", sla: "03:16" },
  { id: "WO-260526-009", priority: "medium", priorityText: "中", device: "高压灭菌器 ST-420", category: "消毒设备", location: "供应室", engineer: "燕政洁", status: "待验收", statusTone: "info", sla: "02:50" }
];

const alerts = [
  { tone: "rose", title: "检测舱温度超过策略阈值", text: "右侧检测舱 29.4°C，已触发连续升温观察。" },
  { tone: "amber", title: "工具墙 RFID 漏检", text: "绝缘探针与扭矩扳手未归位，建议复核借出记录。" },
  { tone: "blue", title: "呼吸机定位偏移", text: "VM-3108 从 ICU 北区移动至走廊缓冲区。" },
  { tone: "green", title: "电池健康检查完成", text: "底部电源仓健康度 91%，充放电曲线正常。" }
];

const boardColumns = [
  { title: "待分派", items: ["监护仪黑屏", "注射泵流速偏差"] },
  { title: "处理中", items: ["呼吸机压力波动", "血气分析仪校准失败"] },
  { title: "待配件", items: ["输液泵泵门锁扣", "除颤仪电池包"] },
  { title: "待验收", items: ["高压灭菌器密封圈", "手术灯控制面板"] }
];

const devices = [
  { name: "影像设备", desc: "DR、CT、超声、内镜影像链路", icon: "scan-search", tone: "blue", total: 31, repair: 4, risk: 2 },
  { name: "生命支持", desc: "呼吸机、麻醉机、除颤仪", icon: "heart-pulse", tone: "rose", total: 24, repair: 5, risk: 3 },
  { name: "检验分析", desc: "血气、生化、免疫与离心设备", icon: "flask-conical", tone: "teal", total: 28, repair: 6, risk: 1 },
  { name: "输注设备", desc: "输液泵、注射泵、营养泵", icon: "syringe", tone: "green", total: 39, repair: 7, risk: 1 },
  { name: "消毒供应", desc: "灭菌器、清洗机、追溯终端", icon: "shield-plus", tone: "amber", total: 12, repair: 2, risk: 0 },
  { name: "病区监护", desc: "监护仪、遥测盒、中央站", icon: "monitor-dot", tone: "violet", total: 46, repair: 8, risk: 2 }
];

const records = [
  { time: "13:20", title: "呼吸机 VM-3108 急修", text: "完成压力传感器排线复位，上传维修前后视频与压力曲线截图。" },
  { time: "11:45", title: "输液泵 IP-2093 配件申请", text: "泵门锁扣磨损，系统自动关联库存 SP-LK-18，等待主管审批。" },
  { time: "10:10", title: "血气分析仪 BG-771 校准", text: "更换校准液并完成两点校准，电子签名已同步院方设备档案。" },
  { time: "09:30", title: "智能维修架 MF-R02 自检", text: "完成摄像头、定位、RFID、温湿度、振动与电池模组自检。" }
];

const cameras = [
  { name: "CAM-A01 顶部总览", status: "录制中", time: "13:26:42" },
  { name: "CAM-B02 工具墙", status: "AI 识别", time: "13:26:43" },
  { name: "CAM-C03 检测舱", status: "留痕中", time: "13:26:44" },
  { name: "CAM-D04 通道定位", status: "在线", time: "13:26:45" },
  { name: "CAM-E05 配件抽屉", status: "运动检测", time: "13:26:46" },
  { name: "CAM-F06 维修台面", status: "在线", time: "13:26:47" }
];

const sensors = [
  { name: "顶层消毒区", desc: "UV 强度、门磁、臭氧残留", value: "72%", health: 72, tone: "teal" },
  { name: "左侧工具墙", desc: "RFID、工具位、借还状态", value: "95%", health: 95, tone: "blue" },
  { name: "右侧检测舱", desc: "温度、湿度、绝缘检测", value: "29.4°C", health: 68, tone: "amber" },
  { name: "配件抽屉", desc: "重量、开合、库存批次", value: "84%", health: 84, tone: "green" },
  { name: "底部电源仓", desc: "电量、振动、充放电温升", value: "91%", health: 91, tone: "violet" },
  { name: "移动底盘", desc: "定位、碰撞、刹车状态", value: "±0.8 m", health: 88, tone: "rose" }
];

const users = [
  { name: "燕政洁", role: "高级维修工程师", scope: "生命支持 / ICU", status: "值班中", tone: "good" },
  { name: "史鑫妹", role: "检验设备工程师", scope: "检验科 / 门诊", status: "处理中", tone: "warn" },
  { name: "高宏伟", role: "配件管理员", scope: "库存 / 采购", status: "在线", tone: "good" },
  { name: "杜明", role: "院方主管", scope: "审批 / 报表", status: "审批中", tone: "info" },
  { name: "于洋懿", role: "影像设备工程师", scope: "影像中心", status: "离线", tone: "danger" },
  { name: "燕政洁", role: "系统管理员", scope: "账号 / 审计", status: "在线", tone: "good" }
];

const titles = {
  overview: "运营总览",
  orders: "维修工单",
  devices: "设备类别",
  records: "维保记录",
  location: "定位追踪",
  camera: "摄像头留痕",
  sensors: "传感器数据",
  users: "用户与权限"
};

const toneColor = {
  teal: "#0d9488",
  blue: "#3563e9",
  green: "#38a169",
  amber: "#d98c00",
  rose: "#dd4965",
  violet: "#7c5cff"
};

const localIconPaths = {
  "activity": '<path d="M4 12h4l2-6 4 12 2-6h4"/>',
  "archive": '<path d="M4 7h16"/><path d="M5 7v13h14V7"/><path d="M9 11h6"/><path d="M3 4h18v3H3z"/>',
  "bell": '<path d="M6 9a6 6 0 0 1 12 0v4l2 3H4l2-3z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  "book-open-check": '<path d="M4 5c3 0 5 1 8 3v12c-3-2-5-3-8-3z"/><path d="M20 5c-3 0-5 1-8 3"/><path d="m14 14 2 2 4-5"/>',
  "camera": '<path d="M5 7h3l2-2h4l2 2h3v12H5z"/><circle cx="12" cy="13" r="3"/>',
  "cctv": '<path d="M4 8 18 4l2 6-14 4z"/><path d="M8 13v5"/><path d="M6 18h8"/><path d="m15 11 4 4"/>',
  "clipboard-list": '<path d="M9 4h6l1 2h3v15H5V6h3z"/><path d="M9 11h6"/><path d="M9 15h6"/><path d="M9 19h4"/>',
  "cross": '<path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"/>',
  "download": '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  "file-check-2": '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5"/><path d="m9 15 2 2 5-5"/>',
  "file-clock": '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5"/><circle cx="12" cy="15" r="3"/><path d="M12 13v2l1.5 1"/>',
  "flask-conical": '<path d="M9 3h6"/><path d="M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M8 15h8"/>',
  "heart-pulse": '<path d="M20 8c0 6-8 11-8 11S4 14 4 8a4 4 0 0 1 7-2 4 4 0 0 1 7 2z"/><path d="M4 12h4l2-3 3 6 2-3h5"/>',
  "image": '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m5 18 5-5 3 3 2-2 4 4"/>',
  "layout-dashboard": '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="4" rx="1"/><rect x="13" y="10" width="7" height="10" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/>',
  "log-in": '<path d="M4 12h11"/><path d="m11 8 4 4-4 4"/><path d="M16 4h4v16h-4"/>',
  "map-pinned": '<path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2z"/><path d="M9 4v14"/><path d="M15 6v14"/><circle cx="16" cy="10" r="2"/><path d="M16 12v3"/>',
  "monitor-dot": '<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M8 21h8"/><path d="M12 16v5"/><circle cx="16" cy="9" r="1.5"/>',
  "play": '<path d="M8 5v14l11-7z"/>',
  "plus": '<path d="M12 5v14"/><path d="M5 12h14"/>',
  "radio": '<path d="M6 17a8 8 0 0 1 12 0"/><path d="M9 14a4 4 0 0 1 6 0"/><circle cx="12" cy="18" r="1.5"/><path d="M4 9a12 12 0 0 1 16 0"/>',
  "scan-line": '<path d="M4 7V4h3"/><path d="M17 4h3v3"/><path d="M20 17v3h-3"/><path d="M7 20H4v-3"/><path d="M5 12h14"/>',
  "scan-search": '<path d="M4 7V4h3"/><path d="M17 4h3v3"/><path d="M4 17v3h3"/><path d="M14 14l5 5"/><circle cx="11" cy="11" r="4"/>',
  "search": '<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>',
  "shield-check": '<path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m8.5 12 2.3 2.3 4.8-5"/>',
  "shield-plus": '<path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 8v8"/><path d="M8 12h8"/>',
  "signature": '<path d="M4 18c3-8 5-8 6-6 1 3-2 5-3 3-1-2 3-5 6-2 2 2 1 4 3 4 1 0 2-1 4-3"/><path d="M4 21h16"/>',
  "sliders-horizontal": '<path d="M4 7h8"/><path d="M16 7h4"/><circle cx="14" cy="7" r="2"/><path d="M4 17h4"/><path d="M12 17h8"/><circle cx="10" cy="17" r="2"/>',
  "stethoscope": '<path d="M6 4v5a4 4 0 0 0 8 0V4"/><path d="M14 9v5a4 4 0 0 0 8 0v-1"/><circle cx="20" cy="12" r="2"/><path d="M4 4h4"/><path d="M12 4h4"/>',
  "syringe": '<path d="m18 4 2 2"/><path d="m14 8 2 2"/><path d="m4 20 6-6"/><path d="m12 6 6 6-7 7-6-6z"/><path d="M7 10l7 7"/>',
  "tag": '<path d="M4 11V4h7l9 9-7 7z"/><circle cx="8" cy="8" r="1.5"/>',
  "timer": '<circle cx="12" cy="13" r="7"/><path d="M12 13V9"/><path d="M9 3h6"/><path d="m16 6 2-2"/>',
  "triangle-alert": '<path d="M12 3 22 20H2z"/><path d="M12 9v5"/><path d="M12 17h.01"/>',
  "trash-2": '<path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 14h10l1-14"/><path d="M9 7V4h6v3"/>',
  "user-plus": '<circle cx="9" cy="8" r="4"/><path d="M3 21a6 6 0 0 1 12 0"/><path d="M18 8v6"/><path d="M15 11h6"/>',
  "user-round": '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  "users-round": '<circle cx="9" cy="8" r="4"/><path d="M3 21a6 6 0 0 1 12 0"/><path d="M16 11a4 4 0 0 0 0-6"/><path d="M17 21a6 6 0 0 0-3-5"/>',
  "video": '<rect x="4" y="6" width="12" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
  "volume-x": '<path d="M4 10v4h4l5 4V6l-5 4z"/><path d="m17 9 4 4"/><path d="m21 9-4 4"/><path d="M17 4a8 8 0 0 1 0 16"/>',
  "wrench": '<path d="M14 6a5 5 0 0 0 6 6L10 22l-4-4 10-10a5 5 0 0 0-2-2z"/>',
  "x": '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
};

function icon(name) {
  return `<i data-lucide="${name}"></i>`;
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
    return;
  }
  document.querySelectorAll("i[data-lucide]").forEach((node) => {
    const name = node.dataset.lucide;
    node.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        ${localIconPaths[name] || '<circle cx="12" cy="12" r="8"/>'}
      </svg>
    `;
  });
}

function renderKpis() {
  const target = document.querySelector("#kpiGrid");
  target.innerHTML = kpis.map((item) => `
    <button class="kpi-card action-card" type="button" data-kpi-target="${item.target}">
      <div class="kpi-top">
        <div class="icon-box ${item.tone}">${icon(item.icon)}</div>
        <span class="trend ${item.trend.startsWith("-") ? "up" : item.label.includes("告警") ? "down" : "up"}">${item.trend}</span>
      </div>
      <strong>${item.value}</strong>
      <p>${item.label} · ${item.hint}</p>
    </button>
  `).join("");
}

function renderRack() {
  document.querySelector("#rackReadouts").innerHTML = rackReadouts.map((item) => `
    <div class="readout">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
      <small>${item.hint}</small>
    </div>
  `).join("");
}

function renderSensorStrip() {
  document.querySelector("#sensorStrip").innerHTML = sensorStrip.map((item) => `
    <div class="sensor-mini">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
    </div>
  `).join("");
}

function statusClass(tone) {
  return `status-pill ${tone}`;
}

function renderWorkOrders(list = workOrders) {
  document.querySelector("#workOrderBody").innerHTML = list.map((order) => `
    <tr data-order-id="${order.id}" tabindex="0">
      <td>
        <div class="table-id">
          <strong>${order.id}</strong>
          <span><span class="priority ${order.priority}">${order.priorityText}</span></span>
        </div>
      </td>
      <td>
        <div class="table-id">
          <strong>${order.device}</strong>
          <span>${order.category}</span>
        </div>
      </td>
      <td>${order.location}</td>
      <td>${order.engineer}</td>
      <td><span class="${statusClass(order.statusTone)}">${order.status}</span></td>
      <td><strong>${order.sla}</strong></td>
    </tr>
  `).join("");
}

function renderAlerts() {
  document.querySelector("#alertList").innerHTML = alerts.map((item) => `
    <div class="alert-item">
      <span class="dot" style="background:${toneColor[item.tone]}"></span>
      <div>
        <strong>${item.title}</strong>
        <p>${item.text}</p>
      </div>
    </div>
  `).join("");
}

function renderBoard() {
  document.querySelector("#orderBoard").innerHTML = boardColumns.map((column) => `
    <div class="board-column">
      <h4>${column.title}<span>${column.items.length}</span></h4>
      ${column.items.map((item, index) => `
        <article class="board-card action-card" tabindex="0" data-board-item="${item}">
          <strong>${item}</strong>
          <p>${workOrders[(index + column.title.length) % workOrders.length].location}</p>
          <span class="status-pill ${index % 2 ? "info" : "warn"}">${index % 2 ? "配件确认" : "优先处理"}</span>
        </article>
      `).join("")}
    </div>
  `).join("");
}

function renderDevices() {
  document.querySelector("#deviceGrid").innerHTML = devices.map((device) => `
    <article class="device-card action-card" tabindex="0" data-device-name="${device.name}">
      <div class="device-card-head">
        <div class="icon-box ${device.tone}">${icon(device.icon)}</div>
        <div>
          <h4>${device.name}</h4>
          <p>${device.desc}</p>
        </div>
      </div>
      <div class="device-stats">
        <div><span>总数</span><strong>${device.total}</strong></div>
        <div><span>维修中</span><strong>${device.repair}</strong></div>
        <div><span>风险</span><strong>${device.risk}</strong></div>
      </div>
    </article>
  `).join("");
}

function renderRecords() {
  document.querySelector("#recordTimeline").innerHTML = records.map((record, index) => `
    <article class="timeline-item action-card" tabindex="0" data-record-index="${index}">
      <time>${record.time}</time>
      <div>
        <h4>${record.title}</h4>
        <p>${record.text}</p>
      </div>
    </article>
  `).join("");
}

function renderCameras() {
  document.querySelector("#cameraGrid").innerHTML = cameras.map((camera, index) => `
    <article class="camera-card action-card" tabindex="0" data-camera-index="${index}">
      <div class="camera-feed">
        <div class="camera-overlay">
          <span>${camera.status}</span>
          <span>${camera.time}</span>
        </div>
      </div>
      <div class="camera-meta">
        <div>
          <strong>${camera.name}</strong>
          <span>维修架影像留痕</span>
        </div>
        <button class="icon-button small" type="button" title="查看回放" aria-label="查看回放" data-camera-play="${index}">${icon("play")}</button>
      </div>
    </article>
  `).join("");
}

function renderSensors() {
  document.querySelector("#sensorMatrix").innerHTML = sensors.map((sensor, index) => `
    <article class="sensor-card action-card" tabindex="0" data-sensor-index="${index}">
      <div class="sensor-card-head">
        <div>
          <h4>${sensor.name}</h4>
          <p>${sensor.desc}</p>
        </div>
        <strong>${sensor.value}</strong>
      </div>
      <div class="meter"><span style="width:${sensor.health}%; background:${toneColor[sensor.tone]}"></span></div>
      <span class="${sensor.health < 70 ? "status-pill warn" : "status-pill good"}">${sensor.health < 70 ? "需关注" : "正常"}</span>
    </article>
  `).join("");
}

function renderUsers() {
  document.querySelector("#userList").innerHTML = users.map((user, index) => `
    <article class="user-card action-card" tabindex="0" data-user-index="${index}">
      <div class="avatar">${user.name.slice(0, 1)}</div>
      <div>
        <h4>${user.name}</h4>
        <p>${user.role} · ${user.scope}</p>
      </div>
      <div class="user-actions">
        <span class="${statusClass(user.tone)}">${user.status}</span>
        <button class="icon-button small danger-action" type="button" title="删除用户" aria-label="删除 ${user.name}" data-delete-user="${index}">${icon("trash-2")}</button>
      </div>
    </article>
  `).join("");
}

function drawChart(type = "temperature") {
  const canvas = document.querySelector("#sensorChart");
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(320, Math.floor(rect.width * ratio));
  canvas.height = Math.floor(210 * ratio);

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const pad = 34 * ratio;
  const data = sensorSeries[type];
  const min = Math.min(...data) - (type === "load" ? 5 : 0.8);
  const max = Math.max(...data) + (type === "load" ? 5 : 0.8);

  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1 * ratio;
  ctx.strokeStyle = "rgba(22, 32, 42, 0.08)";
  for (let i = 0; i < 5; i += 1) {
    const y = pad + ((height - pad * 2) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
  }

  const points = data.map((value, index) => {
    const x = pad + ((width - pad * 2) / (data.length - 1)) * index;
    const y = height - pad - ((value - min) / (max - min)) * (height - pad * 2);
    return [x, y];
  });

  const gradient = ctx.createLinearGradient(0, pad, 0, height - pad);
  gradient.addColorStop(0, "rgba(13, 148, 136, 0.32)");
  gradient.addColorStop(1, "rgba(53, 99, 233, 0.02)");

  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(width - pad, height - pad);
  ctx.lineTo(pad, height - pad);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineWidth = 3 * ratio;
  ctx.strokeStyle = type === "vibration" ? toneColor.amber : type === "load" ? toneColor.blue : toneColor.teal;
  ctx.stroke();

  points.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 4 * ratio, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.lineWidth = 2 * ratio;
    ctx.strokeStyle = type === "vibration" ? toneColor.amber : type === "load" ? toneColor.blue : toneColor.teal;
    ctx.stroke();
  });
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.remove("is-hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.add("is-hidden");
  }, 2600);
}

function openModal({ eyebrow, title, body, size = "" }) {
  const root = document.querySelector("#modalRoot");
  const card = document.querySelector("#modalCard");
  card.className = `modal-card ${size}`.trim();
  card.innerHTML = `
    <div class="modal-head">
      <div>
        <p class="eyebrow">${eyebrow}</p>
        <h3 id="modalTitle">${title}</h3>
      </div>
      <button class="icon-button small" type="button" aria-label="关闭弹窗" data-close-modal>${icon("x")}</button>
    </div>
    <div class="modal-body">${body}</div>
  `;
  root.classList.remove("is-hidden");
  refreshIcons();
  card.focus();
}

function closeModal() {
  document.querySelector("#modalRoot").classList.add("is-hidden");
}

function uniqueNames(list) {
  return Array.from(new Set(list.map((item) => item.name || item.engineer))).filter(Boolean);
}

function nextAccount(role) {
  const prefix = role === "engineer" ? "MF" : "HY";
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function roleCopy(role) {
  return role === "engineer"
    ? { title: "维修人员账号注册", roleName: "维修工程师", scopeLabel: "负责设备 / 专长", accountLabel: "维修员工号", status: "待审核", tone: "info" }
    : { title: "院方用户账号注册", roleName: "院方用户", scopeLabel: "科室 / 权限范围", accountLabel: "院方账号", status: "待审核", tone: "info" };
}

function openRegistration(role = "engineer") {
  const copy = roleCopy(role);
  openModal({
    eyebrow: "Account",
    title: copy.title,
    size: "large",
    body: `
      <form class="modal-form" id="registerForm" data-role="${role}">
        <div class="segmented wide">
          <button class="${role === "engineer" ? "active" : ""}" type="button" data-register-role="engineer">维修人员</button>
          <button class="${role === "hospital" ? "active" : ""}" type="button" data-register-role="hospital">院方用户</button>
        </div>
        <div class="form-grid">
          <label>
            <span>姓名</span>
            <input name="name" type="text" placeholder="请输入真实姓名" required>
          </label>
          <label>
            <span>手机号</span>
            <input name="phone" type="tel" placeholder="用于登录验证" required>
          </label>
          <label>
            <span>所属机构</span>
            <input name="hospital" type="text" value="哈尔滨医科大学附属第二医院" required>
          </label>
          <label>
            <span id="scopeLabel">${copy.scopeLabel}</span>
            <select name="scope" required>
              <option value="生命支持 / ICU">生命支持 / ICU</option>
              <option value="检验科 / 门诊">检验科 / 门诊</option>
              <option value="库存 / 采购">库存 / 采购</option>
              <option value="影像中心">影像中心</option>
              <option value="账号 / 审计">账号 / 审计</option>
            </select>
          </label>
          <label>
            <span id="accountLabel">${copy.accountLabel}</span>
            <input name="account" type="text" value="${nextAccount(role)}" readonly>
          </label>
          <label>
            <span>初始密码</span>
            <input name="password" type="password" value="MedFix@2026" required>
          </label>
          <label class="full-line">
            <span>申请说明</span>
            <textarea name="note" rows="3" placeholder="例如负责科室、设备类型、需要开通的权限"></textarea>
          </label>
        </div>
        <div class="modal-actions">
          <button class="ghost-button" type="button" data-close-modal>取消</button>
          <button class="primary-button compact" type="submit">${icon("user-plus")}提交注册</button>
        </div>
      </form>
    `
  });
}

function orderId() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(workOrders.length + 11).padStart(3, "0");
  return `WO-${y}${m}${d}-${seq}`;
}

function openCreateOrder() {
  const engineers = uniqueNames(users).concat(["待分派"]);
  openModal({
    eyebrow: "Work Order",
    title: "创建维修工单",
    size: "large",
    body: `
      <form class="modal-form" id="workOrderForm">
        <div class="form-grid">
          <label>
            <span>设备名称 / 编号</span>
            <input name="device" type="text" value="监护仪 PM-8831" required>
          </label>
          <label>
            <span>设备类别</span>
            <select name="category" required>
              ${devices.map((device) => `<option value="${device.name}">${device.name}</option>`).join("")}
            </select>
          </label>
          <label>
            <span>位置</span>
            <input name="location" type="text" value="心内科 6 楼" required>
          </label>
          <label>
            <span>维修员</span>
            <select name="engineer" required>
              ${engineers.map((name) => `<option value="${name}">${name}</option>`).join("")}
            </select>
          </label>
          <label>
            <span>优先级</span>
            <select name="priority" required>
              <option value="high">高</option>
              <option value="medium" selected>中</option>
              <option value="low">低</option>
            </select>
          </label>
          <label>
            <span>SLA</span>
            <select name="sla" required>
              <option value="00:30">30 分钟</option>
              <option value="02:00" selected>2 小时</option>
              <option value="04:00">4 小时</option>
            </select>
          </label>
          <label class="full-line">
            <span>故障描述</span>
            <textarea name="issue" rows="3" placeholder="录入故障现象、报警代码、现场联系人等信息"></textarea>
          </label>
        </div>
        <div class="modal-actions">
          <button class="ghost-button" type="button" data-close-modal>取消</button>
          <button class="primary-button compact" type="submit">${icon("plus")}保存工单</button>
        </div>
      </form>
    `
  });
}

function openRecordForm() {
  openModal({
    eyebrow: "Maintenance",
    title: "新增维保记录",
    size: "large",
    body: `
      <form class="modal-form" id="recordForm">
        <div class="form-grid">
          <label>
            <span>记录标题</span>
            <input name="title" type="text" value="新设备巡检记录" required>
          </label>
          <label>
            <span>记录时间</span>
            <input name="time" type="time" required>
          </label>
          <label class="full-line">
            <span>维保内容</span>
            <textarea name="text" rows="4" placeholder="填写检测项、处理结果、备件与凭证情况" required></textarea>
          </label>
        </div>
        <div class="modal-actions">
          <button class="ghost-button" type="button" data-close-modal>取消</button>
          <button class="primary-button compact" type="submit">${icon("file-check-2")}保存记录</button>
        </div>
      </form>
    `
  });
  const now = new Date();
  document.querySelector("#recordForm [name='time']").value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function openAlertCenter() {
  openModal({
    eyebrow: "Risk",
    title: "告警中心",
    body: `
      <div class="modal-list">
        ${alerts.map((item) => `
          <button class="modal-list-item" type="button" data-jump="sensors">
            <span class="dot" style="background:${toneColor[item.tone]}"></span>
            <span><strong>${item.title}</strong><small>${item.text}</small></span>
          </button>
        `).join("")}
      </div>
      <div class="modal-actions">
        <button class="ghost-button" type="button" data-jump="location">${icon("map-pinned")}查看定位</button>
        <button class="primary-button compact" type="button" data-jump="sensors">${icon("activity")}查看传感器</button>
      </div>
    `
  });
}

function openOrderDetail(order) {
  openModal({
    eyebrow: "Work Order",
    title: order.id,
    body: `
      <div class="detail-grid">
        <div><span>设备</span><strong>${order.device}</strong></div>
        <div><span>类别</span><strong>${order.category}</strong></div>
        <div><span>位置</span><strong>${order.location}</strong></div>
        <div><span>维修员</span><strong>${order.engineer}</strong></div>
        <div><span>状态</span><strong>${order.status}</strong></div>
        <div><span>SLA</span><strong>${order.sla}</strong></div>
      </div>
      <div class="modal-actions">
        <button class="ghost-button" type="button" data-jump="records">${icon("file-clock")}维保记录</button>
        <button class="primary-button compact" type="button" data-jump="location">${icon("map-pinned")}查看位置</button>
      </div>
    `
  });
}

function openDeviceDetail(device) {
  openModal({
    eyebrow: "Asset",
    title: device.name,
    body: `
      <div class="detail-grid">
        <div><span>说明</span><strong>${device.desc}</strong></div>
        <div><span>资产总数</span><strong>${device.total}</strong></div>
        <div><span>维修中</span><strong>${device.repair}</strong></div>
        <div><span>风险设备</span><strong>${device.risk}</strong></div>
      </div>
      <div class="modal-actions">
        <button class="ghost-button" type="button" data-jump="orders">${icon("clipboard-list")}相关工单</button>
        <button class="primary-button compact" type="button" data-jump="records">${icon("file-clock")}维保记录</button>
      </div>
    `
  });
}

function openRecordDetail(record) {
  openModal({
    eyebrow: "Maintenance",
    title: record.title,
    body: `
      <div class="detail-note">
        <time>${record.time}</time>
        <p>${record.text}</p>
      </div>
      <div class="modal-actions">
        <button class="ghost-button" type="button" data-jump="camera">${icon("video")}查看影像</button>
        <button class="primary-button compact" type="button" data-jump="orders">${icon("clipboard-list")}相关工单</button>
      </div>
    `
  });
}

function openCameraDetail(camera) {
  openModal({
    eyebrow: "Video",
    title: camera.name,
    body: `
      <div class="camera-feed modal-feed">
        <div class="camera-overlay"><span>${camera.status}</span><span>${camera.time}</span></div>
      </div>
      <div class="modal-actions">
        <button class="ghost-button" type="button" data-jump="records">${icon("archive")}归档到维保记录</button>
        <button class="primary-button compact" type="button">${icon("play")}播放回放</button>
      </div>
    `
  });
}

function openSensorDetail(sensor) {
  openModal({
    eyebrow: "Sensors",
    title: sensor.name,
    body: `
      <div class="detail-grid">
        <div><span>监测项</span><strong>${sensor.desc}</strong></div>
        <div><span>当前值</span><strong>${sensor.value}</strong></div>
        <div><span>健康度</span><strong>${sensor.health}%</strong></div>
        <div><span>状态</span><strong>${sensor.health < 70 ? "需关注" : "正常"}</strong></div>
      </div>
      <div class="meter modal-meter"><span style="width:${sensor.health}%; background:${toneColor[sensor.tone]}"></span></div>
      <div class="modal-actions">
        <button class="ghost-button" type="button" data-jump="records">${icon("file-clock")}历史记录</button>
        <button class="primary-button compact" type="button" data-jump="orders">${icon("plus")}生成工单</button>
      </div>
    `
  });
}

function openUserDetail(user) {
  openModal({
    eyebrow: "Users",
    title: user.name,
    body: `
      <div class="detail-grid">
        <div><span>角色</span><strong>${user.role}</strong></div>
        <div><span>范围</span><strong>${user.scope}</strong></div>
        <div><span>状态</span><strong>${user.status}</strong></div>
        <div><span>权限</span><strong>影像、工单、维保</strong></div>
      </div>
      <div class="modal-actions">
        <button class="ghost-button" type="button" data-jump="orders">${icon("clipboard-list")}查看工单</button>
        <button class="primary-button compact" type="button" data-jump="users">${icon("shield-check")}权限策略</button>
      </div>
    `
  });
}

function openDeleteUser(index) {
  const user = users[index];
  if (!user) return;

  openModal({
    eyebrow: "Access",
    title: "删除用户确认",
    body: `
      <div class="detail-note danger-note">
        <p>确认删除 <strong>${user.name}</strong> 的账号吗？删除后该用户将不再显示在当前用户列表中，已注册到本地的演示账号也会同步移除。</p>
      </div>
      <div class="detail-grid">
        <div><span>角色</span><strong>${user.role}</strong></div>
        <div><span>权限范围</span><strong>${user.scope}</strong></div>
        <div><span>状态</span><strong>${user.status}</strong></div>
        <div><span>账号</span><strong>${user.account || "系统演示账号"}</strong></div>
      </div>
      <div class="modal-actions">
        <button class="ghost-button" type="button" data-close-modal>取消</button>
        <button class="primary-button compact danger-button" type="button" data-confirm-delete-user="${index}">${icon("trash-2")}确认删除</button>
      </div>
    `
  });
}

function openSimpleAction(type) {
  const content = {
    filter: ["Dispatch", "工单高级筛选", "可按设备类别、优先级、维修员、科室和 SLA 状态筛选维修队列。"],
    category: ["Asset Taxonomy", "设备类别维护", "可新增设备类别、设置巡检周期、绑定 SOP 与风险等级。"],
    archive: ["Video", "影像归档", "可按工单号、摄像头、维修员与时间范围检索并归档现场影像。"],
    mqtt: ["Sensors", "MQTT 连接状态", "维修架遥测主题在线，温湿度、RFID、定位、摄像头与电源数据持续同步。"],
    sop: ["SOP", "输液泵压力异常 SOP", "1. 核对报警代码；2. 检查泵门锁扣；3. 检查压力传感器排线；4. 空载校准；5. 复测并上传凭证。"],
    map: ["Location", "定位详情", "已定位维修架、待修设备与维修员当前位置，可继续进入定位页面查看路线。"]
  }[type];

  openModal({
    eyebrow: content[0],
    title: content[1],
    body: `
      <div class="detail-note"><p>${content[2]}</p></div>
      <div class="modal-actions">
        <button class="ghost-button" type="button" data-close-modal>关闭</button>
        <button class="primary-button compact" type="button" data-jump="${type === "map" ? "location" : type === "archive" ? "camera" : type === "category" ? "devices" : "orders"}">进入对应界面</button>
      </div>
    `
  });
}

function saveRegisteredUser(user) {
  try {
    const stored = JSON.parse(localStorage.getItem("medfixRegisteredUsers") || "[]");
    stored.unshift(user);
    localStorage.setItem("medfixRegisteredUsers", JSON.stringify(stored.slice(0, 20)));
  } catch (error) {
    return false;
  }
  return true;
}

function loadRegisteredUsers() {
  try {
    const stored = JSON.parse(localStorage.getItem("medfixRegisteredUsers") || "[]");
    users.unshift(...stored);
  } catch (error) {
    return false;
  }
  return true;
}

function removeRegisteredUser(user) {
  try {
    const stored = JSON.parse(localStorage.getItem("medfixRegisteredUsers") || "[]");
    const filtered = stored.filter((item) => {
      if (user.account && item.account) return item.account !== user.account;
      return !(item.name === user.name && item.role === user.role && item.scope === user.scope);
    });
    localStorage.setItem("medfixRegisteredUsers", JSON.stringify(filtered));
  } catch (error) {
    return false;
  }
  return true;
}

function deleteUser(index) {
  const user = users[index];
  if (!user) return;
  users.splice(index, 1);
  removeRegisteredUser(user);
  renderUsers();
  refreshIcons();
  closeModal();
  showToast(`${user.name} 已删除`);
}

function exportOrdersCsv() {
  const header = ["工单", "设备", "类别", "位置", "维修员", "状态", "SLA"];
  const lines = workOrders.map((order) => [order.id, order.device, order.category, order.location, order.engineer, order.status, order.sla]);
  const csv = [header, ...lines].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "MedFix维修工单.csv";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("维修工单已导出");
}

function activateView(view, options = {}) {
  if (view === "alerts") {
    openAlertCenter();
    return;
  }
  if (!titles[view]) return;
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === view);
  });
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelector("#viewTitle").textContent = titles[view];
  if (options.updateHash !== false && window.location.hash !== `#${view}`) {
    window.location.hash = view;
  }
  if (view === "overview") {
    requestAnimationFrame(() => drawChart());
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function filterOrders(term) {
  const normalized = term.trim().toLowerCase();
  if (!normalized) {
    renderWorkOrders();
    return;
  }
  const list = workOrders.filter((order) => {
    return Object.values(order).join(" ").toLowerCase().includes(normalized);
  });
  renderWorkOrders(list);
}

function bindEvents() {
  document.querySelector("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const account = document.querySelector("#accountInput").value.trim();
    const password = document.querySelector("#passwordInput").value.trim();
    if (!account || !password) return;
    document.querySelector("#loginView").classList.add("is-hidden");
    document.querySelector("#appShell").classList.remove("is-hidden");
    const route = window.location.hash.replace("#", "") || "overview";
    activateView(titles[route] ? route : "overview", { updateHash: false });
  });

  document.querySelector("#fillDemo").addEventListener("click", () => {
    document.querySelector("#accountInput").value = "MF-8001";
    document.querySelector("#passwordInput").value = "medfix";
  });

  document.querySelector("#openEngineerRegister").addEventListener("click", () => openRegistration("engineer"));
  document.querySelector("#openHospitalRegister").addEventListener("click", () => openRegistration("hospital"));

  document.querySelector("#logoutButton").addEventListener("click", () => {
    document.querySelector("#appShell").classList.add("is-hidden");
    document.querySelector("#loginView").classList.remove("is-hidden");
  });

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => activateView(button.dataset.view));
  });

  document.querySelectorAll("[data-chart]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-chart]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      drawChart(button.dataset.chart);
    });
  });

  document.querySelector("#searchInput").addEventListener("input", (event) => {
    filterOrders(event.target.value);
  });

  document.querySelector("#searchInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      activateView("orders");
    }
  });

  document.querySelector("#createOrderButton").addEventListener("click", openCreateOrder);
  document.querySelector("#createOrderInline").addEventListener("click", openCreateOrder);
  document.querySelector("#alertCenterButton").addEventListener("click", openAlertCenter);
  document.querySelector("#filterOrdersButton").addEventListener("click", () => openSimpleAction("filter"));
  document.querySelector("#exportOrdersButton").addEventListener("click", exportOrdersCsv);
  document.querySelector("#categoryManageButton").addEventListener("click", () => openSimpleAction("category"));
  document.querySelector("#scanRecordButton").addEventListener("click", openRecordForm);
  document.querySelector("#archiveVideoButton").addEventListener("click", () => openSimpleAction("archive"));
  document.querySelector("#mqttButton").addEventListener("click", () => openSimpleAction("mqtt"));
  document.querySelector("#addUserButton").addEventListener("click", () => openRegistration("engineer"));
  document.querySelector("#openSopButton").addEventListener("click", () => openSimpleAction("sop"));

  document.querySelector("#kpiGrid").addEventListener("click", (event) => {
    const card = event.target.closest("[data-kpi-target]");
    if (!card) return;
    activateView(card.dataset.kpiTarget);
  });

  document.querySelector("#workOrderBody").addEventListener("click", (event) => {
    const row = event.target.closest("[data-order-id]");
    if (!row) return;
    const order = workOrders.find((item) => item.id === row.dataset.orderId);
    if (order) openOrderDetail(order);
  });

  document.querySelector("#workOrderBody").addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const row = event.target.closest("[data-order-id]");
    const order = row ? workOrders.find((item) => item.id === row.dataset.orderId) : null;
    if (order) openOrderDetail(order);
  });

  document.querySelector("#orderBoard").addEventListener("click", (event) => {
    const card = event.target.closest("[data-board-item]");
    if (!card) return;
    activateView("orders");
    openCreateOrder();
  });

  document.querySelector("#deviceGrid").addEventListener("click", (event) => {
    const card = event.target.closest("[data-device-name]");
    if (!card) return;
    const device = devices.find((item) => item.name === card.dataset.deviceName);
    if (device) openDeviceDetail(device);
  });

  document.querySelector("#recordTimeline").addEventListener("click", (event) => {
    const item = event.target.closest("[data-record-index]");
    if (!item) return;
    openRecordDetail(records[Number(item.dataset.recordIndex)]);
  });

  document.querySelector(".facility-map").addEventListener("click", (event) => {
    const marker = event.target.closest(".map-marker");
    if (!marker) return;
    openSimpleAction("map");
  });

  document.querySelector("#cameraGrid").addEventListener("click", (event) => {
    const target = event.target.closest("[data-camera-play], [data-camera-index]");
    if (!target) return;
    const index = Number(target.dataset.cameraPlay || target.dataset.cameraIndex);
    openCameraDetail(cameras[index]);
  });

  document.querySelector("#sensorMatrix").addEventListener("click", (event) => {
    const card = event.target.closest("[data-sensor-index]");
    if (!card) return;
    openSensorDetail(sensors[Number(card.dataset.sensorIndex)]);
  });

  document.querySelector("#userList").addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-user]");
    if (deleteButton) {
      event.stopPropagation();
      openDeleteUser(Number(deleteButton.dataset.deleteUser));
      return;
    }

    const card = event.target.closest("[data-user-index]");
    if (!card) return;
    openUserDetail(users[Number(card.dataset.userIndex)]);
  });

  document.querySelector("#modalRoot").addEventListener("click", (event) => {
    if (event.target.closest("[data-close-modal]")) {
      closeModal();
      return;
    }

    const jump = event.target.closest("[data-jump]");
    if (jump) {
      closeModal();
      activateView(jump.dataset.jump);
      return;
    }

    const confirmDelete = event.target.closest("[data-confirm-delete-user]");
    if (confirmDelete) {
      deleteUser(Number(confirmDelete.dataset.confirmDeleteUser));
      return;
    }

    const roleButton = event.target.closest("[data-register-role]");
    if (roleButton) {
      const form = document.querySelector("#registerForm");
      const role = roleButton.dataset.registerRole;
      const copy = roleCopy(role);
      form.dataset.role = role;
      document.querySelectorAll("[data-register-role]").forEach((button) => button.classList.toggle("active", button === roleButton));
      document.querySelector("#modalTitle").textContent = copy.title;
      document.querySelector("#scopeLabel").textContent = copy.scopeLabel;
      document.querySelector("#accountLabel").textContent = copy.accountLabel;
      form.elements.account.value = nextAccount(role);
    }
  });

  document.addEventListener("submit", (event) => {
    if (event.target.id === "registerForm") {
      event.preventDefault();
      const form = event.target;
      const data = new FormData(form);
      const copy = roleCopy(form.dataset.role);
      const user = {
        name: data.get("name").trim(),
        role: copy.roleName,
        scope: data.get("scope"),
        status: copy.status,
        tone: copy.tone,
        account: data.get("account"),
        phone: data.get("phone")
      };
      users.unshift(user);
      saveRegisteredUser(user);
      renderUsers();
      refreshIcons();
      document.querySelector("#accountInput").value = data.get("account");
      document.querySelector("#passwordInput").value = data.get("password");
      closeModal();
      activateView("users");
      showToast(`${user.name} 注册申请已提交`);
    }

    if (event.target.id === "workOrderForm") {
      event.preventDefault();
      const data = new FormData(event.target);
      const priority = data.get("priority");
      const order = {
        id: orderId(),
        priority,
        priorityText: priority === "high" ? "高" : priority === "medium" ? "中" : "低",
        device: data.get("device").trim(),
        category: data.get("category"),
        location: data.get("location").trim(),
        engineer: data.get("engineer"),
        status: "待分派",
        statusTone: "info",
        sla: data.get("sla")
      };
      workOrders.unshift(order);
      renderWorkOrders();
      renderBoard();
      refreshIcons();
      closeModal();
      activateView("orders");
      showToast(`${order.id} 已创建`);
    }

    if (event.target.id === "recordForm") {
      event.preventDefault();
      const data = new FormData(event.target);
      records.unshift({
        time: data.get("time"),
        title: data.get("title").trim(),
        text: data.get("text").trim()
      });
      renderRecords();
      closeModal();
      activateView("records");
      showToast("维保记录已保存");
    }
  });

  window.addEventListener("hashchange", () => {
    const view = window.location.hash.replace("#", "");
    if (titles[view]) activateView(view, { updateHash: false });
  });

  window.addEventListener("resize", () => {
    const activeChart = document.querySelector("[data-chart].active");
    drawChart(activeChart ? activeChart.dataset.chart : "temperature");
  });
}

function init() {
  loadRegisteredUsers();
  renderKpis();
  renderRack();
  renderSensorStrip();
  renderWorkOrders();
  renderAlerts();
  renderBoard();
  renderDevices();
  renderRecords();
  renderCameras();
  renderSensors();
  renderUsers();
  bindEvents();
  refreshIcons();
  const initialView = window.location.hash.replace("#", "");
  if (titles[initialView]) {
    activateView(initialView, { updateHash: false });
  }
}

init();
