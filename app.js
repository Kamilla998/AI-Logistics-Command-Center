
/* =========================================
   NORTHSTAR LOGISTICS COMMAND CENTER
   PHASE 1 — LOAD MANAGEMENT
   ========================================= */

const STORAGE_KEY = "northstar_loads_v2";

const initialLoads = [
  {id:"LD-28491",origin:"Los Angeles, CA",destination:"Dallas, TX",driver:"Marcus Johnson",pickup:"2026-11-21",delivery:"2026-11-22",status:"In Transit",rate:2850},
  {id:"LD-28490",origin:"Chicago, IL",destination:"Atlanta, GA",driver:"Sarah Williams",pickup:"2026-11-20",delivery:"2026-11-21",status:"Delivered",rate:1940},
  {id:"LD-28489",origin:"Houston, TX",destination:"Phoenix, AZ",driver:"David Chen",pickup:"2026-11-21",delivery:"2026-11-23",status:"In Transit",rate:3120},
  {id:"LD-28488",origin:"New York, NY",destination:"Boston, MA",driver:"James Miller",pickup:"2026-11-21",delivery:"2026-11-21",status:"Delayed",rate:980},
  {id:"LD-28487",origin:"Miami, FL",destination:"Orlando, FL",driver:"Olivia Brown",pickup:"2026-11-20",delivery:"2026-11-20",status:"Delivered",rate:760},
  {id:"LD-28486",origin:"Denver, CO",destination:"Kansas City, MO",driver:"Noah Davis",pickup:"2026-11-22",delivery:"2026-11-23",status:"Pending",rate:1680},
  {id:"LD-28485",origin:"Seattle, WA",destination:"Portland, OR",driver:"Ethan Wilson",pickup:"2026-11-21",delivery:"2026-11-21",status:"In Transit",rate:890},
  {id:"LD-28484",origin:"Nashville, TN",destination:"Charlotte, NC",driver:"Ava Martinez",pickup:"2026-11-20",delivery:"2026-11-21",status:"Delivered",rate:1320}
];

let loads = loadSavedData();
let editingLoadId = null;

const drivers = [
 ["Marcus Johnson","T-104","Dallas, TX","LD-28491","7h 20m","On route"],
 ["Sarah Williams","T-087","Atlanta, GA","—","10h 45m","Available"],
 ["David Chen","T-112","El Paso, TX","LD-28489","6h 10m","On route"],
 ["James Miller","T-063","New York, NY","LD-28488","4h 30m","Attention"],
 ["Olivia Brown","T-091","Orlando, FL","—","11h 00m","Available"],
 ["Noah Davis","T-125","Denver, CO","LD-28486","8h 15m","Assigned"],
 ["Ethan Wilson","T-076","Portland, OR","LD-28485","5h 50m","On route"],
 ["Ava Martinez","T-099","Charlotte, NC","—","9h 40m","Available"]
];

const agents = [
 ["✧","Chief of Staff","Coordinates the AI team and prepares daily reports.","Operations"],
 ["↗","GTM Engineer","Supports product launches and growth experiments.","Growth"],
 ["⌕","SEO / AEO Employee","Creates search-focused content.","Marketing"],
 ["⌘","Web Dev Employee","Reviews code and identifies application bugs.","Engineering"],
 ["◎","Social Media Employee","Prepares social media content.","Marketing"],
 ["$","Ad Manager Employee","Monitors advertising performance.","Marketing"],
 ["⇧","Sales Employee","Researches prospects and drafts outreach.","Sales"],
 ["♡","Customer Support","Organizes support requests.","Support"]
];

/* ---------- STORAGE ---------- */

function loadSavedData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [...initialLoads];
  } catch (error) {
    console.error("Could not load saved data:", error);
    return [...initialLoads];
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loads));
  } catch (error) {
    console.error("Could not save data:", error);
    toast("Could not save data in this browser.");
  }
}

/* ---------- HELPERS ---------- */

const $ = selector => document.querySelector(selector);

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  })[char]);
}

function money(value) {
  return "$" + Number(value || 0).toLocaleString("en-US");
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value + "T12:00:00");

  return date.toLocaleDateString("en-US", {
    month:"short",
    day:"numeric",
    year:"numeric"
  });
}

function statusClass(status) {
  return {
    "In Transit":"status-transit",
    "Delivered":"status-delivered",
    "Delayed":"status-delayed",
    "Pending":"status-pending"
  }[status] || "status-pending";
}

function statusTag(status) {
  return `<span class="status-pill ${statusClass(status)}">${escapeHTML(status)}</span>`;
}

function toast(message) {
  const element = $("#toast");
  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    element.classList.remove("show");
  }, 2800);
}

/* ---------- LOAD ID ---------- */

function createLoadId() {
  const numbers = loads
    .map(load => Number(load.id.replace(/\D/g, "")))
    .filter(Number.isFinite);

  const next = Math.max(28499, ...numbers) + 1;

  return "LD-" + next;
}

/* ---------- OVERVIEW ---------- */

function renderRecent() {
  const table = $("#recentLoads");
  if (!table) return;

  table.innerHTML = loads.slice(0, 5).map(load => `
    <tr>
      <td class="load-id">${escapeHTML(load.id)}</td>
      <td class="route-cell">
        ${escapeHTML(load.origin.split(",")[0])}
        <span>→</span>
        ${escapeHTML(load.destination.split(",")[0])}
      </td>
      <td>${escapeHTML(load.driver)}</td>
      <td>${statusTag(load.status)}</td>
      <td>${money(load.rate)}</td>
    </tr>
  `).join("");
}

function updateDashboard() {
  const active = loads.filter(load =>
    load.status !== "Delivered"
  ).length;

  const revenue = loads.reduce(
    (sum, load) => sum + Number(load.rate || 0), 0
  );

  const delivered = loads.filter(
    load => load.status === "Delivered"
  ).length;

  const total = loads.length;
  const onTime = total ? Math.round(delivered / total * 100) : 0;

  const values = document.querySelectorAll(
    "#page-overview .kpi-value"
  );

  if (values[0]) values[0].textContent = active;
  if (values[1]) values[1].textContent = onTime + "%";
  if (values[2]) values[2].textContent = money(revenue);

  const count = $(".nav-count");
  if (count) count.textContent = loads.length;

  const loadCount = $("#loadCount");
  if (loadCount) loadCount.textContent = loads.length;
}

/* ---------- LOAD BOARD ---------- */

function renderLoads() {
  const table = $("#allLoads");
  if (!table) return;

  const query = ($("#loadSearch")?.value || "")
    .trim()
    .toLowerCase();

  const status = $("#statusFilter")?.value || "all";

  const filtered = loads.filter(load => {
    const matchesStatus =
      status === "all" || load.status === status;

    const searchable = [
      load.id,
      load.origin,
      load.destination,
      load.driver,
      load.status
    ].join(" ").toLowerCase();

    return matchesStatus && searchable.includes(query);
  });

  table.innerHTML = filtered.map(load => `
    <tr>
      <td class="load-id">${escapeHTML(load.id)}</td>
      <td>${escapeHTML(load.origin)}</td>
      <td>${escapeHTML(load.destination)}</td>
      <td>${escapeHTML(load.driver)}</td>
      <td>${formatDate(load.pickup)}</td>
      <td>${formatDate(load.delivery)}</td>
      <td>${statusTag(load.status)}</td>
      <td>${money(load.rate)}</td>
      <td>
        <button class="btn btn-secondary"
          data-edit="${escapeHTML(load.id)}"
          style="padding:6px 9px">
          Edit
        </button>
      </td>
    </tr>
  `).join("") || `
    <tr>
      <td colspan="9" style="text-align:center;padding:25px">
        No matching loads found.
      </td>
    </tr>
  `;

  if ($("#loadCount")) {
    $("#loadCount").textContent = filtered.length;
  }
}

function addActionsColumn() {
  const header = $("#page-loads table thead tr");

  if (header && !header.querySelector(".actions-heading")) {
    const th = document.createElement("th");
    th.className = "actions-heading";
    th.textContent = "ACTIONS";
    header.appendChild(th);
  }
}

/* ---------- CREATE / EDIT MODAL ---------- */

function prepareModal() {
  const form = $("#loadForm");
  if (!form) return;

  const statusLabel = document.createElement("label");

  statusLabel.innerHTML = `
    Load status
    <select name="status" id="loadStatus">
      <option>Pending</option>
      <option>In Transit</option>
      <option>Delivered</option>
      <option>Delayed</option>
    </select>
  `;

  const submit = form.querySelector('[type="submit"]');
  form.insertBefore(statusLabel, submit);

  const hint = form.querySelector(".form-hint");
  if (hint) {
    hint.textContent =
      "Changes are saved in this browser. Backend not connected.";
  }
}

