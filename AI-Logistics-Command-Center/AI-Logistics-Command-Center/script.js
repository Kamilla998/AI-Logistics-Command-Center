/* AI Logistics Command Center — front-end demo.
   All loads, drivers, metrics and GPS points are sample data.
   No real dispatch, payments, customer data or AI model is connected. */

const loads = [
  {id:"LD-8042",customer:"Northstar Retail",origin:"Dallas, TX",destination:"Houston, TX",driver:"Michael Chen",pickup:"Nov 21, 2026",rate:2450,status:"Delivered"},
  {id:"LD-8041",customer:"BluePeak Foods",origin:"Chicago, IL",destination:"Detroit, MI",driver:"Sarah Johnson",pickup:"Nov 21, 2026",rate:1850,status:"In transit"},
  {id:"LD-8040",customer:"Atlas Supply Co.",origin:"Atlanta, GA",destination:"Orlando, FL",driver:"Robert Williams",pickup:"Nov 21, 2026",rate:1320,status:"In transit"},
  {id:"LD-8039",customer:"Summit Home",origin:"Phoenix, AZ",destination:"Las Vegas, NV",driver:"Alex Parker",pickup:"Nov 22, 2026",rate:980,status:"Pending"},
  {id:"LD-8038",customer:"Evergreen Market",origin:"Nashville, TN",destination:"Charlotte, NC",driver:"David Miller",pickup:"Nov 21, 2026",rate:2100,status:"Delayed"},
  {id:"LD-8037",customer:"Coastal Freight",origin:"Los Angeles, CA",destination:"San Diego, CA",driver:"James Wilson",pickup:"Nov 20, 2026",rate:760,status:"Delivered"},
  {id:"LD-8036",customer:"Prime Industrial",origin:"Seattle, WA",destination:"Portland, OR",driver:"Emily Davis",pickup:"Nov 22, 2026",rate:1190,status:"Pending"},
  {id:"LD-8035",customer:"Redwood Commerce",origin:"Denver, CO",destination:"Kansas City, MO",driver:"Daniel Brown",pickup:"Nov 20, 2026",rate:1675,status:"Delivered"}
];

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const money = n => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
const statusClass = s => ({ "Delivered":"status-delivered","In transit":"status-transit","Pending":"status-pending","Delayed":"status-delayed" }[s] || "status-pending");
function statusPill(s){return `<span class="status-pill ${statusClass(s)}">${s}</span>`;}
function routeCell(a,b){return `<div class="route-cell"><span>${a}</span><span class="route-arrow">→</span><span>${b}</span></div>`;}
function loadRow(l, all=false){
  return `<tr><td class="load-id">${l.id}</td><td>${l.customer}</td><td>${routeCell(l.origin,l.destination)}</td><td>${l.driver || "Unassigned"}</td>${all?`<td>${l.pickup}</td>`:""}<td>${money(Number(l.rate))}</td><td>${statusPill(l.status)}</td></tr>`;
}
function renderLoads(){
  $("#recentLoadsBody").innerHTML=loads.slice(0,5).map(l=>loadRow(l)).join("");
  const q=($("#loadSearch")?.value||"").toLowerCase();
  const status=$("#statusFilter")?.value||"all";
  const filtered=loads.filter(l=>(status==="all"||l.status===status)&&[l.id,l.customer,l.origin,l.destination,l.driver].join(" ").toLowerCase().includes(q));
  $("#allLoadsBody").innerHTML=filtered.map(l=>loadRow(l,true)).join("") || `<tr><td colspan="7" style="text-align:center;color:#8190a5;padding:28px">No matching loads found.</td></tr>`;
  if($("#loadCount")) $("#loadCount").textContent=`Showing ${filtered.length} of ${loads.length} loads`;
}
renderLoads();

