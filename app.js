
const loads = [
 {id:"LD-28491",origin:"Los Angeles, CA",destination:"Dallas, TX",driver:"Marcus Johnson",pickup:"Nov 21, 2026",delivery:"Nov 22, 2026",status:"In Transit",rate:2850},
 {id:"LD-28490",origin:"Chicago, IL",destination:"Atlanta, GA",driver:"Sarah Williams",pickup:"Nov 20, 2026",delivery:"Nov 21, 2026",status:"Delivered",rate:1940},
 {id:"LD-28489",origin:"Houston, TX",destination:"Phoenix, AZ",driver:"David Chen",pickup:"Nov 21, 2026",delivery:"Nov 23, 2026",status:"In Transit",rate:3120},
 {id:"LD-28488",origin:"New York, NY",destination:"Boston, MA",driver:"James Miller",pickup:"Nov 21, 2026",delivery:"Nov 21, 2026",status:"Delayed",rate:980},
 {id:"LD-28487",origin:"Miami, FL",destination:"Orlando, FL",driver:"Olivia Brown",pickup:"Nov 20, 2026",delivery:"Nov 20, 2026",status:"Delivered",rate:760},
 {id:"LD-28486",origin:"Denver, CO",destination:"Kansas City, MO",driver:"Noah Davis",pickup:"Nov 22, 2026",delivery:"Nov 23, 2026",status:"Pending",rate:1680},
 {id:"LD-28485",origin:"Seattle, WA",destination:"Portland, OR",driver:"Ethan Wilson",pickup:"Nov 21, 2026",delivery:"Nov 21, 2026",status:"In Transit",rate:890},
 {id:"LD-28484",origin:"Nashville, TN",destination:"Charlotte, NC",driver:"Ava Martinez",pickup:"Nov 20, 2026",delivery:"Nov 21, 2026",status:"Delivered",rate:1320}
];

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
 ["✧","Chief of Staff","Coordinates the AI team, reviews agent activity, and prepares the daily master report.","Operations","Not connected"],
 ["↗","GTM Engineer","Supports product launches, growth experiments, and business performance tracking.","Growth","Not connected"],
 ["⌕","SEO / AEO Employee","Creates search-focused content and monitors organic visibility.","Marketing","Not connected"],
 ["⌘","Web Dev Employee","Reviews application code, identifies bugs, and proposes fixes.","Engineering","Not connected"],
 ["◎","Social Media Employee","Drafts social posts and prepares audience engagement responses.","Marketing","Not connected"],
 ["$","Ad Manager Employee","Monitors advertising performance, spend, and optimization opportunities.","Marketing","Not connected"],
 ["⇧","Sales Employee","Researches prospects and drafts personalized outreach messages.","Sales","Not connected"],
 ["♡","Customer Support","Organizes support requests and flags urgent customer issues.","Support","Not connected"]
];

const $ = s => document.querySelector(s);

const statusClass = s => ({
 "In Transit":"status-transit",
 "Delivered":"status-delivered",
 "Delayed":"status-delayed",
 "Pending":"status-pending"
}[s] || "status-pending");

const statusTag = s =>
 `<span class="status-pill ${statusClass(s)}">${s}</span>`;

function renderRecent(){
 $("#recentLoads").innerHTML=loads.slice(0,5).map(l=>`
 <tr>
 <td class="load-id">${l.id}</td>
 <td class="route-cell">${l.origin.split(",")[0]} <span>→</span> ${l.destination.split(",")[0]}</td>
 <td>${l.driver}</td>
 <td>${statusTag(l.status)}</td>
 <td>$${l.rate.toLocaleString("en-US")}</td>
 </tr>`).join("");
}

