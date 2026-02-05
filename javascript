(() => {
  const qs = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));

  const KEY = "chh_platform_2026_v2";

  const DEFAULT = {
    year: 2026,
    theme: "dark",
    leaders: {
      holding: [
        { name: "Lalə Həsənli", role: "Təsisçi, Lider" },
        { name: "Nicat Umarlı", role: "CEO, Lider" }
      ],
      byDivision: {
        academy: [],
        volunteer: [],
        sales: []
      }
    },
    divisions: [
      { id: "academy", name: "Academy", note: "Təlim sistemi, kurslar, nəşr." },
      { id: "volunteer", name: "Volunteer", note: "Komanda işi, sosial fəaliyyət." },
      { id: "sales", name: "Sales & Market", note: "Satış, marketinq, məhsul portfeli." }
    ],
    tasks: [],
    products: [],
    partners: [],
    logs: [
      { text: "Sistem başladıldı.", time: new Date().toLocaleString("az-AZ") }
    ],
    notes: { quick: "" }
  };

  const clone = (x) => JSON.parse(JSON.stringify(x));
  let state = load();

  function load(){
    const raw = localStorage.getItem(KEY);
    if(!raw){ localStorage.setItem(KEY, JSON.stringify(DEFAULT)); return clone(DEFAULT); }
    try{
      const parsed = JSON.parse(raw);
      return { ...clone(DEFAULT), ...parsed };
    }catch{
      localStorage.setItem(KEY, JSON.stringify(DEFAULT));
      return clone(DEFAULT);
    }
  }

  function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }

  function nowAZ(){ return new Date().toLocaleString("az-AZ"); }

  function addLog(text){
    state.logs.unshift({ text, time: nowAZ() });
    if(state.logs.length > 60) state.logs.pop();
    save();
    renderLogs();
  }

  /* ===== ROUTE ===== */
  const views = qsa(".view");
  const navBtns = qsa("[data-route]");
  const pageTitle = qs("#pageTitle");

  const TITLES = {
    panel:"Panel",
    bolmeler:"Bölmələr",
    tapsiriqlar:"Tapşırıqlar",
    sales:"Sales & Market",
    ortaqlar:"Ortaqlar",
    senedler:"Sənədlər",
    ayarlar:"Ayarlar"
  };

  function setRoute(route){
    if(!TITLES[route]) route = "panel";
    views.forEach(v => v.classList.toggle("is-active", v.dataset.view === route));
    navBtns.forEach(b => {
      const on = b.dataset.route === route;
      b.classList.toggle("is-active", on);
      if(on) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current");
    });
    if(pageTitle) pageTitle.textContent = TITLES[route];
    if(location.hash !== "#"+route) location.hash = route;
    closeDrawer();
  }

  navBtns.forEach(b => b.addEventListener("click", () => setRoute(b.dataset.route)));
  window.addEventListener("hashchange", () => setRoute((location.hash||"#panel").replace("#","")));
  setRoute((location.hash||"#panel").replace("#",""));

  /* ===== YEAR ===== */
  qsa(".year").forEach(el => el.textContent = String(state.year));

  /* ===== DRAWER ===== */
  const drawer = qs(".drawer");
  const burger = qs(".burger");
  const drawerPanel = qs(".drawer__panel");
  const drawerClose = qs(".drawer__close");

  function openDrawer(){
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden","false");
    burger.setAttribute("aria-expanded","true");
    setTimeout(()=>drawerPanel?.focus(), 0);
  }
  function closeDrawer(){
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden","true");
    burger.setAttribute("aria-expanded","false");
  }
  burger?.addEventListener("click", ()=> drawer.classList.contains("is-open") ? closeDrawer() : openDrawer());
  drawerClose?.addEventListener("click", closeDrawer);
  drawer?.addEventListener("click", (e)=>{ if(e.target === drawer) closeDrawer(); });
  window.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeDrawer(); });

  /* ===== MODAL ===== */
  const modal = qs(".modal");
  const modalBox = qs(".modal__box");
  const modalTitle = qs("#modalTitle");
  const modalBody = qs("#modalBody");
  const modalClose = qs(".modal__close");

  function openModal(title, html){
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden","false");
    setTimeout(()=>modalBox?.focus(), 0);
  }
  function closeModal(){
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden","true");
  }
  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e)=>{ if(e.target === modal) closeModal(); });
  window.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeModal(); });

  /* ===== SEARCH ===== */
  const globalSearch = qs("#globalSearch");
  const mobileSearch = qs("#mobileSearch");
  let searchTerm = "";

  function setSearchTerm(v){
    searchTerm = (v||"").trim().toLowerCase();
    renderAll();
  }
  globalSearch?.addEventListener("input", (e)=> setSearchTerm(e.target.value));
  mobileSearch?.addEventListener("input", (e)=> setSearchTerm(e.target.value));

  /* ===== PANEL RENDER ===== */
  function renderStats(){
    const all = state.tasks.length;
    const todo = state.tasks.filter(t=>t.status==="todo").length;
    const doing = state.tasks.filter(t=>t.status==="doing").length;
    const done = state.tasks.filter(t=>t.status==="done").length;

    qs("#statAll").textContent = String(all);
    qs("#statTodo").textContent = String(todo);
    qs("#statDoing").textContent = String(doing);
    qs("#statDone").textContent = String(done);
  }

  function renderLeaders(){
    const box = qs("#leadersList");
    if(!box) return;
    box.innerHTML = "";
    state.leaders.holding.forEach(l=>{
      const div = document.createElement("div");
      div.className = "listItem";
      div.innerHTML = `<strong>${escapeHtml(l.name)}</strong><small>${escapeHtml(l.role)}</small>`;
      box.appendChild(div);
    });
  }

  function renderLogs(){
    const a = qs("#logList");
    const b = qs("#docsList");
    [a,b].forEach(box=>{
      if(!box) return;
      box.innerHTML = "";
      const list = state.logs
        .filter(x => !searchTerm || x.text.toLowerCase().includes(searchTerm))
        .slice(0, 12);

      list.forEach(l=>{
        const div = document.createElement("div");
        div.className = "listItem";
        div.innerHTML = `<span>${escapeHtml(l.text)}</span><small>${escapeHtml(l.time)}</small>`;
        box.appendChild(div);
      });

      if(!list.length){
        const div = document.createElement("div");
        div.className = "listItem";
        div.innerHTML = `<span>Heç nə tapılmadı.</span><small>—</small>`;
        box.appendChild(div);
      }
    });
  }

  /* ===== DIVISIONS ===== */
  const divisionsGrid = qs("#divisionsGrid");
  const panelDivisionCards = qs("#panelDivisionCards");
  const divisionDetail = qs("#divisionDetail");

  let selectedDivisionId = null;

  function renderDivisions(){
    if(divisionsGrid) divisionsGrid.innerHTML = "";
    if(panelDivisionCards) panelDivisionCards.innerHTML = "";

    const list = state.divisions
      .filter(d => !searchTerm || d.name.toLowerCase().includes(searchTerm) || (d.note||"").toLowerCase().includes(searchTerm));

    list.forEach(d=>{
      const card = document.createElement("div");
      card.className = "divCard";
      card.dataset.div = d.id;
      card.innerHTML = `
        <div class="divCard__t">${escapeHtml(d.name)}</div>
        <div class="divCard__s">${escapeHtml(d.note || "")}</div>
      `;
      card.addEventListener("click", ()=> selectDivision(d.id));
      divisionsGrid?.appendChild(card);

      const mini = document.createElement("div");
      mini.className = "divCard";
      mini.dataset.div = d.id;
      mini.innerHTML = `
        <div class="divCard__t">${escapeHtml(d.name)}</div>
        <div class="divCard__s">Açmaq üçün kliklə</div>
      `;
      mini.addEventListener("click", ()=> { setRoute("bolmeler"); selectDivision(d.id); });
      panelDivisionCards?.appendChild(mini);
    });

    if(selectedDivisionId && !state.divisions.find(d=>d.id===selectedDivisionId)){
      selectedDivisionId = null;
    }

    if(divisionDetail) {
      if(selectedDivisionId) renderDivisionDetail(selectedDivisionId);
      else divisionDetail.innerHTML = `
        <div class="empty">
          <div class="empty__t">Bölmə seç</div>
          <div class="empty__s">Sol tərəfdən bir bölməyə klik et.</div>
        </div>
      `;
    }
  }

  function selectDivision(id){
    selectedDivisionId = id;
    renderDivisionDetail(id);
  }

  function divisionLeadersText(id){
    const list = state.leaders.byDivision[id] || [];
    return list.length ? list.map(x=>x.name).join(", ") : "Təyin olunmayıb";
  }

  function renderDivisionDetail(id){
    const d = state.divisions.find(x=>x.id===id);
    if(!d || !divisionDetail) return;

    const taskCount = state.tasks.filter(t=>t.divisionId===id).length;

    divisionDetail.innerHTML = `
      <div class="card__head">
        <div>
          <div class="kicker">Bölmə</div>
          <div class="h1" style="font-size:22px">${escapeHtml(d.name)}</div>
          <div class="sub">${escapeHtml(d.note || "")}</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="list">
        <div class="listItem"><strong>Lider</strong><small>${escapeHtml(divisionLeadersText(id))}</small></div>
        <div class="listItem"><strong>Tapşırıq sayı</strong><small>${taskCount}</small></div>
      </div>

      <div class="divider"></div>

      <div class="btnRow">
        <button class="btn btn--primary" type="button" data-action="task-add" data-div="${escapeAttr(id)}">+ Bölmə tapşırığı</button>
        <button class="btn" type="button" data-action="leaders-manage">Lider təyini</button>
        <button class="btn" type="button" data-action="division-edit" data-div="${escapeAttr(id)}">Redaktə</button>
        <button class="btn" type="button" data-action="division-delete" data-div="${escapeAttr(id)}">Sil</button>
      </div>

      <div class="divider"></div>

      <div class="sectionT">Bölmə tapşırıqları</div>
      <div class="list" id="divisionTasksList"></div>
    `;

    const listBox = qs("#divisionTasksList");
    const tasks = state.tasks
      .filter(t => t.divisionId === id)
      .filter(t => !searchTerm || t.title.toLowerCase().includes(searchTerm))
      .slice(0, 8);

    if(!tasks.length){
      listBox.innerHTML = `<div class="listItem"><span>Tapşırıq yoxdur.</span><small>—</small></div>`;
      return;
    }

    listBox.innerHTML = "";
    tasks.forEach(t=>{
      const li = document.createElement("div");
      li.className = "listItem";
      li.innerHTML = `<span>${escapeHtml(t.title)}</span><small>${statusLabel(t.status)}</small>`;
      listBox.appendChild(li);
    });
  }

  /* ===== TASKS ===== */
  const taskDivisionFilter = qs("#taskDivisionFilter");
  const taskStatusFilter = qs("#taskStatusFilter");
  const tasksBody = qs("#tasksBody");
  const colTodo = qs("#colTodo");
  const colDoing = qs("#colDoing");
  const colDone = qs("#colDone");

  function statusLabel(s){
    if(s==="todo") return "Gözləyir";
    if(s==="doing") return "İcrada";
    return "Bitdi";
  }

  function fillDivisionSelects(){
    const opts = [`<option value="all">Bütün bölmələr</option>`]
      .concat(state.divisions.map(d=>`<option value="${escapeAttr(d.id)}">${escapeHtml(d.name)}</option>`))
      .join("");

    if(taskDivisionFilter) taskDivisionFilter.innerHTML = opts;
  }

  function renderTasks(){
    if(!tasksBody) return;

    const divId = taskDivisionFilter?.value || "all";
    const st = taskStatusFilter?.value || "all";

    const list = state.tasks.filter(t=>{
      const okDiv = divId==="all" ? true : t.divisionId === divId;
      const okSt = st==="all" ? true : t.status === st;
      const okSearch = !searchTerm ? true : (
        t.title.toLowerCase().includes(searchTerm) ||
        (t.owner||"").toLowerCase().includes(searchTerm)
      );
      return okDiv && okSt && okSearch;
    });

    // Kanban
    if(colTodo) colTodo.innerHTML = "";
    if(colDoing) colDoing.innerHTML = "";
    if(colDone) colDone.innerHTML = "";

    const addCard = (t) => {
      const div = document.createElement("div");
      div.className = "taskCard";
      div.innerHTML = `
        <div class="taskCard__t">${escapeHtml(t.title)}</div>
        <div class="taskCard__m">${escapeHtml(divName(t.divisionId))} · ${escapeHtml(t.priority)}</div>
        <div class="taskCard__actions">
          <button class="chipBtn" data-action="task-next" data-id="${t.id}">Status</button>
          <button class="chipBtn" data-action="task-edit" data-id="${t.id}">Edit</button>
          <button class="chipBtn" data-action="task-del" data-id="${t.id}">Sil</button>
        </div>
      `;
      return div;
    };

    const todo = list.filter(t=>t.status==="todo");
    const doing = list.filter(t=>t.status==="doing");
    const done = list.filter(t=>t.status==="done");

    todo.forEach(t=>colTodo?.appendChild(addCard(t)));
    doing.forEach(t=>colDoing?.appendChild(addCard(t)));
    done.forEach(t=>colDone?.appendChild(addCard(t)));

    qs("#countTodo").textContent = String(todo.length);
    qs("#countDoing").textContent = String(doing.length);
    qs("#countDone").textContent = String(done.length);

    // Table
    tasksBody.classList.add("tasks");
    tasksBody.innerHTML = "";
    list.forEach(t=>{
      const row = document.createElement("div");
      row.innerHTML = `
        <div>${escapeHtml(t.title)}</div>
        <div>${escapeHtml(divName(t.divisionId))}</div>
        <div>${escapeHtml(t.owner || "—")}</div>
        <div>${escapeHtml(t.deadline || "—")}</div>
        <div>${escapeHtml(t.priority)}</div>
        <div>${statusLabel(t.status)}</div>
        <div>
          <button class="chipBtn" data-action="task-next" data-id="${t.id}">Status</button>
        </div>
      `;
      tasksBody.appendChild(row);
    });

    renderStats();
  }

  function divName(id){
    const d = state.divisions.find(x=>x.id===id);
    return d ? d.name : "—";
  }

  function createTask(prefDivId){
    const title = prompt("Tapşırıq adı:");
    if(!title) return;

    const owner = prompt("Məsul (ad):") || "";
    const deadline = prompt("Deadline (məs: 2026-02-10):") || "";
    const priority = prompt("Prioritet (Aşağı / Normal / Yüksək):", "Normal") || "Normal";

    const divisionId = prefDivId || (taskDivisionFilter?.value !== "all" ? taskDivisionFilter.value : (state.divisions[0]?.id || "academy"));

    state.tasks.unshift({
      id: String(Date.now()),
      title,
      divisionId,
      owner,
      deadline,
      priority,
      status: "todo"
    });

    addLog(`Tapşırıq əlavə olundu: ${title}`);
    save();
    renderAll();
  }

  function nextStatus(s){
    if(s==="todo") return "doing";
    if(s==="doing") return "done";
    return "todo";
  }

  function editTask(id){
    const t = state.tasks.find(x=>x.id===id);
    if(!t) return;

    const title = prompt("Tapşırıq adı:", t.title);
    if(!title) return;

    t.title = title;
    t.owner = prompt("Məsul:", t.owner || "") || "";
    t.deadline = prompt("Deadline:", t.deadline || "") || "";
    t.priority = prompt("Prioritet:", t.priority || "Normal") || "Normal";

    addLog(`Tapşırıq redaktə olundu: ${t.title}`);
    save();
    renderAll();
  }

  function deleteTask(id){
    const t = state.tasks.find(x=>x.id===id);
    if(!t) return;
    if(!confirm("Tapşırıq silinsin?")) return;
    state.tasks = state.tasks.filter(x=>x.id!==id);
    addLog(`Tapşırıq silindi: ${t.title}`);
    save();
    renderAll();
  }

  /* ===== PRODUCTS ===== */
  const productList = qs("#productList");

  function renderProducts(){
    if(!productList) return;
    productList.classList.add("products");
    productList.innerHTML = "";

    const list = state.products.filter(p=>{
      if(!searchTerm) return true;
      return (
        p.name.toLowerCase().includes(searchTerm) ||
        p.type.toLowerCase().includes(searchTerm) ||
        (p.note||"").toLowerCase().includes(searchTerm)
      );
    });

    list.forEach(p=>{
      const row = document.createElement("div");
      row.innerHTML = `
        <div>${escapeHtml(p.name)}</div>
        <div>${escapeHtml(p.type)}</div>
        <div>${escapeHtml(p.status)}</div>
        <div>${escapeHtml(p.note || "")}</div>
        <div>
          <button class="chipBtn" data-action="product-edit" data-id="${p.id}">Edit</button>
          <button class="chipBtn" data-action="product-del" data-id="${p.id}">Sil</button>
        </div>
      `;
      productList.appendChild(row);
    });

    if(!list.length){
      const row = document.createElement("div");
      row.innerHTML = `<div>Heç nə yoxdur</div><div>—</div><div>—</div><div>—</div><div>—</div>`;
      productList.appendChild(row);
    }
  }

  function addProduct(){
    const name = prompt("Məhsul adı:");
    if(!name) return;

    const type = prompt("Tip (Nəşr / CHH markalı / Ortaq məhsulu / Digər):", "CHH markalı") || "CHH markalı";
    const status = prompt("Status (Aktiv / Passiv):", "Aktiv") || "Aktiv";
    const note = prompt("Qeyd:", "") || "";

    state.products.unshift({ id: String(Date.now()), name, type, status, note });
    addLog(`Məhsul əlavə olundu: ${name}`);
    save();
    renderAll();
  }

  function editProduct(id){
    const p = state.products.find(x=>x.id===id);
    if(!p) return;

    const name = prompt("Məhsul adı:", p.name);
    if(!name) return;

    p.name = name;
    p.type = prompt("Tip:", p.type) || p.type;
    p.status = prompt("Status:", p.status) || p.status;
    p.note = prompt("Qeyd:", p.note || "") || "";

    addLog(`Məhsul redaktə olundu: ${p.name}`);
    save();
    renderAll();
  }

  function deleteProduct(id){
    const p = state.products.find(x=>x.id===id);
    if(!p) return;
    if(!confirm("Məhsul silinsin?")) return;
    state.products = state.products.filter(x=>x.id!==id);
    addLog(`Məhsul silindi: ${p.name}`);
    save();
    renderAll();
  }

  /* ===== PARTNERS ===== */
  const partnerList = qs("#partnerList");

  function renderPartners(){
    if(!partnerList) return;
    partnerList.classList.add("partners");
    partnerList.innerHTML = "";

    const list = state.partners.filter(p=>{
      if(!searchTerm) return true;
      return (
        p.name.toLowerCase().includes(searchTerm) ||
        (p.contact||"").toLowerCase().includes(searchTerm) ||
        (p.note||"").toLowerCase().includes(searchTerm)
      );
    });

    list.forEach(p=>{
      const row = document.createElement("div");
      row.innerHTML = `
        <div>${escapeHtml(p.name)}</div>
        <div>${escapeHtml(p.status)}</div>
        <div>${escapeHtml(p.contact || "")}</div>
        <div>${escapeHtml(p.note || "")}</div>
        <div>
          <button class="chipBtn" data-action="partner-edit" data-id="${p.id}">Edit</button>
          <button class="chipBtn" data-action="partner-del" data-id="${p.id}">Sil</button>
        </div>
      `;
      partnerList.appendChild(row);
    });

    if(!list.length){
      const row = document.createElement("div");
      row.innerHTML = `<div>Heç nə yoxdur</div><div>—</div><div>—</div><div>—</div><div>—</div>`;
      partnerList.appendChild(row);
    }
  }

  function addPartner(){
    const name = prompt("Ortaq adı:");
    if(!name) return;
    const status = prompt("Status (Aktiv / Passiv):", "Aktiv") || "Aktiv";
    const contact = prompt("Əlaqə:", "") || "";
    const note = prompt("Qeyd:", "") || "";

    state.partners.unshift({ id: String(Date.now()), name, status, contact, note });
    addLog(`Ortaq əlavə olundu: ${name}`);
    save();
    renderAll();
  }

  function editPartner(id){
    const p = state.partners.find(x=>x.id===id);
    if(!p) return;

    const name = prompt("Ortaq adı:", p.name);
    if(!name) return;

    p.name = name;
    p.status = prompt("Status:", p.status) || p.status;
    p.contact = prompt("Əlaqə:", p.contact || "") || "";
    p.note = prompt("Qeyd:", p.note || "") || "";

    addLog(`Ortaq redaktə olundu: ${p.name}`);
    save();
    renderAll();
  }

  function deletePartner(id){
    const p = state.partners.find(x=>x.id===id);
    if(!p) return;
    if(!confirm("Ortaq silinsin?")) return;
    state.partners = state.partners.filter(x=>x.id!==id);
    addLog(`Ortaq silindi: ${p.name}`);
    save();
    renderAll();
  }

  /* ===== NOTES ===== */
  const quickNote = qs("#quickNote");
  if(quickNote){
    quickNote.value = state.notes.quick || "";
  }

  function saveNote(){
    state.notes.quick = (quickNote?.value || "").trim();
    addLog("Daxili qeyd yadda saxlanıldı.");
    save();
  }

  /* ===== DIVISION CRUD ===== */
  function addDivision(){
    const name = prompt("Bölmə adı:");
    if(!name) return;
    const note = prompt("Qısa qeyd:", "") || "";

    const idBase = name.toLowerCase().replace(/\s+/g,"-").replace(/[^\w-]/g,"");
    let id = idBase || "bolme";
    let n = 1;
    while(state.divisions.some(d=>d.id===id)){
      n += 1;
      id = `${idBase}-${n}`;
    }

    state.divisions.push({ id, name, note });
    state.leaders.byDivision[id] = [];
    addLog(`Bölmə əlavə olundu: ${name}`);
    save();
    renderAll();
  }

  function editDivision(id){
    const d = state.divisions.find(x=>x.id===id);
    if(!d) return;
    const name = prompt("Bölmə adı:", d.name);
    if(!name) return;
    d.name = name;
    d.note = prompt("Qeyd:", d.note || "") || "";
    addLog(`Bölmə redaktə olundu: ${d.name}`);
    save();
    renderAll();
    selectDivision(id);
  }

  function deleteDivision(id){
    const d = state.divisions.find(x=>x.id===id);
    if(!d) return;
    if(!confirm("Bölmə silinsin? (Bölmə tapşırıqları da silinə bilər)")) return;

    state.tasks = state.tasks.filter(t=>t.divisionId!==id);
    delete state.leaders.byDivision[id];
    state.divisions = state.divisions.filter(x=>x.id!==id);

    if(selectedDivisionId === id) selectedDivisionId = null;

    addLog(`Bölmə silindi: ${d.name}`);
    save();
    renderAll();
  }

  /* ===== LEADERS MANAGE ===== */
  function leadersManageModal(){
    const divOptions = state.divisions.map(d=>`
      <option value="${escapeAttr(d.id)}">${escapeHtml(d.name)}</option>
    `).join("");

    openModal("Lider idarəetməsi", `
      <div class="list">
        <div class="listItem"><strong>Holding liderləri</strong><small>Redaktə bağlanıb</small></div>
      </div>

      <div class="divider"></div>

      <div class="listItem" style="align-items:flex-start">
        <div>
          <div style="font-weight:950">Bölmə seç</div>
          <div style="color:rgba(255,255,255,.6); font-size:12px; margin-top:6px">Seçdiyin bölməyə lider əlavə et.</div>
        </div>
        <select id="lmDiv" class="select" style="min-width:220px">${divOptions}</select>
      </div>

      <div class="divider"></div>

      <div class="listItem" style="align-items:flex-start">
        <div style="flex:1">
          <div style="font-weight:950">Lider adı</div>
          <div style="color:rgba(255,255,255,.6); font-size:12px; margin-top:6px">Məs: “—” yazma, real ad yaz.</div>
        </div>
        <input id="lmName" class="select" style="min-width:220px" placeholder="Ad Soyad" />
      </div>

      <div class="btnRow" style="justify-content:flex-end">
        <button class="btn btn--primary" type="button" data-action="lm-add">Əlavə et</button>
      </div>

      <div class="divider"></div>
      <div class="sectionT">Seçilmiş bölmə liderləri</div>
      <div class="list" id="lmList"></div>
    `);

    const lmDiv = qs("#lmDiv");
    const lmList = qs("#lmList");

    const renderLmList = () => {
      const id = lmDiv.value;
      const list = state.leaders.byDivision[id] || [];
      lmList.innerHTML = "";
      if(!list.length){
        lmList.innerHTML = `<div class="listItem"><span>Təyin olunmayıb.</span><small>—</small></div>`;
        return;
      }
      list.forEach((x, idx)=>{
        const li = document.createElement("div");
        li.className = "listItem";
        li.innerHTML = `<span>${escapeHtml(x.name)}</span>
                        <button class="chipBtn" data-action="lm-del" data-idx="${idx}" data-div="${escapeAttr(id)}">Sil</button>`;
        lmList.appendChild(li);
      });
    };

    lmDiv.addEventListener("change", renderLmList);
    renderLmList();
  }

  function lmAdd(){
    const id = qs("#lmDiv")?.value;
    const name = (qs("#lmName")?.value || "").trim();
    if(!id || !name) return;

    state.leaders.byDivision[id] = state.leaders.byDivision[id] || [];
    state.leaders.byDivision[id].push({ name });

    addLog(`Bölmə lideri əlavə olundu: ${name}`);
    save();
    renderAll();
    const lmName = qs("#lmName");
    if(lmName) lmName.value = "";
    // modal içi siyahı yenilə
    const lmList = qs("#lmList");
    if(lmList){
      // yenidən render
      const list = state.leaders.byDivision[id] || [];
      lmList.innerHTML = "";
      list.forEach((x, idx)=>{
        const li = document.createElement("div");
        li.className = "listItem";
        li.innerHTML = `<span>${escapeHtml(x.name)}</span>
                        <button class="chipBtn" data-action="lm-del" data-idx="${idx}" data-div="${escapeAttr(id)}">Sil</button>`;
        lmList.appendChild(li);
      });
      if(!list.length){
        lmList.innerHTML = `<div class="listItem"><span>Təyin olunmayıb.</span><small>—</small></div>`;
      }
    }
    if(selectedDivisionId) renderDivisionDetail(selectedDivisionId);
  }

  function lmDel(divId, idx){
    const list = state.leaders.byDivision[divId] || [];
    if(!list[idx]) return;
    const name = list[idx].name;
    list.splice(idx,1);
    addLog(`Bölmə lideri silindi: ${name}`);
    save();
    renderAll();
    leadersManageModal(); // modalı yenilə
  }

  /* ===== EXPORT/IMPORT/RESET ===== */
  function exportData(){
    const blob = new Blob([JSON.stringify(state, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chh-platform-2026.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    addLog("Export edildi.");
  }

  function importData(file){
    const r = new FileReader();
    r.onload = () => {
      try{
        const parsed = JSON.parse(r.result);
        state = { ...clone(DEFAULT), ...parsed };
        save();
        addLog("Import tamamlandı.");
        renderAll();
      }catch{
        alert("Import xətası: JSON düzgün deyil.");
      }
    };
    r.readAsText(file);
  }

  function resetAll(){
    if(!confirm("Bütün məlumatlar sıfırlansın?")) return;
    state = clone(DEFAULT);
    save();
    renderAll();
  }

  /* ===== AI ASSISTANT (CRYSIA) ===== */
  const aiLog = qs("#aiLog");
  const aiForm = qs("#aiForm");
  const aiInput = qs("#aiInput");
  const assistant = qs(".assistant");
  const assistantMin = qs(".assistant__min");

  function addMsg(who, text){
    const div = document.createElement("div");
    div.className = "msg msg--" + who;
    div.textContent = text;
    aiLog.appendChild(div);
    aiLog.scrollTop = aiLog.scrollHeight;
  }

  function crysiaAnswer(q){
    const text = q.toLowerCase();

    if(text.includes("bölmə")){
      return `Sistemdə ${state.divisions.length} bölmə var: ${state.divisions.map(d=>d.name).join(", ")}.`;
    }
    if(text.includes("tapşırıq")){
      const todo = state.tasks.filter(t=>t.status==="todo").length;
      const doing = state.tasks.filter(t=>t.status==="doing").length;
      const done = state.tasks.filter(t=>t.status==="done").length;
      return `Tapşırıqlar: Gözləyir ${todo}, İcrada ${doing}, Bitdi ${done}.`;
    }
    if(text.includes("lider")){
      const hold = state.leaders.holding.map(l=>l.name).join(", ");
      return `Holding liderləri: ${hold}. Bölmə liderlərini “Ayarlar → Lider idarəetməsi” bölməsindən təyin edə bilərsən.`;
    }
    if(text.includes("məhsul")){
      return `Məhsul sayı: ${state.products.length}. Sales & Market bölməsindən idarə olunur.`;
    }
    if(text.includes("ortağ") || text.includes("ortaqlar")){
      return `Ortaq sayı: ${state.partners.length}. Ortaqlar bölməsindən idarə olunur.`;
    }
    if(text.includes("export")){
      return `Export üçün “Sənədlər” bölməsində Export düyməsini istifadə et.`;
    }
    return `Sualını dəqiqləşdir: bölmə, tapşırıq, məhsul, ortaqlar və ya liderlik barədə soruş.`;
  }

  aiForm?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const v = (aiInput.value || "").trim();
    if(!v) return;
    addMsg("user", v);
    aiInput.value = "";
    setTimeout(()=> addMsg("bot", crysiaAnswer(v)), 180);
  });

  assistantMin?.addEventListener("click", ()=> assistant.classList.toggle("is-min"));

  /* ===== THEME (sadə toggle) ===== */
  function toggleTheme(){
    // Bu versiyada dark əsasdır. İstəsən light əlavə edərik.
    addLog("Tema dəyişməsi aktiv deyil (dark əsas).");
  }

  /* ===== EVENTS ===== */
  document.addEventListener("click", (e)=>{
    const t = e.target;

    // route (drawer içi də)
    if(t.matches("[data-route]")){
      setRoute(t.dataset.route);
      closeDrawer();
    }

    if(t.matches("[data-action='tema']")) toggleTheme();

    if(t.matches("[data-action='note-save']")) saveNote();

    if(t.matches("[data-action='division-add']")) addDivision();
    if(t.matches("[data-action='division-edit']")) editDivision(t.dataset.div);
    if(t.matches("[data-action='division-delete']")) deleteDivision(t.dataset.div);

    if(t.matches("[data-action='leaders-manage']")) leadersManageModal();
    if(t.matches("[data-action='lm-add']")) lmAdd();
    if(t.matches("[data-action='lm-del']")) lmDel(t.dataset.div, Number(t.dataset.idx));

    if(t.matches("[data-action='task-add']")) createTask(t.dataset.div || null);
    if(t.matches("[data-action='task-next']")){
      const id = t.dataset.id;
      const task = state.tasks.find(x=>x.id===id);
      if(!task) return;
      task.status = nextStatus(task.status);
      addLog(`Tapşırıq statusu dəyişdi: ${task.title} → ${statusLabel(task.status)}`);
      save();
      renderAll();
    }
    if(t.matches("[data-action='task-edit']")) editTask(t.dataset.id);
    if(t.matches("[data-action='task-del']")) deleteTask(t.dataset.id);

    if(t.matches("[data-action='product-add']")) addProduct();
    if(t.matches("[data-action='product-edit']")) editProduct(t.dataset.id);
    if(t.matches("[data-action='product-del']")) deleteProduct(t.dataset.id);

    if(t.matches("[data-action='partner-add']")) addPartner();
    if(t.matches("[data-action='partner-edit']")) editPartner(t.dataset.id);
    if(t.matches("[data-action='partner-del']")) deletePartner(t.dataset.id);

    if(t.matches("[data-action='log-add']")){
      const m = prompt("Qeyd:");
      if(!m) return;
      state.logs.unshift({ text:m, time: nowAZ() });
      save();
      renderLogs();
    }
    if(t.matches("[data-action='export']")) exportData();
    if(t.matches("[data-action='reset']")) resetAll();
  });

  qs("#importFile")?.addEventListener("change", (e)=>{
    const f = e.target.files?.[0];
    if(f) importData(f);
    e.target.value = "";
  });

  taskDivisionFilter?.addEventListener("change", renderTasks);
  taskStatusFilter?.addEventListener("change", renderTasks);

  /* ===== INITIAL DATA CLEANUP ===== */
  // quick note
  if(qs("#quickNote")) qs("#quickNote").value = state.notes.quick || "";

  /* ===== RENDER ALL ===== */
  function renderAll(){
    qsa(".year").forEach(el => el.textContent = String(state.year));
    fillDivisionSelects();
    renderStats();
    renderLeaders();
    renderLogs();
    renderDivisions();
    renderTasks();
    renderProducts();
    renderPartners();
  }

  function escapeHtml(s){
    return String(s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }
  function escapeAttr(s){ return escapeHtml(s).replaceAll("`",""); }

  renderAll();
})();