function openModal(load = null) {
  const backdrop = $("#modalBackdrop");
  const form = $("#loadForm");

  if (!backdrop || !form) return;

  form.reset();
  editingLoadId = load ? load.id : null;

  const heading = backdrop.querySelector(".modal-head h2");
  const submit = form.querySelector('[type="submit"]');

  if (load) {
    heading.textContent = "Edit load " + load.id;

    form.elements.origin.value = load.origin;
    form.elements.destination.value = load.destination;
    form.elements.driver.value = load.driver;
    form.elements.rate.value = load.rate;
    form.elements.pickup.value = load.pickup;
    form.elements.delivery.value = load.delivery;
    form.elements.status.value = load.status;

    submit.textContent = "Save changes";
  } else {
    heading.textContent = "Create a new load";
    form.elements.status.value = "Pending";
    submit.textContent = "Create load";
  }

  backdrop.classList.add("show");
}

function closeModal() {
  $("#modalBackdrop")?.classList.remove("show");
  editingLoadId = null;
}

function handleLoadSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);

  const origin = String(data.get("origin") || "").trim();
  const destination = String(data.get("destination") || "").trim();
  const driver = String(data.get("driver") || "").trim();
  const rate = Number(data.get("rate"));
  const pickup = String(data.get("pickup") || "");
  const delivery = String(data.get("delivery") || "");
  const status = String(data.get("status") || "Pending");

  if (!origin || !destination || !driver || !pickup || !delivery || rate <= 0) {
    toast("Please complete all fields correctly.");
    return;
  }

  if (delivery < pickup) {
    toast("Delivery date cannot be before pickup date.");
    return;
  }

  const record = {
    id: editingLoadId || createLoadId(),
    origin,
    destination,
    driver,
    rate,
    pickup,
    delivery,
    status
  };

  if (editingLoadId) {
    const index = loads.findIndex(
      load => load.id === editingLoadId
    );

    if (index !== -1) loads[index] = record;

    toast("Load updated successfully.");
  } else {
    loads.unshift(record);
    toast("New load created successfully.");
  }

  saveData();
  refreshAll();
  closeModal();
}

/* ---------- QUICK STATUS UPDATE ---------- */

function handleTableActions(event) {
  const button = event.target.closest("[data-edit]");
  if (!button) return;

  const load = loads.find(
    item => item.id === button.dataset.edit
  );

  if (load) openModal(load);
}

/* ---------- DRIVERS ---------- */

function renderDrivers(query = "") {
  const table = $("#driverRows");
  if (!table) return;

  const filtered = drivers.filter(driver =>
    driver.join(" ").toLowerCase().includes(query.toLowerCase())
  );

  table.innerHTML = filtered.map(driver => `
    <tr>
      <td><b>${escapeHTML(driver[0])}</b></td>
      <td>${escapeHTML(driver[1])}</td>
      <td>${escapeHTML(driver[2])}</td>
      <td>${escapeHTML(driver[3])}</td>
      <td>${escapeHTML(driver[4])}</td>
      <td>
        ${driver[5] === "On route"
          ? statusTag("In Transit")
          : driver[5] === "Available"
          ? statusTag("Delivered")
          : driver[5] === "Attention"
          ? statusTag("Delayed")
          : statusTag("Pending")}
      </td>
    </tr>
  `).join("") || `
    <tr><td colspan="6">No drivers found.</td></tr>
  `;
}

/* ---------- AI EMPLOYEES ---------- */

function renderAgents() {
  const mini = $("#agentMiniList");
  const grid = $("#agentGrid");

  if (mini) {
    mini.innerHTML = agents.slice(0, 4).map(agent => `
      <div class="agent-mini">
        <span class="agent-avatar">${agent[0]}</span>
        <div>
          <b>${agent[1]}</b>
          <small>${agent[2]}</small>
        </div>
        <span class="agent-state">Setup</span>
      </div>
    `).join("");
  }

  if (grid) {
    grid.innerHTML = agents.map(agent => `
      <article class="agent-card">
        <div class="agent-card-top">
          <span class="agent-avatar">${agent[0]}</span>
          <span class="status-pill status-pending">SETUP</span>
        </div>
        <h3>${agent[1]}</h3>
        <p>${agent[2]}</p>
        <div class="agent-card-foot">
          <span>${agent[3]}</span>
          <b>Not connected</b>
        </div>
      </article>
    `).join("");
  }
}

/* ---------- DISPATCH QUEUE ---------- */

function renderQueue() {
  const queue = $("#dispatchQueue");
  if (!queue) return;

  const items = loads.filter(load =>
    ["Delayed", "Pending"].includes(load.status)
  );

  queue.innerHTML = items.map(load => `
    <div class="queue-item">
      <b>
        ${escapeHTML(load.id)} ·
        ${escapeHTML(load.origin.split(",")[0])}
        →
        ${escapeHTML(load.destination.split(",")[0])}
      </b>
      <p>
        ${escapeHTML(load.driver)} · ${money(load.rate)}
      </p>
      ${statusTag(load.status)}
    </div>
  `).join("") || `
    <div class="empty-state">
      <b>All clear</b>
      <p>No loads currently require attention.</p>
    </div>
  `;
}

/* ---------- CSV EXPORT ---------- */

function csvExport(rows, filename) {
  const csv = rows.map(row =>
    row.map(value =>
      `"${String(value ?? "").replace(/"/g, '""')}"`
    ).join(",")
  ).join("\n");

  const blob = new Blob(
    ["\uFEFF" + csv],
    {type:"text/csv;charset=utf-8;"}
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function exportLoads() {
  csvExport([
    ["Load ID","Origin","Destination","Driver","Pickup","Delivery","Status","Rate USD"],
    ...loads.map(load => [
      load.id,
      load.origin,
      load.destination,
      load.driver,
      load.pickup,
      load.delivery,
      load.status,
      load.rate
    ])
  ], "northstar-loads.csv");

  toast("CSV file exported.");
}

/* ---------- NAVIGATION ---------- */

function showPage(name) {
  document.querySelectorAll(".page").forEach(page =>
    page.classList.remove("active-page")
  );

  const page = $("#page-" + name) || $("#page-overview");
  page.classList.add("active-page");

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle(
      "active",
      link.dataset.page === name
    );
  });

  const titles = {
    overview:"Overview",
    loads:"Load board",
    fleet:"Fleet & drivers",
    dispatch:"Dispatch",
    finance:"Finance",
    analytics:"Analytics",
    agents:"AI employees",
    reports:"Daily reports"
  };

  if ($("#breadcrumbPage")) {
    $("#breadcrumbPage").textContent = titles[name] || "Overview";
  }

  $("#sidebar")?.classList.remove("open");
}

function navigateFromHash() {
  const name = location.hash.replace("#", "") || "overview";
  showPage(name);
}

/* ---------- REFRESH ---------- */

function refreshAll() {
  renderRecent();
  renderLoads();
  renderQueue();
  updateDashboard();
}

/* ---------- REPORT ---------- */

function generateDemoReport() {
  const report = $("#reportHistory");
  if (!report) return;

  const active = loads.filter(
    load => load.status !== "Delivered"
  ).length;

  const delivered = loads.filter(
    load => load.status === "Delivered"
  ).length;

  const revenue = loads.reduce(
    (sum, load) => sum + Number(load.rate), 0
  );

  report.className = "";

  report.innerHTML = `
    <div class="queue-item">
      <b>Daily operations report</b>
      <p>Generated: ${new Date().toLocaleString("en-US")}</p>
      <p>Total loads: ${loads.length}</p>
      <p>Active loads: ${active}</p>
      <p>Delivered loads: ${delivered}</p>
      <p>Total sample load value: ${money(revenue)}</p>
      <span class="status-pill status-pending">LOCAL DEMO REPORT</span>
    </div>
  `;

  toast("Demo report generated.");
}

/* ---------- INITIALIZATION ---------- */

function setup() {
  const date = $("#todayDate");

  if (date) {
    date.textContent = new Date().toLocaleDateString("en-US", {
      weekday:"short",
      month:"short",
      day:"numeric",
      year:"numeric"
    });
  }

  prepareModal();
  addActionsColumn();

  renderDrivers();
  renderAgents();
  refreshAll();

  navigateFromHash();

  /* Navigation */
  document.querySelectorAll("[data-page]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();

      const page = link.dataset.page;
      location.hash = page;
      showPage(page);
    });
  });

  window.addEventListener("hashchange", navigateFromHash);

  /* Mobile menu */
  $("#mobileMenu")?.addEventListener("click", () => {
    $("#sidebar")?.classList.toggle("open");
  });

  /* Modal */
  $("#newLoadBtn")?.addEventListener("click", () => openModal());
  $("#newLoadBtn2")?.addEventListener("click", () => openModal());
  $("#closeModal")?.addEventListener("click", closeModal);

  $("#modalBackdrop")?.addEventListener("click", event => {
    if (event.target.id === "modalBackdrop") closeModal();
  });

  $("#loadForm")?.addEventListener("submit", handleLoadSubmit);

  /* Load board */
  $("#allLoads")?.addEventListener("click", handleTableActions);
  $("#loadSearch")?.addEventListener("input", renderLoads);
  $("#statusFilter")?.addEventListener("change", renderLoads);

  $("#clearFilters")?.addEventListener("click", () => {
    $("#loadSearch").value = "";
    $("#statusFilter").value = "all";
    renderLoads();
  });

  /* Drivers */
  $("#driverSearch")?.addEventListener("input", event => {
    renderDrivers(event.target.value);
  });

  /* Export */
  $("#exportLoads")?.addEventListener("click", exportLoads);
  $("#exportBtn")?.addEventListener("click", exportLoads);
  $("#financeExport")?.addEventListener("click", exportLoads);
  $("#analyticsExport")?.addEventListener("click", exportLoads);

  /* Other demo actions */
  $("#addDriver")?.addEventListener("click", () => {
    toast("Driver management will be added in the next phase.");
  });

  $("#dispatchAction")?.addEventListener("click", () => {
    toast("Dispatch automation is planned for Phase 2.");
  });

  $("#generateReport")?.addEventListener("click", generateDemoReport);

  /* Global search */
  $("#globalSearch")?.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;

    location.hash = "loads";

    setTimeout(() => {
      $("#loadSearch").value = event.target.value;
      renderLoads();
    }, 0);
  });

  console.log("Northstar Load Management initialized.");
}

