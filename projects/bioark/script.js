const boxes = [
  {
    id: "BA-TX-0287",
    name: "Glacier 0287",
    status: "运输中",
    statusType: "good",
    temp: 3.8,
    humidity: 42,
    battery: 86,
    lock: "已锁定",
    range: "2-8°C",
    location: "G60 沪昆高速",
    route: "上海华山样本中心 → 南京临床研究仓",
    samples: 248,
    telemetry: {
      temp: [4.2, 4.1, 3.9, 3.8, 4.0, 3.7, 3.8, 4.1, 4.0, 3.8, 3.9, 3.8],
      humidity: [43, 42, 42, 41, 42, 43, 42, 41, 40, 42, 43, 42],
      shock: [2, 8],
    },
  },
  {
    id: "BA-TX-0312",
    name: "Sentinel 0312",
    status: "低温稳定",
    statusType: "good",
    temp: -70.2,
    humidity: 35,
    battery: 91,
    lock: "已锁定",
    range: "-80--60°C",
    location: "苏州工业园区",
    route: "苏州生物医药园 → 上海浦东机场",
    samples: 96,
    telemetry: {
      temp: [-69.8, -70.0, -70.1, -70.3, -70.2, -70.2, -70.4, -70.1, -70.0, -70.2, -70.3, -70.2],
      humidity: [36, 35, 36, 35, 35, 34, 35, 35, 36, 35, 35, 35],
      shock: [6],
    },
  },
  {
    id: "BA-TX-0221",
    name: "Harbor 0221",
    status: "温度漂移",
    statusType: "danger",
    temp: 8.9,
    humidity: 48,
    battery: 63,
    lock: "已锁定",
    range: "2-8°C",
    location: "无锡东收费站",
    route: "杭州细胞库 → 无锡三院",
    samples: 172,
    telemetry: {
      temp: [5.8, 6.1, 6.4, 7.2, 7.7, 8.1, 8.4, 8.6, 8.8, 8.9, 8.7, 8.9],
      humidity: [44, 44, 45, 45, 46, 46, 47, 48, 48, 49, 48, 48],
      shock: [4, 9],
    },
  },
  {
    id: "BA-TX-0406",
    name: "Aegis 0406",
    status: "待清洁",
    statusType: "idle",
    temp: 21.6,
    humidity: 51,
    battery: 78,
    lock: "仓内开盖",
    range: "常温",
    location: "南京临床研究仓",
    route: "仓储维护",
    samples: 0,
    telemetry: {
      temp: [20.9, 21.1, 21.2, 21.0, 21.4, 21.3, 21.5, 21.7, 21.6, 21.4, 21.5, 21.6],
      humidity: [50, 51, 51, 52, 51, 50, 51, 51, 52, 51, 51, 51],
      shock: [],
    },
  },
];

const samples = [
  ["SMP-26-0518-001", "血清", "2-8°C", "BA-TX-0287", "在途监测", "燕政洁"],
  ["SMP-26-0518-014", "PBMC", "-80--60°C", "BA-TX-0312", "机场待运", "高宏伟"],
  ["SMP-26-0518-027", "组织切片", "2-8°C", "BA-TX-0221", "P1 复核", "张艺可"],
  ["SMP-26-0518-039", "核酸提取液", "2-8°C", "BA-TX-0287", "签收预约", "金靖馨"],
  ["SMP-26-0518-052", "细胞悬液", "-80--60°C", "BA-TX-0312", "在途监测", "高宏伟"],
];

const baseEvents = [
  {
    level: "danger",
    icon: "thermometer",
    title: "BA-TX-0221 温度高于阈值",
    detail: "8.9°C 持续 7 分钟，已通知质量负责人和司机。",
  },
  {
    level: "warning",
    icon: "map-pinned",
    title: "BA-TX-0221 接近地理围栏边界",
    detail: "当前位置偏离推荐路线 1.8 km，建议确认路况。",
  },
  {
    level: "normal",
    icon: "scan-line",
    title: "BA-TX-0287 电子封签校验通过",
    detail: "取样方、承运方、接收方签名链完整。",
  },
  {
    level: "normal",
    icon: "wifi",
    title: "BA-TX-0312 离线缓存补传完成",
    detail: "补传 38 条温湿度记录，时间戳连续。",
  },
];

