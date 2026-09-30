// Router, lesson pages and interactive labs.
(function(){
const root = document.documentElement;
const app = document.getElementById("app");
const css = n => getComputedStyle(root).getPropertyValue(n).trim();
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const byId = Object.fromEntries(LESSONS.map((l,i) => [l.id, Object.assign(l, {num: i+1})]));
let charts = [];
function killCharts(){ charts.forEach(c => c.destroy()); charts = []; }

// ---------- theme ----------
try { const t = localStorage.getItem("dl-theme"); if (t) root.dataset.theme = t; } catch(e){}
document.getElementById("themeBtn").addEventListener("click", () => {
  const isDark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = isDark ? "light" : "dark";
  try { localStorage.setItem("dl-theme", root.dataset.theme); } catch(e){}
  route();
});

// ---------- progress ----------
let progress = {};
try { progress = JSON.parse(localStorage.getItem("dl-progress") || "{}"); } catch(e){ progress = {}; }
const saveProgress = () => { try { localStorage.setItem("dl-progress", JSON.stringify(progress)); } catch(e){} };
const checklist = l => [...l.learn.map(s => "Learn: " + s[0]), ...l.setup.map(s => "Set up: " + s[0]), ...l.apply.steps.map(s => "Apply: " + s[0])];
const pct = l => { const n = checklist(l).length; return Math.round(((progress[l.id]||[]).length / n) * 100); };

// ---------- mock data ----------
function mulberry32(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const VENUES = [
  {name:"NYSE",latency:4.2,fill:0.94,share:0.30,type:"Lit exchange"},
  {name:"NASDAQ",latency:3.8,fill:0.92,share:0.28,type:"Lit exchange"},
  {name:"ARCA",latency:5.1,fill:0.89,share:0.16,type:"Lit exchange"},
  {name:"BATS",latency:3.1,fill:0.87,share:0.14,type:"Lit exchange"},
  {name:"Dark Pool",latency:8.6,fill:0.61,share:0.12,type:"Dark venue"}
];
function makeRows(seed, days){
  const rand = mulberry32(seed); const rows = [];
  let d = new Date(); let made = 0;
  while (made < days){
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6){
      const trend = 1 + (days - made) * -0.002;
      const weekday = dow === 1 ? 0.9 : dow === 5 ? 0.85 : 1;
      VENUES.forEach(v => {
        const orders = Math.round(4000 * v.share * trend * weekday * (0.8 + rand()*0.4));
        rows.push({ date:d.toISOString().slice(0,10), venue:v.name, orders,
          fillRate: Math.min(0.995, v.fill + (rand()-0.5)*0.06),
          latency: +(v.latency*(0.85 + rand()*0.5)).toFixed(2),
          notional: +(orders*(0.018 + rand()*0.01)).toFixed(2) });
      });
      made++;
    }
    d.setDate(d.getDate()-1);
  }
  return rows.reverse();
}
let seed = 2026, allRows = makeRows(seed, 120);
function summarize(rows){
  const orders = rows.reduce((s,r)=>s+r.orders,0);
  const filled = rows.reduce((s,r)=>s+r.orders*r.fillRate,0);
  const lat = rows.reduce((s,r)=>s+r.latency*r.orders,0);
  const notional = rows.reduce((s,r)=>s+r.notional,0);
  return { orders, fill: orders? filled/orders : 0, latency: orders? lat/orders : 0, notional };
}
const fmt = { int:n=>Math.round(n).toLocaleString("en-US"), pct:n=>(n*100).toFixed(1)+"%", ms:n=>n.toFixed(2)+" ms", usd:n=>"$"+(n/1000).toFixed(2)+"B" };
const rowsCSV = rows => ["date,venue,orders,fill_rate,latency_ms,notional_musd", ...rows.map(r => [r.date,r.venue,r.orders,r.fillRate.toFixed(4),r.latency,r.notional].join(","))].join("\n");

// ---------- router ----------
function route(){
  killCharts();
  const parts = location.hash.replace(/^#\/?/,"").split("/");
  if (parts[0] === "lesson" && byId[parts[1]]) renderLesson(byId[parts[1]], parts[2] || "overview");
  else renderHome();
}
window.addEventListener("hashchange", () => { route(); window.scrollTo(0,0); });

// ---------- home ----------
function renderHome(){
  document.title = "Dashboard Lab: learning to build dashboards in public";
  const done = LESSONS.filter(l => pct(l) === 100).length;
  const overall = Math.round(LESSONS.reduce((s,l)=>s+pct(l),0) / LESSONS.length);
  app.innerHTML = `
  <div class="hero">
    <h1>Learning to build dashboards, in public.</h1>
    <p>A working notebook that goes from fake data to the PL-300 exam. Pick any lesson below. Each one has its own page with steps to learn, steps to set up, how to use it on a real work project, and an interactive guide that tracks your progress.</p>
    <div class="overall" aria-label="Overall progress">
      <div class="bar"><i style="width:${overall}%"></i></div>
      <span>${overall}% through the lab, ${done} of ${LESSONS.length} lessons complete. Progress is saved in this browser.</span>
    </div>
  </div>
  <section aria-labelledby="panelH">
    <h2 id="panelH">All lessons</h2>
    <p class="lede">Six tracks, fourteen lessons. They build on each other left to right, but every lesson stands on its own.</p>
    <div class="panel">
      ${TRACKS.map(t => `
        <div class="col">
          <h3>${t.name}</h3>
          <p class="coldesc">${t.desc}</p>
          <ul>
          ${LESSONS.filter(l => l.track === t.id).map(l => `
            <li><a class="lcard" href="#/lesson/${l.id}">
              <span class="num">${l.num}</span>
              <span class="ltitle">${l.title}</span>
              <span class="lmeta">${l.level}, ${l.time}</span>
              <span class="lsum">${l.summary}</span>
              <span class="mini"><i style="width:${pct(l)}%"></i></span>
            </a></li>`).join("")}
          </ul>
        </div>`).join("")}
    </div>
  </section>
  <section id="log" aria-labelledby="logH">
    <h2 id="logH">Learning log</h2>
    <p class="lede">Short, dated notes. The mistakes stay in; they are the useful part.</p>
    <ul class="log">${LOG.map(e => `<li><time datetime="${e[0]}">${e[1]}</time>${e[2]}</li>`).join("")}</ul>
  </section>`;
}

// ---------- lesson ----------
const TABS = [["overview","Overview"],["learn","Steps to learn"],["setup","Steps to set up"],["apply","Apply at work"],["guide","Interactive guide"]];
function renderLesson(l, tab){
  if (!TABS.some(t => t[0] === tab)) tab = "overview";
  document.title = `${l.title}: Dashboard Lab`;
  const track = TRACKS.find(t => t.id === l.track);
  const prev = LESSONS[l.num-2], next = LESSONS[l.num];
  const step = (s,i) => `<li><h4>${s[0]}</h4><p>${s[1]}</p>${s[2] ? `<pre><code>${esc(s[2])}</code></pre>` : ""}</li>`;
  let body = "";
  if (tab === "overview") body = `
    <div class="two">
      <div>
        <h3>Why it matters</h3><p>${l.why}</p>
        <h3>By the end you can</h3><ul class="ticks">${l.outcomes.map(o=>`<li>${o}</li>`).join("")}</ul>
        <h3>Tools</h3><p>${l.tools.join(", ")}</p>
      </div>
      <div>
        <h3>Key terms</h3>
        ${l.terms.map(t => `<details><summary>${t[0]}</summary><p>${t[1]}</p></details>`).join("")}
        <h3>Resources</h3>
        <ul class="res">${l.resources.map(r => `<li><a href="${r[1]}" target="_blank" rel="noopener">${r[0]}</a></li>`).join("")}</ul>
      </div>
    </div>
    <p><a class="btn primary" href="#/lesson/${l.id}/learn">Start with the steps to learn</a></p>`;
  if (tab === "learn") body = `<p class="lede">Work through these in order. Code blocks are ready to copy.</p><ol class="steps">${l.learn.map(step).join("")}</ol>`;
  if (tab === "setup") body = `<p class="lede">Everything here is free or has a free option unless noted.</p><ol class="steps">${l.setup.map(step).join("")}</ol>`;
  if (tab === "apply") body = `
    <div class="scenario"><strong>Scenario</strong><p>${l.apply.scenario}</p></div>
    <ol class="steps">${l.apply.steps.map(step).join("")}</ol>
    <p class="note">Practice on mock data only. Follow your firm's data handling and tooling policies for anything work related.</p>`;
  if (tab === "guide") {
    const items = checklist(l); const got = new Set(progress[l.id] || []);
    body = `
    <div class="guide">
      <div>
        <h3>Your checklist</h3>
        <div class="overall"><div class="bar"><i id="gbar" style="width:${pct(l)}%"></i></div><span id="gtxt">${pct(l)}% complete</span></div>
        <ul class="check">${items.map((t,i) => `<li><label><input type="checkbox" data-i="${i}" ${got.has(i)?"checked":""}> <span>${t}</span></label></li>`).join("")}</ul>
        <button type="button" id="resetBtn">Reset this lesson</button>
      </div>
      <div>
        <h3>Check yourself</h3>
        <div id="quiz">${l.quiz.map((q,qi) => `
          <fieldset class="q"><legend>${qi+1}. ${q.q}</legend>
            ${q.o.map((o,oi) => `<button type="button" class="opt" data-q="${qi}" data-o="${oi}">${o}</button>`).join("")}
            <p class="fb" id="fb${qi}" role="status"></p>
          </fieldset>`).join("")}</div>
      </div>
    </div>
    ${l.lab ? `<h3 class="labh">Hands-on lab</h3><div id="lab"></div>` : ""}`;
  }
  app.innerHTML = `
  <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">All lessons</a> <span aria-hidden="true">/</span> ${track.name} <span aria-hidden="true">/</span> <span aria-current="page">${l.title}</span></nav>
  <header class="lhead">
    <span class="bignum" aria-hidden="true">${String(l.num).padStart(2,"0")}</span>
    <div>
      <h1>${l.title}</h1>
      <p>${l.summary}</p>
      <p class="lmeta">${l.level}, about ${l.time}. ${pct(l)}% complete.</p>
    </div>
  </header>
  <nav class="tabs" aria-label="Lesson sections">
    ${TABS.map(t => `<a href="#/lesson/${l.id}/${t[0]}" ${t[0]===tab?'aria-current="page"':""}>${t[1]}</a>`).join("")}
  </nav>
  <div class="tabbody">${body}</div>
  <nav class="pager" aria-label="Lesson navigation">
    ${prev ? `<a href="#/lesson/${prev.id}">Previous: ${prev.title}</a>` : "<span></span>"}
    ${next ? `<a href="#/lesson/${next.id}">Next: ${next.title}</a>` : `<a href="#/">Back to all lessons</a>`}
  </nav>`;

  if (tab === "guide") {
    app.querySelectorAll(".check input").forEach(cb => cb.addEventListener("change", () => {
      const s = new Set(progress[l.id] || []); const i = +cb.dataset.i;
      cb.checked ? s.add(i) : s.delete(i); progress[l.id] = [...s]; saveProgress();
      document.getElementById("gbar").style.width = pct(l) + "%";
      document.getElementById("gtxt").textContent = pct(l) === 100 ? "Lesson complete. Nice work." : pct(l) + "% complete";
    }));
    document.getElementById("resetBtn").addEventListener("click", () => { progress[l.id] = []; saveProgress(); route(); });
    app.querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => {
      const q = l.quiz[+b.dataset.q], oi = +b.dataset.o, fb = document.getElementById("fb" + b.dataset.q);
      b.parentElement.querySelectorAll(".opt").forEach(x => x.classList.remove("right","wrong"));
      b.classList.add(oi === q.a ? "right" : "wrong");
      fb.innerHTML = (oi === q.a ? "<strong>Correct.</strong> " : "<strong>Not quite.</strong> ") + q.why;
    }));
    if (l.lab) LABS[l.lab](document.getElementById("lab"));
  }
}

// ---------- labs ----------
const LABS = {
dashboard(el){
  el.innerHTML = `
  <div class="board">
    <div class="board-head">
      <h4>Mock execution desk, generated in your browser</h4>
      <div class="controls">
        <label>Venue <select id="venueSel"><option value="ALL">All venues</option>${VENUES.map(v=>`<option>${v.name}</option>`).join("")}</select></label>
        <label>Window <select id="winSel"><option value="20">Last 20 trading days</option><option value="60" selected>Last 60 trading days</option></select></label>
        <label>Data <button type="button" id="reseedBtn">Generate new data</button></label>
      </div>
    </div>
    <div class="kpis" id="kpis"></div>
    <div class="charts">
      <div><p class="chart-title">Daily notional traded (USD millions)</p><div class="chart-box"><canvas id="lineChart" role="img" aria-label="Line chart of daily notional"></canvas></div></div>
      <div><p class="chart-title">Fill rate by venue</p><div class="chart-box"><canvas id="barChart" role="img" aria-label="Bar chart of fill rate by venue"></canvas></div></div>
    </div>
    <div class="scroll"><table><thead><tr><th>Date</th><th>Venue</th><th class="num">Orders</th><th class="num">Fill rate</th><th class="num">Avg latency (ms)</th><th class="num">Notional ($M)</th></tr></thead><tbody id="rows"></tbody></table></div>
    <p class="msg">Showing the 8 most recent rows. <button type="button" id="copyCsv">Copy all rows as CSV</button> <span id="copyMsg" role="status"></span></p>
  </div>`;
  const venueSel = el.querySelector("#venueSel"), winSel = el.querySelector("#winSel");
  function windowRows(venue){
    const dates = [...new Set(allRows.map(r => r.date))], w = +winSel.value;
    const keep = new Set(dates.slice(-w)), prev = new Set(dates.slice(-w*2,-w));
    const ok = r => venue === "ALL" || r.venue === venue;
    return { cur: allRows.filter(r => keep.has(r.date) && ok(r)), prev: allRows.filter(r => prev.has(r.date) && ok(r)) };
  }
  function draw(){
    killCharts();
    const {cur, prev} = windowRows(venueSel.value), a = summarize(cur), b = summarize(prev);
    const delta = (x,y,low) => { if (!y) return ""; const p=(x-y)/y*100, good = low ? p<0 : p>0; return `<div class="d ${good?"up":"dn"}">${p>=0?"+":""}${p.toFixed(1)}% vs prior window</div>`; };
    el.querySelector("#kpis").innerHTML = [["Orders",fmt.int(a.orders),delta(a.orders,b.orders)],["Fill rate",fmt.pct(a.fill),delta(a.fill,b.fill)],["Avg latency",fmt.ms(a.latency),delta(a.latency,b.latency,true)],["Notional",fmt.usd(a.notional),delta(a.notional,b.notional)]]
      .map(([l,v,d]) => `<div class="kpi"><div class="l">${l}</div><div class="v">${v}</div>${d}</div>`).join("");
    const byDate = {}; cur.forEach(r => byDate[r.date] = (byDate[r.date]||0) + r.notional); const days = Object.keys(byDate);
    const all = windowRows("ALL").cur; const fillBy = VENUES.map(v => summarize(all.filter(r => r.venue === v.name)).fill*100);
    el.querySelector("#rows").innerHTML = cur.slice(-8).reverse().map(r => `<tr><td>${r.date}</td><td>${r.venue}</td><td class="num">${fmt.int(r.orders)}</td><td class="num">${fmt.pct(r.fillRate)}</td><td class="num">${r.latency.toFixed(2)}</td><td class="num">${r.notional.toFixed(2)}</td></tr>`).join("");
    if (typeof Chart === "undefined") return;
    Chart.defaults.font.family = css("--body"); Chart.defaults.color = css("--muted");
    charts.push(new Chart(el.querySelector("#lineChart"), { type:"line",
      data:{ labels:days.map(d=>d.slice(5)), datasets:[{ data:days.map(d=>byDate[d]), borderColor:css("--teal"), backgroundColor:css("--teal"), borderWidth:2, pointRadius:0, tension:.25 }]},
      options:{ maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{grid:{display:false}, ticks:{maxTicksLimit:8}}, y:{grid:{color:css("--grid")}} } } }));
    charts.push(new Chart(el.querySelector("#barChart"), { type:"bar",
      data:{ labels:VENUES.map(v=>v.name), datasets:[{ data:fillBy, backgroundColor:VENUES.map(v => venueSel.value==="ALL"||venueSel.value===v.name ? css("--marker") : css("--grid")), borderColor:css("--ink"), borderWidth:1.5 }]},
      options:{ maintainAspectRatio:false, plugins:{legend:{display:false}, tooltip:{callbacks:{label:c=>c.raw.toFixed(1)+"%"}}}, scales:{ y:{min:50,max:100,grid:{color:css("--grid")},ticks:{callback:v=>v+"%"}}, x:{grid:{display:false}} } } }));
  }
  venueSel.addEventListener("change", draw); winSel.addEventListener("change", draw);
  el.querySelector("#reseedBtn").addEventListener("click", () => { seed = Math.floor(Math.random()*1e6); allRows = makeRows(seed,120); draw(); });
  el.querySelector("#copyCsv").addEventListener("click", async () => {
    const m = el.querySelector("#copyMsg"), rows = windowRows(venueSel.value).cur;
    try { await navigator.clipboard.writeText(rowsCSV(rows)); m.textContent = `Copied ${rows.length} rows. Paste into Excel or save as a .csv file.`; }
    catch(e){ m.textContent = "The browser blocked copying. Select the table rows manually instead."; }
  });
  draw();
},
csv(el){
  el.innerHTML = `
  <p class="lede">Drop any CSV here. It is read in your browser and never uploaded. The page detects label and number columns and charts the first pair it finds.</p>
  <label class="drop" id="drop"><input type="file" id="csvInput" accept=".csv,text/csv"><strong>Choose a CSV file</strong> or drag one here</label>
  <p class="msg">No file handy? <button type="button" id="sample">Load the mock executions data</button></p>
  <div id="csvOut"></div>`;
  const out = el.querySelector("#csvOut"), drop = el.querySelector("#drop");
  const parse = text => { const lines = text.replace(/\r/g,"").split("\n").filter(x=>x.trim());
    const split = line => { const res=[]; let cur="", q=false; for (const ch of line){ if (ch==='"') q=!q; else if (ch===","&&!q){res.push(cur);cur="";} else cur+=ch; } res.push(cur); return res.map(s=>s.trim()); };
    return { head: split(lines[0]||""), body: lines.slice(1).map(split) }; };
  function show(name, text){
    killCharts();
    const {head, body} = parse(text);
    if (!body.length) { out.innerHTML = `<p class="err">${esc(name)} has a header row but no data rows.</p>`; return; }
    const isNum = i => body.every(r => r[i]===undefined || r[i]==="" || !isNaN(+r[i]));
    const idx = head.map((h,i)=>i), nums = idx.filter(isNum), txt = idx.filter(i=>!isNum(i));
    let html = `<p class="msg">Read <strong>${body.length.toLocaleString()}</strong> rows and <strong>${head.length}</strong> columns from ${esc(name)}. Numbers: ${esc(nums.map(i=>head[i]).join(", ")||"none")}. Labels: ${esc(txt.map(i=>head[i]).join(", ")||"none")}.</p>`;
    if (!nums.length || !txt.length){ out.innerHTML = html + `<p class="msg">To draw a chart the file needs at least one text column and one number column.</p>`; return; }
    const L = txt[txt.length>1?1:0], N = nums[0];
    out.innerHTML = html + `<div class="board"><p class="chart-title">Sum of ${esc(head[N])} by ${esc(head[L])}</p><div class="chart-box"><canvas id="csvChart"></canvas></div></div>`;
    const sums = {}; body.forEach(r => sums[r[L]] = (sums[r[L]]||0) + (+r[N]||0));
    const keys = Object.keys(sums).sort((a,b)=>sums[b]-sums[a]).slice(0,15);
    if (typeof Chart === "undefined") return;
    charts.push(new Chart(out.querySelector("#csvChart"), { type:"bar", data:{labels:keys, datasets:[{data:keys.map(k=>sums[k]), backgroundColor:css("--teal")}]},
      options:{maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{grid:{color:css("--grid")}}, x:{grid:{display:false}}}} }));
  }
  function handle(f){ if (!f) return; if (!/\.csv$/i.test(f.name)) { out.innerHTML = `<p class="err">${esc(f.name)} is not a .csv file. In Excel use File, Save As, CSV UTF-8, then try again.</p>`; return; }
    const r = new FileReader(); r.onload = () => show(f.name, r.result); r.readAsText(f); }
  el.querySelector("#csvInput").addEventListener("change", e => handle(e.target.files[0]));
  ["dragenter","dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave","drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", e => handle(e.dataTransfer.files[0]));
  el.querySelector("#sample").addEventListener("click", () => show("executions.csv", rowsCSV(allRows)));
},
star(el){
  const T = {
    FactExecutions:{kind:"Fact", cols:["date_key","venue_key","instrument_key","trader_key","order_type_key","order_id (degenerate)","orders","filled_orders","latency_ms","notional_musd"], note:"One row per venue per day in our lab (per order in a real system). Holds keys and numbers only."},
    DimDate:{kind:"Dimension", cols:["date_key","Date","Year","Month","MonthNum","Weekday","IsWeekday","IsHoliday"], note:"Marked as the date table. Could play two roles: trade date and settlement date."},
    DimVenue:{kind:"Dimension", cols:["venue_key","venue_name","venue_type","region","mic_code"], note:"Lit exchanges vs dark venues. Filters flow from here to the fact."},
    DimInstrument:{kind:"Dimension", cols:["instrument_key","symbol","asset_class","sector","listing_venue"], note:"Conformed dimension: the same table should serve every trading report."},
    DimTrader:{kind:"Dimension", cols:["trader_key","trader_name","desk","TraderEmail","valid_from","valid_to"], note:"SCD Type 2 so desk moves keep history. TraderEmail drives row-level security."},
    DimOrderType:{kind:"Dimension", cols:["order_type_key","order_type","algo_name","is_algo"], note:"Market, limit, algo. Small table, big filter value."}
  };
  const layout = [["DimDate","","DimVenue"],["DimTrader","FactExecutions","DimInstrument"],["","DimOrderType",""]];
  el.innerHTML = `<p class="lede">Click any table to see its columns and role. The fact sits in the middle; every dimension joins to it one-to-many.</p>
  <div class="star">${layout.flat().map(n => n ? `<button type="button" class="tbl ${T[n].kind==="Fact"?"fact":""}" data-t="${n}">${n}<small>${T[n].kind}</small></button>` : `<span></span>`).join("")}</div>
  <div class="tdetail" id="tdetail" role="status"></div>`;
  const show = n => { el.querySelectorAll(".tbl").forEach(b => b.setAttribute("aria-pressed", b.dataset.t===n)); const t = T[n];
    el.querySelector("#tdetail").innerHTML = `<h4>${n}</h4><p>${t.note}</p><ul class="cols">${t.cols.map(c=>`<li><code>${c}</code></li>`).join("")}</ul>`; };
  el.querySelectorAll(".tbl").forEach(b => b.addEventListener("click", () => show(b.dataset.t)));
  show("FactExecutions");
},
dax(el){
  const M = {
    "Total Orders": { dax:"Total Orders = SUM ( FactExecutions[orders] )", f:(rows)=>summarize(rows).orders, fmt:fmt.int, note:"Each row sees only its own venue, so values differ per row. That is filter context." },
    "Fill Rate": { dax:"Fill Rate =\nDIVIDE (\n    SUMX ( FactExecutions, FactExecutions[orders] * FactExecutions[fill_rate] ),\n    SUM ( FactExecutions[orders] )\n)", f:rows=>summarize(rows).fill, fmt:fmt.pct, note:"SUMX iterates rows (row context) and the result is weighted by orders. Notice the total is not the average of the rows." },
    "Avg Latency (weighted)": { dax:"Avg Latency =\nDIVIDE (\n    SUMX ( FactExecutions, FactExecutions[latency_ms] * FactExecutions[orders] ),\n    SUM ( FactExecutions[orders] )\n)", f:rows=>summarize(rows).latency, fmt:fmt.ms, note:"Same weighting pattern. A dark pool with fewer orders pulls the total less than a busy exchange." },
    "Share of Orders": { dax:"Share of Orders =\nVAR ThisVenue = [Total Orders]\nVAR AllVenues =\n    CALCULATE ( [Total Orders], REMOVEFILTERS ( DimVenue ) )\nRETURN\n    DIVIDE ( ThisVenue, AllVenues )", f:(rows,all)=>summarize(rows).orders/summarize(all).orders, fmt:fmt.pct, note:"REMOVEFILTERS ignores the venue filter for the denominator, including your slicer. The total row shows the share of the venues you selected." },
    "NYSE Orders": { dax:"NYSE Orders =\nCALCULATE ( [Total Orders], DimVenue[venue_name] = \"NYSE\" )", f:(rows,all)=>summarize(all.filter(r=>r.venue==="NYSE")).orders, fmt:fmt.int, note:"CALCULATE replaces the venue filter, so every row shows the NYSE value no matter which venue the row is. Surprising at first, and a classic exam question." }
  };
  el.innerHTML = `<p class="lede">Pick a measure and a slicer selection. The table shows the measure evaluated once per venue row, exactly like a Power BI table visual. Data: the last 60 trading days of the mock desk.</p>
  <div class="controls">
    <label>Measure <select id="mSel">${Object.keys(M).map(k=>`<option>${k}</option>`).join("")}</select></label>
    <fieldset class="slicer"><legend>Venue slicer</legend>${VENUES.map(v=>`<label><input type="checkbox" value="${v.name}" checked> ${v.name}</label>`).join("")}</fieldset>
  </div>
  <div class="two"><div><pre><code id="mDax"></code></pre><p id="mNote" class="msg"></p></div>
  <div class="scroll"><table><thead><tr><th>venue_name</th><th class="num" id="mHead"></th></tr></thead><tbody id="mRows"></tbody></table></div></div>`;
  const dates = [...new Set(allRows.map(r=>r.date))].slice(-60), keep = new Set(dates);
  const base = allRows.filter(r => keep.has(r.date));
  function draw(){
    const m = M[el.querySelector("#mSel").value];
    const sel = [...el.querySelectorAll(".slicer input:checked")].map(i=>i.value);
    const ctxAll = base; const selected = base.filter(r => sel.includes(r.venue));
    el.querySelector("#mDax").textContent = m.dax; el.querySelector("#mNote").textContent = m.note;
    el.querySelector("#mHead").textContent = el.querySelector("#mSel").value;
    el.querySelector("#mRows").innerHTML = sel.map(v => `<tr><td>${v}</td><td class="num">${m.fmt(m.f(base.filter(r=>r.venue===v), ctxAll))}</td></tr>`).join("")
      + (sel.length ? `<tr class="tot"><td>Total</td><td class="num">${m.fmt(m.f(selected, ctxAll))}</td></tr>` : `<tr><td colspan="2">No venues selected. The visual would be blank.</td></tr>`);
  }
  el.querySelectorAll("select, input").forEach(i => i.addEventListener("change", draw)); draw();
},
pl300(el){
  const D = [["Prepare the data",25,30],["Model the data",25,30],["Visualize and analyze the data",25,30],["Manage and secure Power BI",15,20]];
  let conf = {}; try { conf = JSON.parse(localStorage.getItem("dl-pl300") || "{}"); } catch(e){}
  el.innerHTML = `<p class="lede">Rate your confidence in each domain from 1 to 5. The lab weighs it against the exam weighting and tells you where to spend the next study session.</p>
  <div class="domains">${D.map((d,i)=>`<div class="dom"><div class="dtop"><strong>${d[0]}</strong><span>${d[1]} to ${d[2]}% of the exam</span></div>
    <div class="dbar"><i style="width:${d[2]*3}%"></i></div>
    <label>Confidence <input type="range" min="1" max="5" value="${conf[i]||3}" data-i="${i}"> <output>${conf[i]||3}</output></label></div>`).join("")}</div>
  <p class="focus" id="focus" role="status"></p>`;
  const lessonFor = ["power-query","dax","visualization","service-admin"];
  function upd(){
    let best = -1, bi = 0;
    el.querySelectorAll("input[type=range]").forEach(r => { const i = +r.dataset.i, v = +r.value; conf[i] = v; r.nextElementSibling.textContent = v; const gap = (5 - v) * ((D[i][1]+D[i][2])/2); if (gap > best){ best = gap; bi = i; } });
    try { localStorage.setItem("dl-pl300", JSON.stringify(conf)); } catch(e){}
    el.querySelector("#focus").innerHTML = best === 0 ? "You rated every domain 5. Take the official practice assessment to confirm." : `Focus next on <strong>${D[bi][0]}</strong>. Start with the lesson <a href="#/lesson/${lessonFor[bi]}">${byId[lessonFor[bi]].title}</a>${bi===1?` and <a href="#/lesson/dimensional-modeling">Dimensional modeling</a>`:""}.`;
  }
  el.querySelectorAll("input[type=range]").forEach(r => r.addEventListener("input", upd)); upd();
}
};

matchMedia("(prefers-color-scheme: dark)").addEventListener("change", route);
route();
})();