document.addEventListener("DOMContentLoaded", setup);

/* =========================================
   PHASE 2 — SMART DISPATCH ASSISTANT
   ========================================= */

const SMART_DISPATCH_CSS = `
.smart-dispatch {
  margin-top: 22px;
  padding: 22px;
  border: 1px solid #253246;
  border-radius: 12px;
  background: #111b29;
}
.smart-dispatch h2 {
  font-size: 18px;
  margin: 0 0 7px;
}
.smart-dispatch p {
  color: #899bb3;
  font-size: 12px;
}
.smart-dispatch-controls {
  display: flex;
  gap: 12px;
  margin: 20px 0;
  flex-wrap: wrap;
}
.smart-dispatch select {
  flex: 1;
  min-width: 220px;
  background: #0b1420;
  color: #e8eef8;
  border: 1px solid #2b3a50;
  padding: 12px;
  border-radius: 7px;
}
.smart-dispatch-btn {
  background: #8060e8;
  border: 0;
  color: white;
  padding: 11px 18px;
  border-radius: 7px;
  cursor: pointer;
  font-weight: 600;
}
.smart-dispatch-btn:hover {
  background: #9679f0;
}
.smart-driver-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
  gap: 12px;
  margin-top: 16px;
}
.smart-driver-card {
  background: #0c1623;
  border: 1px solid #29374b;
  border-radius: 9px;
  padding: 16px;
}
.smart-driver-card.best {
  border-color: #8060e8;
  box-shadow: 0 0 18px #8060e822;
}
.smart-driver-name {
  font-weight: 700;
  color: #edf2ff;
  margin-bottom: 8px;
}
.smart-driver-meta {
  color: #91a3ba;
  font-size: 12px;
  line-height: 1.9;
}
.smart-score {
  font-size: 25px;
  font-weight: 800;
  color: #a58bff;
  margin: 10px 0;
}
.smart-match-label {
  font-size: 10px;
  color: #ad98ff;
  letter-spacing: 1px;
  font-weight: 700;
}
.smart-assign {
  width: 100%;
  margin-top: 12px;
  padding: 9px;
  border-radius: 6px;
  background: #26364d;
  border: 1px solid #394d68;
  color: white;
  cursor: pointer;
}
.smart-assign:hover {
  background: #8060e8;
}
.smart-empty {
  padding: 20px;
  color: #9aabc0;
  background: #0c1623;
  border-radius: 8px;
  font-size: 13px;
}
.smart-dispatch-note {
  margin-top: 16px;
  padding: 11px;
  background: #18243a;
  border-radius: 7px;
  color: #aebbd0;
  font-size: 11px;
}
`;

/* Regional grouping for demo matching */
const dispatchRegions = {
  CA:"West", WA:"West", OR:"West", NV:"West",
  AZ:"West", CO:"Mountain", UT:"Mountain",
  TX:"South", FL:"South", GA:"South",
  TN:"South", NC:"South", SC:"South",
  IL:"Midwest", MO:"Midwest", OH:"Midwest",
  MI:"Midwest", MN:"Midwest", WI:"Midwest",
  NY:"Northeast", MA:"Northeast", PA:"Northeast",
  NJ:"Northeast", CT:"Northeast"
};

function getState(location) {
  const match = String(location).match(/,\s*([A-Z]{2})$/);
  return match ? match[1] : "";
}

function getDispatchCandidates(load) {
  return drivers
    .filter(driver => {
      const alreadyAssigned = loads.some(item =>
        item.id !== load.id &&
        item.driver === driver[0] &&
        ["Pending","In Transit","Delayed"].includes(item.status)
      );

      return driver[5] === "Available" && !alreadyAssigned;
    })
    .map(driver => {
      const originState = getState(load.origin);
      const driverState = getState(driver[2]);

      let score = 55;

      if (originState && driverState === originState) {
        score += 35;
      } else if (
        dispatchRegions[originState] &&
        dispatchRegions[originState] === dispatchRegions[driverState]
      ) {
        score += 22;
      }

      if (driver[5] === "Available") score += 10;

      score = Math.min(score, 99);

      return {
        driver,
        score,
        reason: driverState === originState
          ? "Located in pickup state"
          : dispatchRegions[driverState] === dispatchRegions[originState]
          ? "Same regional zone"
          : "Available for assignment"
      };
    })
    .sort((a,b) => b.score - a.score);
}

function initSmartDispatch() {
  const dispatchPage = document.querySelector("#page-dispatch");

  if (!dispatchPage || typeof loads === "undefined" ||
      typeof drivers === "undefined") return;

  if (document.querySelector("#smartDispatchAssistant")) return;

  const style = document.createElement("style");
  style.textContent = SMART_DISPATCH_CSS;
  document.head.appendChild(style);

  const panel = document.createElement("article");
  panel.className = "smart-dispatch";
  panel.id = "smartDispatchAssistant";

  panel.innerHTML = `
    <div>
      <div class="smart-match-label">✧ NORTHSTAR INTELLIGENCE</div>
      <h2>Smart Dispatch Assistant</h2>
      <p>Find the best available driver for your next shipment.</p>
    </div>

    <div class="smart-dispatch-controls">
      <select id="smartLoadSelect">
        <option value="">Select a pending load</option>
      </select>
      <button class="smart-dispatch-btn" id="findDriversBtn">
        ✧ Find best drivers
      </button>
    </div>

    <div id="smartMatchResults">
      <div class="smart-empty">
        Select a load and click Find best drivers to see recommendations.
      </div>
    </div>

    <div class="smart-dispatch-note">
      DEMO MODE · Recommendations use sample driver locations and
      availability. They do not use live GPS, hours-of-service,
      or real-time traffic data.
    </div>
  `;

  const grid = dispatchPage.querySelector(".dispatch-grid");

  if (grid) {
    grid.insertAdjacentElement("afterend", panel);
  } else {
    dispatchPage.appendChild(panel);
  }

  renderSmartLoadOptions();

  $("#findDriversBtn")?.addEventListener("click", renderSmartMatches);

  $("#smartLoadSelect")?.addEventListener("change", renderSmartMatches);

  $("#smartMatchResults")?.addEventListener("click", event => {
    const button = event.target.closest("[data-smart-assign]");
    if (!button) return;

    assignSmartDriver(
      button.dataset.smartAssign,
      button.dataset.loadId
    );
  });
}

function renderSmartLoadOptions() {
  const select = $("#smartLoadSelect");
  if (!select) return;

  const previous = select.value;

  const pending = loads.filter(load =>
    ["Pending","Delayed"].includes(load.status)
  );

  select.innerHTML = `
    <option value="">Select a load</option>
    ${pending.map(load => `
      <option value="${escapeHTML(load.id)}">
        ${escapeHTML(load.id)} ·
        ${escapeHTML(load.origin)} → ${escapeHTML(load.destination)}
      </option>
    `).join("")}
  `;

  if (pending.some(load => load.id === previous)) {
    select.value = previous;
  } else if (pending.length) {
    select.value = pending[0].id;
  }
}

function renderSmartMatches() {
  const loadId = $("#smartLoadSelect")?.value;
  const result = $("#smartMatchResults");

  if (!result) return;

  const load = loads.find(item => item.id === loadId);

  if (!load) {
    result.innerHTML = `
      <div class="smart-empty">No pending loads available.</div>
    `;
    return;
  }

  const candidates = getDispatchCandidates(load);

  if (!candidates.length) {
    result.innerHTML = `
      <div class="smart-empty">
        No available drivers found. Check your fleet assignments.
      </div>
    `;
    return;
  }

  result.innerHTML = `
    <p>Recommended drivers for
      <b>${escapeHTML(load.id)}</b>
      · ${escapeHTML(load.origin)}
      → ${escapeHTML(load.destination)}
    </p>

    <div class="smart-driver-grid">
      ${candidates.slice(0,3).map((candidate,index) => `
        <div class="smart-driver-card ${index===0 ? "best" : ""}">
          ${index===0
            ? '<div class="smart-match-label">✧ TOP RECOMMENDATION</div>'
            : '<div class="smart-match-label">AVAILABLE DRIVER</div>'}

          <div class="smart-driver-name">
            ${escapeHTML(candidate.driver[0])}
          </div>

          <div class="smart-driver-meta">
            Unit: ${escapeHTML(candidate.driver[1])}<br>
            Location: ${escapeHTML(candidate.driver[2])}<br>
            Availability: ${escapeHTML(candidate.driver[5])}<br>
            Match reason: ${escapeHTML(candidate.reason)}
          </div>

          <div class="smart-score">${candidate.score}%</div>

          <button class="smart-assign"
            data-smart-assign="${escapeHTML(candidate.driver[0])}"
            data-load-id="${escapeHTML(load.id)}">
            Assign driver →
          </button>
        </div>
      `).join("")}
    </div>
  `;
}