const roles = [
  ["YZ", "燕政洁", "质量负责人", "全局审计 / 阈值配置"],
  ["GH", "高宏伟", "物流调度", "任务分配 / 路线追踪"],
  ["ZY", "张艺可", "实验室管理员", "样本建档 / 入箱复核"],
  ["JJ", "金靖馨", "接收方", "签收确认 / 报告查看"],
  ["GF", "桂菲", "审计专员", "告警复核 / 合规导出"],
  ["ZJ", "周锦程", "设备工程师", "设备维护 / 传感器校准"],
];

let selectedBox = boxes[0];
let events = [...baseEvents];

const els = {
  boxList: document.querySelector("#boxList"),
  sampleTable: document.querySelector("#sampleTable"),
  eventStream: document.querySelector("#eventStream"),
  roleList: document.querySelector("#roleList"),
  chart: document.querySelector("#telemetryChart"),
  selectedBoxName: document.querySelector("#selectedBoxName"),
  selectedStatus: document.querySelector("#selectedStatus"),
  selectedTemp: document.querySelector("#selectedTemp"),
  selectedHumidity: document.querySelector("#selectedHumidity"),
  selectedBattery: document.querySelector("#selectedBattery"),
  selectedLock: document.querySelector("#selectedLock"),
  selectedRange: document.querySelector("#selectedRange"),
  selectedLocation: document.querySelector("#selectedLocation"),
  routeStatus: document.querySelector("#routeStatus"),
  globalSearch: document.querySelector("#globalSearch"),
  refreshButton: document.querySelector("#refreshButton"),
};

function statusClass(type) {
  return `status-badge ${type || "good"}`;
}

function renderBoxes(filter = "") {
  const query = filter.trim().toLowerCase();
  const visibleBoxes = boxes.filter((box) => {
    const text = `${box.id} ${box.name} ${box.status} ${box.location} ${box.route}`.toLowerCase();
    return text.includes(query);
  });

  els.boxList.innerHTML = visibleBoxes
    .map(
      (box) => `
        <button class="box-row ${box.id === selectedBox.id ? "active" : ""}" type="button" data-box-id="${box.id}">
          <span class="status-dot"></span>
          <span>
            <h3>${box.id} · ${box.name}</h3>
            <p>${box.route}</p>
            <span class="box-metrics">
              <span>${box.temp.toFixed(1)}°C</span>
              <span>${box.humidity}%RH</span>
              <span>${box.samples} 样本</span>
              <span>${box.location}</span>
            </span>
          </span>
          <span class="battery-ring">${box.battery}%</span>
        </button>
      `,
    )
    .join("");

  els.boxList.querySelectorAll(".box-row").forEach((button) => {
    button.addEventListener("click", () => {
      selectedBox = boxes.find((box) => box.id === button.dataset.boxId) || boxes[0];
      updateSelectedBox();
      renderBoxes(els.globalSearch.value);
      renderSamples(els.globalSearch.value);
    });
  });
}

function renderSamples(filter = "") {
  const query = filter.trim().toLowerCase();
  const visibleSamples = samples.filter((row) =>
    row.join(" ").toLowerCase().includes(query),
  );

  els.sampleTable.innerHTML = visibleSamples
    .map(
      ([id, type, range, boxId, handover, owner]) => `
        <tr>
          <td class="sample-id">${id}</td>
          <td>${type}</td>
          <td>${range}</td>
          <td>${boxId}</td>
          <td><span class="${handover.includes("P1") ? "status-badge danger" : "status-badge good"}">${handover}</span></td>
          <td>${owner}</td>
        </tr>
      `,
    )
    .join("");
}

function renderEvents() {
  els.eventStream.innerHTML = events
    .map(
      (event) => `
        <article class="event-item ${event.level === "normal" ? "" : event.level}">
          <span class="event-icon"><i data-lucide="${event.icon}"></i></span>
          <span>
            <strong>${event.title}</strong>
            <span>${event.detail}</span>
          </span>
        </article>
      `,
    )
    .join("");
  createIcons();
}

function renderRoles() {
  els.roleList.innerHTML = roles
    .map(
      ([initials, name, role, permission]) => `
        <article class="role-item">
          <span class="role-avatar">${initials}</span>
          <span>
            <strong>${name}</strong>
            <span>${role}</span>
          </span>
          <span class="role-permission">${permission}</span>
        </article>
      `,
    )
    .join("");
}

function updateSelectedBox() {
  els.selectedBoxName.textContent = `${selectedBox.id} · ${selectedBox.name}`;
  els.selectedStatus.textContent = selectedBox.status;
  els.selectedStatus.className = statusClass(selectedBox.statusType);
  els.selectedTemp.textContent = `${selectedBox.temp.toFixed(1)}°C`;
  els.selectedHumidity.textContent = `${selectedBox.humidity}%`;
  els.selectedBattery.textContent = `${selectedBox.battery}%`;
  els.selectedLock.textContent = selectedBox.lock;
  els.selectedRange.textContent = selectedBox.range;
  els.selectedLocation.textContent = selectedBox.location;
  els.routeStatus.textContent = `${selectedBox.location} · 每 30 秒回传`;
  drawTelemetryChart(selectedBox.telemetry);
}