// Navigation between dashboard views
function goTo(view){
  $$(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${view}`));
  $$(".nav-item[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  const active=$(`.nav-item[data-view="${view}"]`);
  $("#breadcrumbCurrent").textContent=active?active.textContent.trim().replace(/\s+\d+$/,""):view;
  $("#sidebar").classList.remove("open");
  if(view==="fleet") setTimeout(()=>{initMap("fullFleetMap",true);maps.full?.invalidateSize();},100);
  window.scrollTo({top:0,behavior:"smooth"});
}
$$(".nav-item[data-view]").forEach(b=>b.addEventListener("click",()=>goTo(b.dataset.view)));
$$("[data-goto]").forEach(b=>b.addEventListener("click",()=>goTo(b.dataset.goto)));
$("#openAssistant").addEventListener("click",()=>goTo("assistant"));
$("#menuToggle").addEventListener("click",()=>$("#sidebar").classList.add("open"));
$("#sidebarClose").addEventListener("click",()=>$("#sidebar").classList.remove("open"));
$("#notificationBtn").addEventListener("click",()=>toast("You're all caught up. No new notifications."));

// Demo charts
function makeChart(canvasId, labels, revenue, expenses){
  const canvas=document.getElementById(canvasId); if(!canvas||!window.Chart)return;
  return new Chart(canvas,{type:"line",data:{labels,datasets:[
    {label:"Revenue",data:revenue,borderColor:"#43c5e2",backgroundColor:"rgba(67,197,226,.10)",fill:true,tension:.38,borderWidth:2,pointRadius:0,pointHoverRadius:4},
    {label:"Expenses",data:expenses,borderColor:"#9982f5",backgroundColor:"rgba(153,130,245,.04)",fill:false,tension:.38,borderWidth:2,pointRadius:0,pointHoverRadius:4,borderDash:[4,4]}
  ]},options:{responsive:true,maintainAspectRatio:false,interaction:{intersect:false,mode:"index"},plugins:{legend:{display:false},tooltip:{backgroundColor:"#0b1626",borderColor:"#2b3c53",borderWidth:1,titleColor:"#dce8f5",bodyColor:"#a9bad0",padding:10,displayColors:true}},scales:{x:{grid:{display:false},ticks:{color:"#71829a",font:{size:9},maxTicksLimit:7}},y:{grid:{color:"rgba(125,145,170,.12)"},ticks:{color:"#71829a",font:{size:9},callback:v=>"$"+(v/1000).toFixed(0)+"k"},border:{display:false}}}}});
}
let revenueChart, analyticsChart;
function initCharts(){
  const labels=["Nov 1","Nov 5","Nov 9","Nov 13","Nov 17","Nov 21"];
  revenueChart=makeChart("revenueChart",labels,[31000,38500,34000,47000,42500,51590],[22000,26000,24500,31000,28500,34200]);
  analyticsChart=makeChart("analyticsChart",labels,[31000,38500,34000,47000,42500,51590],[22000,26000,24500,31000,28500,34200]);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initCharts);else initCharts();
$("#revenueRange").addEventListener("change",e=>{
  const days=Number(e.target.value);
  const factor=days===7?0.28:days===90?2.7:1;
  if(revenueChart){revenueChart.data.datasets[0].data=[31000,38500,34000,47000,42500,51590].map(v=>Math.round(v*factor));revenueChart.data.datasets[1].data=[22000,26000,24500,31000,28500,34200].map(v=>Math.round(v*factor));revenueChart.update();}
});

// Maps: illustrative sample locations, not real vehicle GPS.
const fleetPoints=[
  ["Seattle, WA",47.6062,-122.3321,"Moving"],["Portland, OR",45.5152,-122.6784,"Available"],
  ["San Francisco, CA",37.7749,-122.4194,"Moving"],["Los Angeles, CA",34.0522,-118.2437,"Stopped"],
  ["Phoenix, AZ",33.4484,-112.074,"Moving"],["Denver, CO",39.7392,-104.9903,"Available"],
  ["Dallas, TX",32.7767,-96.797,"Moving"],["Houston, TX",29.7604,-95.3698,"Stopped"],
  ["Kansas City, MO",39.0997,-94.5786,"Moving"],["Chicago, IL",41.8781,-87.6298,"Available"],
  ["Nashville, TN",36.1627,-86.7816,"Moving"],["Atlanta, GA",33.749,-84.388,"Stopped"],
  ["Miami, FL",25.7617,-80.1918,"Available"],["Charlotte, NC",35.2271,-80.8431,"Moving"],
  ["New York, NY",40.7128,-74.006,"Moving"],["Boston, MA",42.3601,-71.0589,"Available"]
];
const maps={};
function initMap(id,large=false){
  const el=document.getElementById(id);if(!el||!window.L||maps[id])return;
  const map=L.map(id,{scrollWheelZoom:false,zoomControl:true}).setView([38.5,-97.5],large?4:3.5);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',subdomains:"abcd",maxZoom:19}).addTo(map);
  fleetPoints.forEach(([name,lat,lng,state])=>{
    const color=state==="Moving"?"#45c8e8":state==="Stopped"?"#f5a64b":"#9a83f7";
    const icon=L.divIcon({className:"fleet-marker-wrap",html:`<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid #e9f6ff;box-shadow:0 0 0 5px ${color}33"></div>`,iconSize:[10,10],iconAnchor:[5,5]});
    L.marker([lat,lng],{icon}).addTo(map).bindPopup(`<strong>${name}</strong><br>Fleet status: ${state}<br><small>Illustrative demo position</small>`);
  });
  maps[id]=map;
}
function initAllMaps(){initMap("fleetMap");}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initAllMaps);else initAllMaps();