function assignSmartDriver(driverName, loadId) {
  const load = loads.find(item => item.id === loadId);

  const driver = drivers.find(item => item[0] === driverName);

  if (!load || !driver) {
    toast("Load or driver not found.");
    return;
  }

  if (!["Pending","Delayed"].includes(load.status)) {
    toast("This load is no longer waiting for assignment.");
    return;
  }

  const busy = loads.some(item =>
    item.id !== load.id &&
    item.driver === driverName &&
    ["Pending","In Transit","Delayed"].includes(item.status)
  );

  if (driver[5] !== "Available" || busy) {
    toast("This driver is no longer available.");
    return;
  }

  const confirmed = confirm(
    `Assign ${driverName} to ${load.id}?\n\n` +
    `${load.origin} → ${load.destination}`
  );

  if (!confirmed) return;

  load.driver = driverName;
  load.status = "In Transit";

  driver[3] = load.id;
  driver[5] = "On route";

  /* Persist the sample driver assignment */
  try {
    localStorage.setItem(
      "northstar_driver_assignments",
      JSON.stringify(drivers)
    );
  } catch (error) {
    console.warn("Driver assignment storage unavailable.", error);
  }

  if (typeof saveData === "function") saveData();

  if (typeof refreshAll === "function") refreshAll();

  if (typeof renderDrivers === "function") renderDrivers();

  renderSmartLoadOptions();
  renderSmartMatches();

  toast(`Successfully assigned ${driverName} to ${load.id}.`);
}

/* Restore saved driver assignments */
function restoreSmartDrivers() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("northstar_driver_assignments") || "null"
    );

    if (!Array.isArray(saved)) return;

    saved.forEach(savedDriver => {
      const driver = drivers.find(item => item[0] === savedDriver[0]);

      if (driver) {
        driver[3] = savedDriver[3];
        driver[5] = savedDriver[5];
      }
    });
  } catch (error) {
    console.warn("Could not restore driver assignments.", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  restoreSmartDrivers();
  initSmartDispatch();
});

/* =========================================
   PHASE 3 — FLEET MANAGEMENT
   Drivers, Trucks, Status & Assignments
   ========================================= */

const FLEET_STORAGE = "northstar_fleet_v1";

const initialTrucks = [
  {id:"TR-104",model:"Freightliner Cascadia",plate:"TX-4812",type:"Semi Truck",status:"On Route",location:"Dallas, TX",driver:"Marcus Johnson"},
  {id:"TR-087",model:"Volvo VNL 760",plate:"GA-2291",type:"Semi Truck",status:"Available",location:"Atlanta, GA",driver:""},
  {id:"TR-112",model:"Peterbilt 579",plate:"TX-7734",type:"Semi Truck",status:"On Route",location:"El Paso, TX",driver:"David Chen"},
  {id:"TR-063",model:"Kenworth T680",plate:"NY-9082",type:"Semi Truck",status:"Maintenance",location:"New York, NY",driver:"James Miller"},
  {id:"TR-091",model:"International LT",plate:"FL-4410",type:"Semi Truck",status:"Available",location:"Orlando, FL",driver:""},
  {id:"TR-125",model:"Freightliner Cascadia",plate:"CO-5521",type:"Semi Truck",status:"Available",location:"Denver, CO",driver:""}
];

let trucks = [...initialTrucks];

let fleetMeta = {};

function loadFleetStorage() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(FLEET_STORAGE) || "null"
    );

    if (!saved) return;

    if (Array.isArray(saved.trucks)) {
      trucks = saved.trucks;
    }

    if (saved.meta && typeof saved.meta === "object") {
      fleetMeta = saved.meta;
    }

    if (Array.isArray(saved.drivers)) {
      saved.drivers.forEach(savedDriver => {
        const existing = drivers.find(
          driver => driver[0] === savedDriver[0]
        );

        if (existing) {
          Object.assign(existing, savedDriver);
        } else {
          drivers.push(savedDriver);
        }
      });
    }
  } catch (error) {
    console.error("Fleet storage error:", error);
  }
}

function saveFleetStorage() {
  try {
    localStorage.setItem(FLEET_STORAGE, JSON.stringify({
      trucks,
      drivers,
      meta:fleetMeta
    }));
  } catch (error) {
    console.error("Fleet save error:", error);
    toast("Could not save fleet data.");
  }
}

/* ---------- FLEET STYLES ---------- */

const fleetStyle = document.createElement("style");

fleetStyle.textContent = `
.fleet-module {
  margin-top:20px;
  display:grid;
  gap:16px;
}
.fleet-toolbar {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  flex-wrap:wrap;
}
.fleet-toolbar h2 {
  font:700 15px Manrope,sans-serif;
  margin:0 0 5px;
}
.fleet-toolbar p {
  color:#8491a4;
  font-size:10px;
  margin:0;
}
.fleet-actions {
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}
.fleet-action-btn {
  padding:9px 13px;
  border-radius:6px;
  border:1px solid #34445a;
  background:#172335;
  color:#e8eef8;
  cursor:pointer;
  font-size:11px;
}
.fleet-action-btn.primary {
  background:#8060e8;
  border-color:#8060e8;
  color:white;
}
.fleet-action-btn:hover {
  filter:brightness(1.15);
}
.fleet-stats {
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:12px;
}
.fleet-stat {
  background:#111925;
  border:1px solid #202c3b;
  border-radius:9px;
  padding:15px;
}
.fleet-stat span {
  display:block;
  color:#8b9bb0;
  font-size:10px;
}
.fleet-stat strong {
  display:block;
  font:700 23px Manrope,sans-serif;
  margin-top:8px;
}
.fleet-table-wrap {
  overflow-x:auto;
}
.fleet-table {
  width:100%;
  border-collapse:collapse;
  min-width:650px;
}
.fleet-table th {
  color:#7e8da2;
  font-size:9px;
  text-align:left;
  padding:12px 10px;
  border-bottom:1px solid #293649;
  white-space:nowrap;
}
.fleet-table td {
  padding:13px 10px;
  border-bottom:1px solid #202c3b;
  font-size:11px;
  color:#c7d1df;
}
.fleet-table tr:last-child td {
  border-bottom:0;
}
.fleet-table select {
  background:#101b29;
  color:#dce5f1;
  border:1px solid #34445a;
  border-radius:5px;
  padding:6px;
  max-width:135px;
  font-size:10px;
}
.fleet-edit {
  border:1px solid #35445b;
  background:#192638;
  color:#d8e3f3;
  border-radius:5px;
  padding:6px 9px;
  cursor:pointer;
}
.fleet-status {
  display:inline-block;
  border-radius:20px;
  padding:5px 8px;
  font-size:9px;
  white-space:nowrap;
}
.fleet-available {background:#173b32;color:#67d8ad}
.fleet-route {background:#25214b;color:#b9a8ff}
.fleet-maintenance {background:#493322;color:#ffc083}
.fleet-offline {background:#3b2930;color:#ed9aa4}
.fleet-assigned {background:#1e354c;color:#8fc8ff}
.fleet-modal {
  position:fixed;
  inset:0;
  background:#000b;
  z-index:100;
  display:none;
  align-items:center;
  justify-content:center;
  padding:15px;
}
.fleet-modal.show {display:flex}
.fleet-modal-card {
  background:#111b29;
  border:1px solid #34445a;
  border-radius:12px;
  width:min(480px,100%);
  max-height:90vh;
  overflow:auto;
  padding:22px;
}
.fleet-modal-card h2 {
  margin:0 0 18px;
  font:700 18px Manrope,sans-serif;
}
.fleet-form {
  display:grid;
  gap:12px;
}
.fleet-form label {
  display:grid;
  gap:6px;
  color:#9aaabd;
  font-size:11px;
}
.fleet-form input,
.fleet-form select {
  width:100%;
  padding:11px;
  background:#0b1420;
  color:#edf2f8;
  border:1px solid #34445a;
  border-radius:6px;
}
.fleet-form-buttons {
  display:flex;
  justify-content:flex-end;
  gap:9px;
  margin-top:8px;
}
.fleet-empty {
  color:#8b9bb0;
  padding:22px;
  text-align:center;
}
@media(max-width:700px) {
  .fleet-stats {grid-template-columns:repeat(2,minmax(0,1fr))}
}
`;

document.head.appendChild(fleetStyle);

/* ---------- STATUS HELPERS ---------- */

function fleetStatusClass(status) {
  return {
    "Available":"fleet-available",
    "On Route":"fleet-route",
    "Maintenance":"fleet-maintenance",
    "Offline":"fleet-offline",
    "Assigned":"fleet-assigned"
  }[status] || "fleet-offline";
}