function renderLoads(){
 const q=($("#loadSearch")?.value||"").toLowerCase();
 const st=$("#statusFilter")?.value||"all";

 const filtered=loads.filter(l=>
 (st==="all"||l.status===st)&&
 [l.id,l.origin,l.destination,l.driver].join(" ").toLowerCase().includes(q)
 );

 $("#allLoads").innerHTML=filtered.map(l=>`
 <tr>
 <td class="load-id">${l.id}</td>
 <td>${l.origin}</td>
 <td>${l.destination}</td>
 <td>${l.driver}</td>
 <td>${l.pickup}</td>
 <td>${l.delivery}</td>
 <td>${statusTag(l.status)}</td>
 <td>$${l.rate.toLocaleString("en-US")}</td>
 </tr>`).join("") ||
 `<tr><td colspan="8">No matching loads found.</td></tr>`;

 $("#loadCount").textContent=filtered.length;
}

function renderDrivers(q=""){
 $("#driverRows").innerHTML=drivers
 .filter(d=>d.join(" ").toLowerCase().includes(q.toLowerCase()))
 .map(d=>`
 <tr>
 <td><b>${d[0]}</b></td>
 <td>${d[1]}</td>
 <td>${d[2]}</td>
 <td>${d[3]}</td>
 <td>${d[4]}</td>
 <td>${
 d[5]==="On route"
 ? '<span class="status-pill status-transit">On route</span>'
 : d[5]==="Available"
 ? '<span class="status-pill status-delivered">Available</span>'
 : d[5]==="Attention"
 ? '<span class="status-pill status-delayed">Attention</span>'
 : '<span class="status-pill status-pending">Assigned</span>'
 }</td>
 </tr>`).join("") ||
 `<tr><td colspan="6">No drivers found.</td></tr>`;
}

function renderAgents(){
 $("#agentMiniList").innerHTML=agents.slice(0,4).map(a=>`
 <div class="agent-mini">
 <span class="agent-avatar">${a[0]}</span>
 <div>
 <b>${a[1]}</b>
 <small>${a[2].slice(0,39)}...</small>
 </div>
 <span class="agent-state">Setup</span>
 </div>`).join("");

 $("#agentGrid").innerHTML=agents.map(a=>`
 <article class="agent-card">
 <div class="agent-card-top">
 <span class="agent-avatar">${a[0]}</span>
 <span class="status-pill status-pending">SETUP</span>
 </div>
 <h3>${a[1]}</h3>
 <p>${a[2]}</p>
 <div class="agent-card-foot">
 <span>${a[3]}</span>
 <b>${a[4]}</b>
 </div>
 </article>`).join("");
}

function renderQueue(){
 const items=loads.filter(l=>["Delayed","Pending"].includes(l.status));

 $("#dispatchQueue").innerHTML=items.map(l=>`
 <div class="queue-item">
 <b>${l.id} · ${l.origin.split(",")[0]} → ${l.destination.split(",")[0]}</b>
 <p>${l.driver} · $${l.rate.toLocaleString("en-US")}</p>
 ${statusTag(l.status)}
 </div>`).join("");
}

function toast(msg){
 const t=$("#toast");
 t.textContent=msg;
 t.classList.add("show");
 setTimeout(()=>t.classList.remove("show"),2600);
}

function showPage(name){
 document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));

 const page=$("#page-"+name)||$("#page-overview");
 page.classList.add("active-page");

 document.querySelectorAll(".nav-link").forEach(a=>
 a.classList.toggle("active",a.dataset.page===name)
 );

 $("#breadcrumbPage").textContent=({
 overview:"Overview",
 loads:"Load board",
 fleet:"Fleet & drivers",
 dispatch:"Dispatch",
 finance:"Finance",
 analytics:"Analytics",
 agents:"AI employees",
 reports:"Daily reports"
 })[name]||"Overview";

 $("#sidebar").classList.remove("open");
}

function navigateFromHash(){
 const name=location.hash.replace("#","")||"overview";
 showPage(name);
}

function csvExport(rows,filename){
 const csv=rows.map(r=>
 r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")
 ).join("\n");

 const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");

 a.href=url;
 a.download=filename;
 a.click();

 URL.revokeObjectURL(url);
}