// Load modal and local-only demo record creation
const modal=$("#loadModal");
function openModal(){modal.classList.add("open");modal.setAttribute("aria-hidden","false");}
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");}
$("#newLoadBtn").addEventListener("click",openModal);$("#newLoadBtn2").addEventListener("click",openModal);
$("#closeModal").addEventListener("click",closeModal);$("#cancelModal").addEventListener("click",closeModal);
modal.addEventListener("click",e=>{if(e.target===modal)closeModal();});
$("#newLoadForm").addEventListener("submit",e=>{
  e.preventDefault();const f=new FormData(e.target);
  const date=new Date(f.get("pickup")+"T12:00:00");
  const newLoad={id:"LD-"+(8052+loads.length-8),customer:f.get("customer"),origin:f.get("origin"),destination:f.get("destination"),driver:"Unassigned",pickup:date.toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"}),rate:Number(f.get("rate")),status:"Pending"};
  loads.unshift(newLoad);renderLoads();e.target.reset();closeModal();toast(`${newLoad.id} added to the demo load board.`);
});
$("#loadSearch").addEventListener("input",renderLoads);$("#statusFilter").addEventListener("change",renderLoads);

// Assistant demo responses
const responses=[
  "There are 1,248 loads in the sample dashboard. 392 are marked in transit, 172 pending and 684 delivered. The figures are illustrative and are not connected to a live TMS.",
  "The demo data flags load LD-8038 on the Nashville-to-Charlotte lane as delayed. A real integration could compare GPS/ETA updates against appointment windows and alert a dispatcher.",
  "The sample fleet panel shows 26 available trucks, 42 moving and 18 stopped. A production version would need a GPS provider or telematics API to verify capacity."
];
function addChat(text,who="bot"){
  const box=$("#chatMessages"),div=document.createElement("div");div.className=`chat-message ${who==="user"?"user-message":"bot-message"}`;
  if(who==="user"){const bubble=document.createElement("div");bubble.textContent=text;div.appendChild(bubble);}
  else{const avatar=document.createElement("span");avatar.className="chat-avatar";avatar.textContent="✧";const content=document.createElement("div");const strong=document.createElement("strong");strong.textContent="Logistics AI";const p=document.createElement("p");p.textContent=text;content.append(strong,p);div.append(avatar,content);}
  box.appendChild(div);box.scrollTop=box.scrollHeight;
}
function askDemo(q){addChat(q,"user");const lower=q.toLowerCase();let answer=responses[0];if(lower.includes("delay")||lower.includes("risk"))answer=responses[1];if(lower.includes("driver")||lower.includes("capacity")||lower.includes("truck"))answer=responses[2];setTimeout(()=>addChat(answer),350);}
$$(".prompt-chips button").forEach(b=>b.addEventListener("click",()=>askDemo(b.dataset.prompt)));
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();const input=$("#chatInput");const q=input.value.trim();if(!q)return;input.value="";askDemo(q);});

// Export sample report as CSV
function exportCSV(){
  const header=["Load ID","Customer","Origin","Destination","Driver","Pickup","Rate USD","Status"];
  const rows=loads.map(l=>[l.id,l.customer,l.origin,l.destination,l.driver,l.pickup,l.rate,l.status]);
  const csv=[header,...rows].map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="apex-logistics-loads-demo.csv";a.click();URL.revokeObjectURL(url);toast("Demo load report exported.");
}
$("#exportBtn").addEventListener("click",exportCSV);$("#analyticsExport").addEventListener("click",exportCSV);
$("#allActivityBtn").addEventListener("click",()=>toast("Activity history will be expanded in a future version."));
$$("[data-toast]").forEach(b=>b.addEventListener("click",()=>toast(b.dataset.toast)));

let toastTimer;
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2800);}
$("#todayDate").textContent=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