function fleetStatus(status) {
  return `<span class="fleet-status ${fleetStatusClass(status)}">${escapeHTML(status)}</span>`;
}

/* ---------- DRIVER DATA ---------- */

function getDriverMeta(name) {
  if (!fleetMeta[name]) {
    fleetMeta[name] = {
      phone:"",
      email:"",
      cdl:"",
      cdlExpiry:"",
      notes:""
    };
  }

  return fleetMeta[name];
}

function getDriverStatus(driver) {
  return driver[5] || "Available";
}

function getDriverTruck(name) {
  return trucks.find(truck => truck.driver === name);
}

/* ---------- FLEET UI ---------- */

function initFleetModule() {
  const page = $("#page-fleet");

  if (!page || $("#fleetModule")) return;

  const module = document.createElement("div");
  module.className = "fleet-module";
  module.id = "fleetModule";

  module.innerHTML = `
    <div class="fleet-stats" id="fleetStats"></div>

    <article class="panel">
      <div class="fleet-toolbar">
        <div>
          <h2>Fleet equipment</h2>
          <p>Manage trucks, equipment and vehicle availability.</p>
        </div>
        <div class="fleet-actions">
          <button class="fleet-action-btn primary" id="fleetAddTruck">
            ＋ Add truck
          </button>
        </div>
      </div>

      <div class="fleet-table-wrap" style="margin-top:14px">
        <table class="fleet-table">
          <thead>
            <tr>
              <th>UNIT</th>
              <th>VEHICLE</th>
              <th>PLATE</th>
              <th>LOCATION</th>
              <th>DRIVER</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody id="fleetTruckRows"></tbody>
        </table>
      </div>
    </article>

    <article class="panel">
      <div class="fleet-toolbar">
        <div>
          <h2>Driver management</h2>
          <p>Driver availability, contact information and CDL records.</p>
        </div>
        <div class="fleet-actions">
          <button class="fleet-action-btn primary" id="fleetAddDriver">
            ＋ Add driver
          </button>
        </div>
      </div>

      <div class="fleet-table-wrap" style="margin-top:14px">
        <table class="fleet-table">
          <thead>
            <tr>
              <th>DRIVER</th>
              <th>UNIT</th>
              <th>PHONE</th>
              <th>CDL</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody id="fleetDriverRows"></tbody>
        </table>
      </div>
    </article>

    <article class="panel">
      <div class="fleet-toolbar">
        <div>
          <h2>Fleet assignments</h2>
          <p>Current relationship between drivers, trucks and loads.</p>
        </div>
      </div>
      <div class="fleet-table-wrap" style="margin-top:14px">
        <table class="fleet-table">
          <thead>
            <tr>
              <th>DRIVER</th>
              <th>TRUCK</th>
              <th>LOAD</th>
              <th>DRIVER STATUS</th>
              <th>TRUCK STATUS</th>
            </tr>
          </thead>
          <tbody id="fleetAssignmentRows"></tbody>
        </table>
      </div>
    </article>
  `;

  const oldDirectory = page.querySelector(".full-table");

  if (oldDirectory) {
    oldDirectory.insertAdjacentElement("afterend", module);
  } else {
    page.appendChild(module);
  }

  createFleetModal();
  renderFleet();

  $("#fleetAddDriver").addEventListener("click", () => {
    openFleetForm("driver");
  });

  $("#fleetAddTruck").addEventListener("click", () => {
    openFleetForm("truck");
  });

  module.addEventListener("click", handleFleetActions);
  module.addEventListener("change", handleFleetChanges);
}

/* ---------- MODAL ---------- */

function createFleetModal() {
  if ($("#fleetModal")) return;

  const modal = document.createElement("div");
  modal.className = "fleet-modal";
  modal.id = "fleetModal";

  modal.innerHTML = `
    <div class="fleet-modal-card">
      <div class="fleet-toolbar">
        <h2 id="fleetModalTitle">Add record</h2>
        <button class="fleet-edit" id="fleetClose">✕</button>
      </div>
      <form class="fleet-form" id="fleetForm"></form>
    </div>
  `;

  document.body.appendChild(modal);

  $("#fleetClose").addEventListener("click", closeFleetForm);

  modal.addEventListener("click", event => {
    if (event.target === modal) closeFleetForm();
  });

  $("#fleetForm").addEventListener("submit", saveFleetForm);
}

let fleetFormType = "";
let fleetEditId = null;

function openFleetForm(type, id = null) {
  fleetFormType = type;
  fleetEditId = id;

  const form = $("#fleetForm");
  const record = type === "driver"
    ? drivers.find(driver => driver[0] === id)
    : trucks.find(truck => truck.id === id);

  $("#fleetModalTitle").textContent =
    (id ? "Edit " : "Add ") + (type === "driver" ? "driver" : "truck");

  if (type === "driver") {
    const name = record ? record[0] : "";
    const meta = getDriverMeta(name);

    form.innerHTML = `
      <label>Full name
        <input name="name" required value="${escapeHTML(record?.[0] || "")}" placeholder="John Smith">
      </label>
      <label>Phone number
        <input name="phone" value="${escapeHTML(meta.phone)}" placeholder="+1 555 000 0000">
      </label>
      <label>Email
        <input name="email" type="email" value="${escapeHTML(meta.email)}" placeholder="driver@example.com">
      </label>
      <label>CDL number
        <input name="cdl" value="${escapeHTML(meta.cdl)}" placeholder="CDL number">
      </label>
      <label>CDL expiration date
        <input name="cdlExpiry" type="date" value="${escapeHTML(meta.cdlExpiry)}">
      </label>
      <label>Current location
        <input name="location" required value="${escapeHTML(record?.[2] || "")}" placeholder="Dallas, TX">
      </label>
      <label>Availability status
        <select name="status">
          ${["Available","On Route","Assigned","Maintenance","Offline"].map(status =>
            `<option ${getDriverStatus(record || ["","","","","","Available"]) === status ? "selected" : ""}>${status}</option>`
          ).join("")}
        </select>
      </label>
      <label>Assigned truck
        <select name="truck">
          <option value="">No truck assigned</option>
          ${trucks.map(truck => `
            <option value="${escapeHTML(truck.id)}"
              ${truck.driver === name ? "selected" : ""}>
              ${escapeHTML(truck.id)} · ${escapeHTML(truck.model)}
            </option>
          `).join("")}
        </select>
      </label>
      <label>Notes
        <input name="notes" value="${escapeHTML(meta.notes)}" placeholder="Optional notes">
      </label>
      <div class="fleet-form-buttons">
        <button type="button" class="fleet-action-btn" id="fleetCancel">Cancel</button>
        <button type="submit" class="fleet-action-btn primary">Save driver</button>
      </div>
    `;
  } else {
    form.innerHTML = `
      <label>Unit ID
        <input name="id" required value="${escapeHTML(record?.id || "")}" placeholder="TR-150">
      </label>
      <label>Vehicle make and model
        <input name="model" required value="${escapeHTML(record?.model || "")}" placeholder="Freightliner Cascadia">
      </label>
      <label>License plate
        <input name="plate" required value="${escapeHTML(record?.plate || "")}" placeholder="TX-1234">
      </label>
      <label>Vehicle type
        <select name="type">
          ${["Semi Truck","Box Truck","Reefer","Flatbed","Dry Van","Other"].map(type =>
            `<option ${record?.type === type ? "selected" : ""}>${type}</option>`
          ).join("")}
        </select>
      </label>
      <label>Current location
        <input name="location" required value="${escapeHTML(record?.location || "")}" placeholder="Dallas, TX">
      </label>
      <label>Vehicle status
        <select name="status">
          ${["Available","On Route","Maintenance","Offline"].map(status =>
            `<option ${record?.status === status ? "selected" : ""}>${status}</option>`
          ).join("")}
        </select>
      </label>
      <label>Assigned driver
        <select name="driver">
          <option value="">No driver assigned</option>
          ${drivers.map(driver => `
            <option value="${escapeHTML(driver[0])}"
              ${record?.driver === driver[0] ? "selected" : ""}>
              ${escapeHTML(driver[0])}
            </option>
          `).join("")}
        </select>
      </label>
      <div class="fleet-form-buttons">
        <button type="button" class="fleet-action-btn" id="fleetCancel">Cancel</button>
        <button type="submit" class="fleet-action-btn primary">Save truck</button>
      </div>
    `;
  }

  $("#fleetCancel").addEventListener("click", closeFleetForm);

  $("#fleetModal").classList.add("show");
}

function closeFleetForm() {
  $("#fleetModal")?.classList.remove("show");
  fleetEditId = null;
}

/* ---------- SAVE RECORDS ---------- */