function drawTelemetryChart(series) {
  const canvas = els.chart;
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(320, Math.floor(rect.width * ratio));
  canvas.height = Math.floor(rect.height * ratio);
  ctx.scale(ratio, ratio);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 26, right: 18, bottom: 28, left: 42 };
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "#dbe5e1";
  ctx.lineWidth = 1;
  ctx.font = "12px Inter, sans-serif";
  ctx.fillStyle = "#60706b";

  for (let i = 0; i < 5; i += 1) {
    const y = padding.top + ((height - padding.top - padding.bottom) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  const tempValues = series.temp;
  const humidityValues = series.humidity;
  const tempMin = Math.min(...tempValues);
  const tempMax = Math.max(...tempValues);
  const humidityMin = Math.min(...humidityValues);
  const humidityMax = Math.max(...humidityValues);

  function plot(values, color, min, max) {
    const spread = Math.max(max - min, 1);
    ctx.beginPath();
    values.forEach((value, index) => {
      const x =
        padding.left +
        ((width - padding.left - padding.right) / (values.length - 1)) * index;
      const y =
        height -
        padding.bottom -
        ((value - min) / spread) * (height - padding.top - padding.bottom);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    values.forEach((value, index) => {
      const x =
        padding.left +
        ((width - padding.left - padding.right) / (values.length - 1)) * index;
      const y =
        height -
        padding.bottom -
        ((value - min) / spread) * (height - padding.top - padding.bottom);
      ctx.beginPath();
      ctx.arc(x, y, 3.8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  plot(tempValues, "#0b8f88", tempMin, tempMax);
  plot(humidityValues, "#2a9dcc", humidityMin, humidityMax);

  series.shock.forEach((index) => {
    const x =
      padding.left +
      ((width - padding.left - padding.right) / (tempValues.length - 1)) * index;
    ctx.beginPath();
    ctx.arc(x, padding.top + 16, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#d99717";
    ctx.fill();
  });

  ctx.fillStyle = "#60706b";
  ctx.fillText(`${tempMin.toFixed(1)}°`, 8, height - padding.bottom);
  ctx.fillText(`${tempMax.toFixed(1)}°`, 8, padding.top + 4);
  ctx.fillText("now", width - 42, height - 8);
}

function simulateRealtime() {
  const tempDelta = selectedBox.statusType === "danger" ? 0.12 : (Math.random() - 0.48) * 0.18;
  const humidityDelta = Math.round((Math.random() - 0.45) * 2);
  selectedBox.temp = Number((selectedBox.temp + tempDelta).toFixed(1));
  selectedBox.humidity = Math.max(25, Math.min(72, selectedBox.humidity + humidityDelta));
  selectedBox.telemetry.temp = [...selectedBox.telemetry.temp.slice(1), selectedBox.temp];
  selectedBox.telemetry.humidity = [
    ...selectedBox.telemetry.humidity.slice(1),
    selectedBox.humidity,
  ];

  events = [
    {
      level: selectedBox.statusType === "danger" ? "warning" : "normal",
      icon: "radio-tower",
      title: `${selectedBox.id} 已同步最新传感器数据`,
      detail: `${new Date().toLocaleTimeString("zh-CN", { hour12: false })} · ${selectedBox.temp.toFixed(1)}°C / ${selectedBox.humidity}%RH / ${selectedBox.location}`,
    },
    ...events.slice(0, 3),
  ];

  updateSelectedBox();
  renderBoxes(els.globalSearch.value);
  renderEvents();
}

const fallbackIconPaths = {
  "layout-dashboard": '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  "package-check": '<path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M9 13l2 2 4-4"/>',
  route: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h5a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7"/>',
  "test-tube-2": '<path d="M7 2h10"/><path d="M9 2v6.5L4.7 17a3.5 3.5 0 0 0 3.1 5h8.4a3.5 3.5 0 0 0 3.1-5L15 8.5V2"/><path d="M7.8 14h8.4"/>',
  "shield-alert": '<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/><path d="M12 8v5"/><path d="M12 17h.01"/>',
  "users-round": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  "refresh-cw": '<path d="M21 12a9 9 0 0 1-15.5 6.2"/><path d="M3 12A9 9 0 0 1 18.5 5.8"/><path d="M18 2v4h4"/><path d="M6 22v-4H2"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  "file-down": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M12 12v6"/><path d="m9 15 3 3 3-3"/>',
  "lock-keyhole": '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1"/>',
  satellite: '<path d="M13 7 7 13"/><path d="m8 6 10 10"/><path d="M16 4a6 6 0 0 1 4 4"/><path d="M4 16a6 6 0 0 0 4 4"/><rect x="7" y="7" width="10" height="10" rx="2" transform="rotate(45 12 12)"/>',
  "thermometer-sun": '<path d="M14 4a4 4 0 0 1 4 4"/><path d="M6 15.5V5a3 3 0 0 1 6 0v10.5a5 5 0 1 1-6 0Z"/><path d="M9 9v7"/><path d="M18 2v2"/><path d="M21 5h-2"/>',
  "badge-check": '<path d="M12 2 9.8 4.2 6.7 3.6l-.6 3.1L3 7.8 4.2 11 2 13.2l3.1 1.1.6 3.1 3.1-.6L12 20l3.2-3.2 3.1.6.6-3.1 3.1-1.1L19.8 11 21 7.8l-3.1-1.1-.6-3.1-3.1.6L12 2Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
  "maximize-2": '<path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="M9 21H3v-6"/><path d="m3 21 7-7"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  "user-plus": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
  fingerprint: '<path d="M12 11c0 2.8-1.2 5-3 6.5"/><path d="M16 17.5c1-2 1.5-4.1 1.5-6.5a5.5 5.5 0 0 0-11 0"/><path d="M8.5 21c3.5-2.5 5.5-5.8 5.5-10a2 2 0 1 0-4 0c0 1.8-.5 3.2-1.5 4.4"/><path d="M4 13.5V11a8 8 0 0 1 16 0c0 1.4-.1 2.8-.4 4.1"/>',
  "file-lock-2": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><rect x="8" y="14" width="8" height="5" rx="1"/><path d="M10 14v-2a2 2 0 0 1 4 0v2"/>',
  "database-backup": '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3h1"/><path d="m16 18 3-3 3 3"/><path d="M19 15v7"/>',
  "shield-check": '<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
  thermometer: '<path d="M6 15.5V5a3 3 0 0 1 6 0v10.5a5 5 0 1 1-6 0Z"/><path d="M9 9v7"/>',
  "map-pinned": '<path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/><path d="M4 22h16"/>',
  "scan-line": '<path d="M4 7V5a1 1 0 0 1 1-1h2"/><path d="M17 4h2a1 1 0 0 1 1 1v2"/><path d="M20 17v2a1 1 0 0 1-1 1h-2"/><path d="M7 20H5a1 1 0 0 1-1-1v-2"/><path d="M7 12h10"/>',
  wifi: '<path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M12 20h.01"/>',
  "radio-tower": '<path d="M4.9 16.8a10 10 0 0 1 0-9.6"/><path d="M19.1 7.2a10 10 0 0 1 0 9.6"/><path d="M8.4 14.4a5 5 0 0 1 0-4.8"/><path d="M15.6 9.6a5 5 0 0 1 0 4.8"/><path d="M12 12h.01"/><path d="M12 12l-2 9h4l-2-9Z"/>',
};

function createFallbackIcons() {
  document.querySelectorAll("i[data-lucide]").forEach((placeholder) => {
    const name = placeholder.dataset.lucide;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = fallbackIconPaths[name] || '<circle cx="12" cy="12" r="8"/><path d="M12 8v8"/><path d="M8 12h8"/>';
    placeholder.replaceWith(svg);
  });
}

function createIcons() {
  if (window.lucide) {
    window.lucide.createIcons({ attrs: { "stroke-width": 2 } });
    return;
  }
  createFallbackIcons();
}

function bindInteractions() {
  els.globalSearch.addEventListener("input", (event) => {
    renderBoxes(event.target.value);
    renderSamples(event.target.value);
  });

  els.refreshButton.addEventListener("click", simulateRealtime);

  document.querySelectorAll(".segmented-control button").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".segmented-control button")
        .forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      drawTelemetryChart(selectedBox.telemetry);
    });
  });

  document.querySelectorAll(".nav-item").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  window.addEventListener("resize", () => drawTelemetryChart(selectedBox.telemetry));
}

function init() {
  renderBoxes();
  renderSamples();
  renderEvents();
  renderRoles();
  updateSelectedBox();
  bindInteractions();
  createIcons();
}

init();
