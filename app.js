
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