function saveFleetForm(event) {
  event.preventDefault();

  const data = new FormData(event.currentTarget);

  if (fleetFormType === "driver") {
    const name = String(data.get("name") || "").trim();
    const location = String(data.get("location") || "").trim();

    if (!name || !location) {
      toast("Enter the driver name and location.");
      return;
    }

    const existing = fleetEditId
      ? drivers.find(driver => driver[0] === fleetEditId)
      : null;

    const oldName = existing?.[0];

    const duplicate = drivers.some(driver =>
      driver[0].toLowerCase() === name.toLowerCase() &&
      driver !== existing
    );

    if (duplicate) {
      toast("A driver with this name already exists.");
      return;
    }

    const assignedTruck = String(data.get("truck") || "");

    if (assignedTruck) {
      const truck = trucks.find(item => item.id === assignedTruck);

      if (!truck) {
        toast("Selected truck not found.");
        return;
      }

      if (truck.driver && truck.driver !== oldName) {
        toast("This truck is already assigned.");
        return;
      }

      if (truck.status === "Maintenance" || truck.status === "Offline") {
        toast("This truck is not available.");
        return;
      }
    }

    const status = String(data.get("status"));

    const driverRecord = existing || [
      name,"—",location,"—","—",status
    ];

    driverRecord[0] = name;
    driverRecord[2] = location;
    driverRecord[5] = status;

    if (!existing) drivers.push(driverRecord);

    if (oldName && oldName !== name) {
      loads.forEach(load => {
        if (load.driver === oldName) load.driver = name;
      });

      trucks.forEach(truck => {
        if (truck.driver === oldName) truck.driver = "";
      });

      if (fleetMeta[oldName]) {
        fleetMeta[name] = fleetMeta[oldName];
        delete fleetMeta[oldName];
      }
    }

    fleetMeta[name] = {
      phone:String(data.get("phone") || "").trim(),
      email:String(data.get("email") || "").trim(),
      cdl:String(data.get("cdl") || "").trim(),
      cdlExpiry:String(data.get("cdlExpiry") || ""),
      notes:String(data.get("notes") || "").trim()
    };

    trucks.forEach(truck => {
      if (truck.driver === name && truck.id !== assignedTruck) {
        truck.driver = "";
      }
    });

    if (assignedTruck) {
      const truck = trucks.find(item => item.id === assignedTruck);
      truck.driver = name;
      truck.status = status === "On Route" ? "On Route" : "Available";
      driverRecord[1] = truck.id;
    } else {
      driverRecord[1] = "—";
    }

    toast(existing ? "Driver updated." : "Driver added.");
  } else {
    const id = String(data.get("id") || "").trim().toUpperCase();

    if (!id) return;

    const duplicate = trucks.some(truck =>
      truck.id.toLowerCase() === id.toLowerCase() &&
      truck.id !== fleetEditId
    );

    if (duplicate) {
      toast("This unit ID already exists.");
      return;
    }

    const driverName = String(data.get("driver") || "");

    if (driverName) {
      const driver = drivers.find(item => item[0] === driverName);

      if (!driver) {
        toast("Selected driver not found.");
        return;
      }

      if (driver[5] === "Maintenance" || driver[5] === "Offline") {
        toast("This driver is not available.");
        return;
      }

      const otherTruck = trucks.find(item =>
        item.driver === driverName && item.id !== fleetEditId
      );

      if (otherTruck) {
        toast("This driver already has a truck.");
        return;
      }
    }

    const truckRecord = {
      id,
      model:String(data.get("model") || "").trim(),
      plate:String(data.get("plate") || "").trim(),
      type:String(data.get("type") || "Semi Truck"),
      location:String(data.get("location") || "").trim(),
      status:String(data.get("status") || "Available"),
      driver:driverName
    };

    if (fleetEditId) {
      const index = trucks.findIndex(item => item.id === fleetEditId);
      if (index !== -1) trucks[index] = truckRecord;
    } else {
      trucks.push(truckRecord);
    }

    if (driverName) {
      const driver = drivers.find(item => item[0] === driverName);
      driver[1] = id;
      if (truckRecord.status === "On Route") driver[5] = "On Route";
      else if (driver[5] !== "On Route") driver[5] = "Assigned";
    }

    toast(fleetEditId ? "Truck updated." : "Truck added.");
  }

  saveFleetStorage();
  saveData();
  renderFleet();
  refreshAll();
  closeFleetForm();
}

/* ---------- STATUS CHANGES ---------- */

function handleFleetChanges(event) {
  const driverName = event.target.dataset.driverStatus;
  const truckId = event.target.dataset.truckStatus;

  if (driverName) {
    const driver = drivers.find(item => item[0] === driverName);
    if (!driver) return;

    driver[5] = event.target.value;

    const truck = getDriverTruck(driverName);

    if (truck) {
      truck.status = event.target.value === "On Route"
        ? "On Route"
        : event.target.value === "Maintenance" || event.target.value === "Offline"
        ? event.target.value
        : "Available";
    }
  }

  if (truckId) {
    const truck = trucks.find(item => item.id === truckId);
    if (!truck) return;

    truck.status = event.target.value;

    if (truck.driver) {
      const driver = drivers.find(item => item[0] === truck.driver);
      if (driver) {
        if (event.target.value === "On Route") driver[5] = "On Route";
        if (event.target.value === "Maintenance" || event.target.value === "Offline") {
          driver[5] = event.target.value;
        }
        if (event.target.value === "Available" && driver[5] !== "On Route") {
          driver[5] = "Available";
        }
      }
    }
  }

  saveFleetStorage();
  renderFleet();
  refreshAll();
}

/* ---------- TABLE ACTIONS ---------- */

function handleFleetActions(event) {
  const editDriver = event.target.closest("[data-edit-driver]");
  const editTruck = event.target.closest("[data-edit-truck]");

  if (editDriver) {
    openFleetForm("driver", editDriver.dataset.editDriver);
  }

  if (editTruck) {
    openFleetForm("truck", editTruck.dataset.editTruck);
  }
}

/* ---------- RENDER ---------- */

function renderFleet() {
  const driverRows = $("#fleetDriverRows");
  const truckRows = $("#fleetTruckRows");
  const assignmentRows = $("#fleetAssignmentRows");

  if (!driverRows || !truckRows || !assignmentRows) return;

  const available = trucks.filter(t => t.status === "Available").length;
  const onRoute = trucks.filter(t => t.status === "On Route").length;
  const maintenance = trucks.filter(t => t.status === "Maintenance").length;
  const totalDrivers = drivers.length;

  $("#fleetStats").innerHTML = `
    <div class="fleet-stat">
      <span>Total trucks</span>
      <strong>${trucks.length}</strong>
    </div>
    <div class="fleet-stat">
      <span>Available trucks</span>
      <strong>${available}</strong>
    </div>
    <div class="fleet-stat">
      <span>On route</span>
      <strong>${onRoute}</strong>
    </div>
    <div class="fleet-stat">
      <span>Drivers registered</span>
      <strong>${totalDrivers}</strong>
    </div>
  `;

  truckRows.innerHTML = trucks.map(truck => `
    <tr>
      <td><b>${escapeHTML(truck.id)}</b></td>
      <td>${escapeHTML(truck.model)}</td>
      <td>${escapeHTML(truck.plate)}</td>
      <td>${escapeHTML(truck.location)}</td>
      <td>${escapeHTML(truck.driver || "Unassigned")}</td>
      <td>
        <select data-truck-status="${escapeHTML(truck.id)}">
          ${["Available","On Route","Maintenance","Offline"].map(status =>
            `<option ${truck.status === status ? "selected" : ""}>${status}</option>`
          ).join("")}
        </select>
      </td>
      <td>
        <button class="fleet-edit" data-edit-truck="${escapeHTML(truck.id)}">
          Edit
        </button>
      </td>
    </tr>
  `).join("") || `
    <tr><td colspan="7" class="fleet-empty">No trucks registered.</td></tr>
  `;

  driverRows.innerHTML = drivers.map(driver => {
    const meta = getDriverMeta(driver[0]);
    const truck = getDriverTruck(driver[0]);

    return `
      <tr>
        <td><b>${escapeHTML(driver[0])}</b></td>
        <td>${escapeHTML(truck?.id || driver[1] || "—")}</td>
        <td>${escapeHTML(meta.phone || "—")}</td>
        <td>${escapeHTML(meta.cdl || "Not entered")}</td>
        <td>
          <select data-driver-status="${escapeHTML(driver[0])}">
            ${["Available","On Route","Assigned","Maintenance","Offline"].map(status =>
              `<option ${getDriverStatus(driver) === status ? "selected" : ""}>${status}</option>`
            ).join("")}
          </select>
        </td>
        <td>
          <button class="fleet-edit" data-edit-driver="${escapeHTML(driver[0])}">
            Edit
          </button>
        </td>
      </tr>
    `;
  }).join("") || `
    <tr><td colspan="6" class="fleet-empty">No drivers registered.</td></tr>
  `;

  assignmentRows.innerHTML = drivers.map(driver => {
    const truck = getDriverTruck(driver[0]);
    const load = loads.find(item =>
      item.driver === driver[0] &&
      item.status !== "Delivered"
    );

    return `
      <tr>
        <td><b>${escapeHTML(driver[0])}</b></td>
        <td>${escapeHTML(truck?.id || "Unassigned")}</td>
        <td>${escapeHTML(load?.id || "No active load")}</td>
        <td>${fleetStatus(getDriverStatus(driver))}</td>
        <td>${truck ? fleetStatus(truck.status) : "—"}</td>
      </tr>
    `;
  }).join("");
}

/* ---------- INITIALIZE ---------- */