function exportLoads(){
 csvExport([
 ["Load ID","Origin","Destination","Driver","Pickup","Delivery","Status","Rate USD"],
 ...loads.map(l=>[
 l.id,l.origin,l.destination,l.driver,
 l.pickup,l.delivery,l.status,l.rate
 ])
 ],"northstar-loads.csv");
}

function openModal(){
 $("#modalBackdrop").classList.add("show");
}

function closeModal(){
 $("#modalBackdrop").classList.remove("show");
}

function setup(){
 const now=new Date();

 $("#todayDate").textContent=now.toLocaleDateString("en-US",{
 weekday:"short",
 month:"short",
 day:"numeric",
 year:"numeric"
 });

 renderRecent();
 renderLoads();
 renderDrivers();
 renderAgents();
 renderQueue();
 navigateFromHash();

 document.querySelectorAll("[data-page]").forEach(a=>
 a.addEventListener("click",e=>{
 e.preventDefault();
 const p=a.dataset.page;
 location.hash=p;
 showPage(p);
 })
 );

 window.addEventListener("hashchange",navigateFromHash);

 $("#mobileMenu").addEventListener("click",()=>
 $("#sidebar").classList.toggle("open")
 );

 ["newLoadBtn","newLoadBtn2"].forEach(id=>
 $("#"+id).addEventListener("click",openModal)
 );

 $("#closeModal").addEventListener("click",closeModal);

 $("#modalBackdrop").addEventListener("click",e=>{
 if(e.target.id==="modalBackdrop")closeModal();
 });

 $("#loadForm").addEventListener("submit",e=>{
 e.preventDefault();

 const f=new FormData(e.target);
 const id="LD-"+(28500+loads.length);

 const dateFmt=v=>new Date(v+"T12:00:00")
 .toLocaleDateString("en-US",{
 month:"short",
 day:"numeric",
 year:"numeric"
 });

 loads.unshift({
 id,
 origin:f.get("origin"),
 destination:f.get("destination"),
 driver:f.get("driver"),
 pickup:dateFmt(f.get("pickup")),
 delivery:dateFmt(f.get("delivery")),
 status:"Pending",
 rate:Number(f.get("rate"))
 });

 renderRecent();
 renderLoads();
 renderQueue();

 e.target.reset();
 closeModal();
 toast("Demo load created successfully.");
 });

 $("#loadSearch").addEventListener("input",renderLoads);
 $("#statusFilter").addEventListener("change",renderLoads);

 $("#clearFilters").addEventListener("click",()=>{
 $("#loadSearch").value="";
 $("#statusFilter").value="all";
 renderLoads();
 });

 $("#driverSearch").addEventListener("input",e=>
 renderDrivers(e.target.value)
 );

 $("#exportLoads").addEventListener("click",exportLoads);

 ["exportBtn","financeExport","analyticsExport"].forEach(id=>
 $("#"+id).addEventListener("click",()=>{
 exportLoads();
 toast("CSV report exported.");
 })
 );

 $("#addDriver").addEventListener("click",()=>
 toast("Driver creation will be enabled after backend integration.")
 );

 $("#dispatchAction").addEventListener("click",()=>
 toast("Dispatch assignment requires a connected backend.")
 );

 $("#generateReport").addEventListener("click",()=>{
 $("#reportHistory").className="";

 $("#reportHistory").innerHTML=`
 <div class="queue-item">
 <b>Daily operations summary · ${new Date().toLocaleDateString()}</b>
 <p>Demo report generated locally. 8 AI employees are awaiting connection. Active sample loads: ${loads.length}.</p>
 <span class="status-pill status-pending">DEMO REPORT</span>
 </div>`;

 toast("Demo report generated.");
 });

 $("#globalSearch").addEventListener("keydown",e=>{
 if(e.key==="Enter"){
 location.hash="loads";
 $("#loadSearch").value=e.target.value;
 renderLoads();
 }
 });
}

document.addEventListener("DOMContentLoaded",setup);