document.addEventListener("DOMContentLoaded", () => {
  loadFleetStorage();

  /* Remove the old demo-only Add Driver click handler */
  const oldAddDriver = $("#addDriver");

  if (oldAddDriver) {
    const replacement = oldAddDriver.cloneNode(true);
    oldAddDriver.replaceWith(replacement);
  }

  initFleetModule();

  console.log("Northstar Fleet Management initialized.");
});

/* =========================================
   PHASE 4 — FLEET TRACKING & GPS
   Interactive US fleet map
   ========================================= */

const TRACKING_CSS = `
.tracking-module {
  display:grid;
  gap:16px;
  margin-top:20px;
}
.tracking-stats {
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:12px;
}
.tracking-stat {
  background:#111925;
  border:1px solid #263449;
  border-radius:9px;
  padding:15px;
}
.tracking-stat span {
  display:block;
  font-size:10px;
  color:#899bb0;
}
.tracking-stat strong {
  display:block;
  font-size:24px;
  margin-top:7px;
}
.tracking-layout {
  display:grid;
  grid-template-columns:minmax(0,1fr) 285px;
  gap:14px;
}
.tracking-map-card,
.tracking-side-card {
  background:#111925;
  border:1px solid #263449;
  border-radius:10px;
  overflow:hidden;
}
.tracking-card-head {
  padding:16px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
  border-bottom:1px solid #263449;
  flex-wrap:wrap;
}
.tracking-card-head h2 {
  margin:0;
  font-size:14px;
}
.tracking-card-head p {
  margin:5px 0 0;
  font-size:10px;
  color:#899bb0;
}
#northstarMap {
  height:510px;
  width:100%;
  background:#101a28;
  z-index:1;
}
.tracking-list {
  max-height:510px;
  overflow:auto;
}
.tracking-truck {
  padding:13px;
  border-bottom:1px solid #253246;
  cursor:pointer;
}
.tracking-truck:hover,
.tracking-truck.selected {
  background:#1b2940;
}
.tracking-truck-top {
  display:flex;
  justify-content:space-between;
  gap:8px;
  align-items:center;
}
.tracking-truck b {
  font-size:11px;
}
.tracking-truck small {
  display:block;
  color:#91a2b7;
  margin-top:6px;
  font-size:10px;
}
.tracking-dot {
  width:8px;
  height:8px;
  border-radius:50%;
  display:inline-block;
  margin-right:6px;
}
.tracking-search {
  width:100%;
  background:#0b1420;
  color:#edf2f8;
  border:1px solid #34445a;
  border-radius:6px;
  padding:10px;
  margin:12px 0;
  font-size:11px;
}
.tracking-filter {
  background:#0b1420;
  color:#edf2f8;
  border:1px solid #34445a;
  border-radius:6px;
  padding:8px;
  font-size:10px;
}
.tracking-details {
  background:#0c1623;
  border:1px solid #29394f;
  border-radius:9px;
  padding:16px;
  margin-top:14px;
}
.tracking-details h3 {
  font-size:13px;
  margin:0 0 12px;
}
.tracking-detail-row {
  display:flex;
  justify-content:space-between;
  gap:10px;
  padding:8px 0;
  border-bottom:1px solid #253246;
  font-size:10px;
}
.tracking-detail-row span {
  color:#91a2b7;
}
.tracking-detail-row b {
  text-align:right;
}
.tracking-disclaimer {
  color:#aebbd0;
  background:#18243a;
  border-radius:7px;
  padding:12px;
  font-size:10px;
  line-height:1.6;
}
.tracking-map-marker {
  width:32px;
  height:32px;
  display:flex;
  justify-content:center;
  align-items:center;
  border:2px solid #dce7f8;
  border-radius:50%;
  color:white;
  font-size:13px;
  font-weight:bold;
  box-shadow:0 2px 12px #0008;
}
.tracking-marker-route {background:#7860df}
.tracking-marker-available {background:#20a77b}
.tracking-marker-maintenance {background:#c78a40}
.tracking-marker-offline {background:#778394}
.leaflet-popup-content-wrapper,
.leaflet-popup-tip {
  background:#111d2c;
  color:#edf2f8;
}
.leaflet-popup-content {
  font-size:11px;
}
.tracking-empty {
  padding:20px;
  color:#91a2b7;
  font-size:11px;
}
@media(max-width:900px) {
  .tracking-layout {grid-template-columns:1fr}
  .tracking-list {max-height:260px}
}
@media(max-width:600px) {
  .tracking-stats {grid-template-columns:repeat(2,minmax(0,1fr))}
  #northstarMap {height:370px}
}
`;

const trackingStyle = document.createElement("style");
trackingStyle.textContent = TRACKING_CSS;
document.head.appendChild(trackingStyle);

/* Demo coordinates: approximate city locations in the USA */
const trackingCities = {
  "Los Angeles, CA":[34.0522,-118.2437],
  "Dallas, TX":[32.7767,-96.7970],
  "Chicago, IL":[41.8781,-87.6298],
  "Atlanta, GA":[33.7490,-84.3880],
  "Houston, TX":[29.7604,-95.3698],
  "Phoenix, AZ":[33.4484,-112.0740],
  "New York, NY":[40.7128,-74.0060],
  "Boston, MA":[42.3601,-71.0589],
  "Miami, FL":[25.7617,-80.1918],
  "Orlando, FL":[28.5383,-81.3792],
  "Denver, CO":[39.7392,-104.9903],
  "Kansas City, MO":[39.0997,-94.5786],
  "Seattle, WA":[47.6062,-122.3321],
  "Portland, OR":[45.5152,-122.6784],
  "Nashville, TN":[36.1627,-86.7816],
  "Charlotte, NC":[35.2271,-80.8431],
  "El Paso, TX":[31.7619,-106.4850]
};

let northstarMap = null;
let trackingMarkers = {};
let selectedTrackingTruck = null;
let trackingFilter = "all";

function trackingCoordinates(location) {
  if (trackingCities[location]) {
    return trackingCities[location];
  }

  const state = String(location).split(",").pop().trim();

  const stateCenters = {
    CA:[36.7783,-119.4179],
    TX:[31.9686,-99.9018],
    FL:[27.6648,-81.5158],
    NY:[42.1657,-74.9481],
    CO:[39.1130,-105.3589],
    WA:[47.7511,-120.7401],
    OR:[43.8041,-120.5542],
    IL:[40.6331,-89.3985],
    GA:[32.1656,-82.9001],
    AZ:[34.0489,-111.0937],
    NC:[35.7596,-79.0193],
    MO:[37.9643,-91.8318],
    TN:[35.5175,-86.5804],
    MA:[42.4072,-71.3824]
  };

  return stateCenters[state] || [39.5,-98.35];
}

function trackingColor(status) {
  return {
    "On Route":"#8060e8",
    "Available":"#20a77b",
    "Maintenance":"#c78a40",
    "Offline":"#778394"
  }[status] || "#778394";
}

function trackingMarkerIcon(status) {
  const className = {
    "On Route":"tracking-marker-route",
    "Available":"tracking-marker-available",
    "Maintenance":"tracking-marker-maintenance",
    "Offline":"tracking-marker-offline"
  }[status] || "tracking-marker-offline";

  return L.divIcon({
    className:"",
    html:`<div class="tracking-map-marker ${className}">▰</div>`,
    iconSize:[32,32],
    iconAnchor:[16,16]
  });
}

/* ---------- PAGE ---------- */

function createTrackingPage() {
  if ($("#page-tracking")) return;

  const nav = document.querySelector(".sidebar .nav");

  if (nav && !document.querySelector('[data-page="tracking"]')) {
    const link = document.createElement("a");
    link.className = "nav-link";
    link.href = "#tracking";
    link.dataset.page = "tracking";
    link.innerHTML = `
      <span class="nav-icon">⌖</span>
      Fleet Tracking
    `;

    const fleetLink = nav.querySelector('[data-page="fleet"]');

    if (fleetLink) {
      fleetLink.insertAdjacentElement("afterend", link);
    } else {
      nav.appendChild(link);
    }

    link.addEventListener("click", event => {
      event.preventDefault();
      location.hash = "tracking";
      showPage("tracking");
      activateTrackingPage();
    });
  }

  const page = document.createElement("section");
  page.className = "page";
  page.id = "page-tracking";

  page.innerHTML = `
    <div class="page-heading">
      <div>
        <div class="eyebrow">OPERATIONS / FLEET INTELLIGENCE</div>
        <h1>Fleet Tracking</h1>
        <p>Monitor truck locations and fleet activity across the United States.</p>
      </div>
      <div class="heading-actions">
        <span class="status-pill status-pending">DEMO GPS MODE</span>
      </div>
    </div>

    <div class="tracking-module">
      <div class="tracking-stats" id="trackingStats"></div>

      <div class="tracking-layout">
        <article class="tracking-map-card">
          <div class="tracking-card-head">
            <div>
              <h2>US Fleet Map</h2>
              <p>Vehicle positions based on demo city coordinates</p>
            </div>
            <button class="fleet-action-btn" id="trackingResetMap">
              ⌖ Reset map
            </button>
          </div>
          <div id="northstarMap"></div>
        </article>

        <article class="tracking-side-card">
          <div class="tracking-card-head">
            <div>
              <h2>Fleet vehicles</h2>
              <p id="trackingVehicleCount">0 vehicles</p>
            </div>
          </div>

          <div style="padding:0 12px">
            <input
              class="tracking-search"
              id="trackingSearch"
              placeholder="Search truck or driver..."
            >
            <select class="tracking-filter" id="trackingStatusFilter" style="width:100%">
              <option value="all">All statuses</option>
              <option value="On Route">On Route</option>
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          <div class="tracking-list" id="trackingVehicleList"></div>
        </article>
      </div>

      <article class="tracking-side-card" style="padding:16px">
        <div class="tracking-card-head" style="padding:0 0 12px">
          <div>
            <h2>Vehicle details</h2>
            <p>Selected truck information</p>
          </div>
        </div>
        <div id="trackingDetails" class="tracking-details">
          <p style="color:#91a2b7;font-size:11px">
            Select a truck on the map or from the vehicle list.
          </p>
        </div>
      </article>

      <div class="tracking-disclaimer">
        DEMO GPS MODE — Positions are approximate sample city coordinates,
        not live vehicle telemetry. No real GPS, ELD, traffic, or driver
        location data is being received. Real-time tracking requires a
        connected provider and secure backend.
      </div>
    </div>

    <footer>
      © 2026 Northstar Logistics Intelligence
      <span>Fleet Tracking · Demonstration data</span>
    </footer>
  `;

  const dispatchPage = $("#page-dispatch");

  if (dispatchPage) {
    dispatchPage.insertAdjacentElement("beforebegin", page);
  } else {
    document.querySelector(".main").appendChild(page);
  }

  $("#trackingSearch").addEventListener("input", renderTrackingList);

  $("#trackingStatusFilter").addEventListener("change", event => {
    trackingFilter = event.target.value;
    renderTrackingList();
  });

  $("#trackingResetMap").addEventListener("click", () => {
    if (northstarMap) {
      northstarMap.setView([39.5,-98.35], 4);
    }
  });

  $("#trackingVehicleList").addEventListener("click", event => {
    const item = event.target.closest("[data-tracking-id]");
    if (item) selectTrackingTruck(item.dataset.trackingId);
  });

  renderTrackingStats();
  renderTrackingList();
}

/* ---------- LEAFLET MAP LOADER ---------- */

function loadTrackingMapLibrary() {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve();
      return;
    }

    if (!document.querySelector("#leaflet-css")) {
      const css = document.createElement("link");
      css.id = "leaflet-css";
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(css);
    }

    const existing = document.querySelector("#leaflet-js");

    if (existing) {
      existing.addEventListener("load", resolve, {once:true});
      existing.addEventListener("error", reject, {once:true});
      return;
    }

    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/* ---------- MAP INITIALIZATION ---------- */

async function activateTrackingPage() {
  if (!$("#page-tracking")) return;

  try {
    await loadTrackingMapLibrary();

    if (!northstarMap) {
      northstarMap = L.map("northstarMap", {
        scrollWheelZoom:true
      }).setView([39.5,-98.35],4);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19
}).addTo(northstarMap);
    }

    setTimeout(() => {
      northstarMap.invalidateSize();
      renderTrackingMarkers();
    },150);

  } catch (error) {
    console.error("Tracking map error:",error);

    $("#northstarMap").innerHTML = `
      <div class="tracking-empty">
        Map library could not load. Check your internet connection
        and refresh the page.
      </div>
    `;
  }
}

/* ---------- TRACKING DATA ---------- */

function getTrackingLoad(truck) {
  return loads.find(load =>
    load.driver === truck.driver &&
    load.status !== "Delivered"
  );
}

function renderTrackingStats() {
  const target = $("#trackingStats");
  if (!target) return;

  const total = trucks.length;
  const moving = trucks.filter(t => t.status === "On Route").length;
  const available = trucks.filter(t => t.status === "Available").length;
  const attention = trucks.filter(t =>
    ["Maintenance","Offline"].includes(t.status)
  ).length;

  target.innerHTML = `
    <div class="tracking-stat">
      <span>Total vehicles</span>
      <strong>${total}</strong>
    </div>
    <div class="tracking-stat">
      <span>On route</span>
      <strong style="color:#a993ff">${moving}</strong>
    </div>
    <div class="tracking-stat">
      <span>Available</span>
      <strong style="color:#4ed5a5">${available}</strong>
    </div>
    <div class="tracking-stat">
      <span>Needs attention</span>
      <strong style="color:#f0b36f">${attention}</strong>
    </div>
  `;
}

function renderTrackingList() {
  const list = $("#trackingVehicleList");
  if (!list) return;

  const query = ($("#trackingSearch")?.value || "").toLowerCase();

  const filtered = trucks.filter(truck => {
    const matchesStatus =
      trackingFilter === "all" || truck.status === trackingFilter;

    const searchText = [
      truck.id,
      truck.model,
      truck.driver,
      truck.location,
      truck.plate
    ].join(" ").toLowerCase();

    return matchesStatus && searchText.includes(query);
  });

  $("#trackingVehicleCount").textContent =
    `${filtered.length} of ${trucks.length} vehicles`;

  list.innerHTML = filtered.map(truck => `
    <div class="tracking-truck ${
      selectedTrackingTruck === truck.id ? "selected" : ""
    }" data-tracking-id="${escapeHTML(truck.id)}">
      <div class="tracking-truck-top">
        <b>${escapeHTML(truck.id)}</b>
        ${fleetStatus(truck.status)}
      </div>
      <small>${escapeHTML(truck.model)}</small>
      <small>⌖ ${escapeHTML(truck.location)}</small>
      <small>Driver: ${escapeHTML(truck.driver || "Unassigned")}</small>
    </div>
  `).join("") || `
    <div class="tracking-empty">No matching vehicles found.</div>
  `;
}

/* ---------- MAP MARKERS ---------- */

function renderTrackingMarkers() {
  if (!northstarMap) return;

  Object.values(trackingMarkers).forEach(marker => {
    northstarMap.removeLayer(marker);
  });

  trackingMarkers = {};

  trucks.forEach(truck => {
    const coords = trackingCoordinates(truck.location);

    const marker = L.marker(coords, {
      icon:trackingMarkerIcon(truck.status)
    }).addTo(northstarMap);

    marker.bindPopup(`
      <b>${escapeHTML(truck.id)}</b><br>
      ${escapeHTML(truck.model)}<br>
      Driver: ${escapeHTML(truck.driver || "Unassigned")}<br>
      Status: ${escapeHTML(truck.status)}<br>
      Location: ${escapeHTML(truck.location)}
    `);

    marker.on("click", () => {
      selectTrackingTruck(truck.id);
    });

    trackingMarkers[truck.id] = marker;
  });
}

/* ---------- SELECT VEHICLE ---------- */

function selectTrackingTruck(id) {
  const truck = trucks.find(item => item.id === id);
  if (!truck) return;

  selectedTrackingTruck = id;

  const load = getTrackingLoad(truck);
  const details = $("#trackingDetails");

  const coords = trackingCoordinates(truck.location);

  details.innerHTML = `
    <h3>${escapeHTML(truck.id)} · ${escapeHTML(truck.model)}</h3>

    <div class="tracking-detail-row">
      <span>License plate</span>
      <b>${escapeHTML(truck.plate)}</b>
    </div>

    <div class="tracking-detail-row">
      <span>Vehicle type</span>
      <b>${escapeHTML(truck.type)}</b>
    </div>

    <div class="tracking-detail-row">
      <span>Driver</span>
      <b>${escapeHTML(truck.driver || "Unassigned")}</b>
    </div>

    <div class="tracking-detail-row">
      <span>Current location</span>
      <b>${escapeHTML(truck.location)}</b>
    </div>

    <div class="tracking-detail-row">
      <span>Vehicle status</span>
      <b>${escapeHTML(truck.status)}</b>
    </div>

    <div class="tracking-detail-row">
      <span>Active load</span>
      <b>${escapeHTML(load?.id || "No active load")}</b>
    </div>

    <div class="tracking-detail-row">
      <span>Coordinates</span>
      <b>${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}</b>
    </div>

    <div class="tracking-detail-row">
      <span>Position type</span>
      <b>Demo city coordinate</b>
    </div>
  `;

  renderTrackingList();

  if (northstarMap && trackingMarkers[id]) {
    northstarMap.setView(
      trackingMarkers[id].getLatLng(),
      7
    );

    trackingMarkers[id].openPopup();
  }
}

/* ---------- DATA REFRESH ---------- */

function refreshTracking() {
  renderTrackingStats();
  renderTrackingList();

  if (northstarMap) {
    renderTrackingMarkers();
  }
}

/* ---------- STARTUP ---------- */

document.addEventListener("DOMContentLoaded", () => {
  createTrackingPage();

  window.addEventListener("hashchange", () => {
    if (location.hash === "#tracking") {
      showPage("tracking");
      activateTrackingPage();
    }
  });

  if (location.hash === "#tracking") {
    showPage("tracking");
    activateTrackingPage();
  }

  console.log("Northstar Fleet Tracking initialized.");
});

