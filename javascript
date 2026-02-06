// app.js — CHH Operational System (routes + i18n + local storage + Crysia)
(function () {
  const qs = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));
  const nowISO = () => new Date().toISOString();

  const ROUTES = new Set(["home","academy","volunteer","sales","contact"]);
  const routeFx = qs(".routeFx");
  const views = qsa(".view");
  const navBtns = qsa(".nav__btn");
  const drawer = qs(".drawer");
  const drawerPanel = qs(".drawer__panel");
  const burger = qs(".burger");
  const closeBtn = qs(".drawer__close");

  // ===== Storage =====
  const KEY = "chh_operational_v1";
  const defaultState = () => ({
    lang: "az",
    toggles: { academy:true, volunteer:true, sales:true },
    active: {
      academy: "courses",
      volunteer: "roles",
      sales: "products"
    },
    lists: {
      academy: { courses: [], masterclass: [], publications: [] },
      volunteer: { roles: [], events: [], ops: [] },
      sales: { products: [], partners: [], pipeline: [] }
    },
    activity: [
      { t: "SYSTEM", d: nowISO() }
    ]
  });

  function loadState(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return mergeDeep(defaultState(), parsed);
    }catch{
      return defaultState();
    }
  }
  function saveState(){
    localStorage.setItem(KEY, JSON.stringify(state));
  }
  function mergeDeep(a,b){
    if(typeof a !== "object" || !a || typeof b !== "object" || !b) return b ?? a;
    const out = Array.isArray(a) ? [...a] : {...a};
    for(const k of Object.keys(b)){
      if(k in a) out[k] = mergeDeep(a[k], b[k]);
      else out[k] = b[k];
    }
    return out;
  }

  let state = loadState();

  // ===== i18n =====
  const i18n = {
    az: {
      "top.subtitle":"Rəsmi əməliyyat platforması",
      "nav.home":"Ana",
      "nav.academy":"Academy",
      "nav.volunteer":"Volunteer",
      "nav.sales":"Sales & Market",
      "nav.contact":"Əlaqə",

      "home.kicker":"Holding Paneli",
      "home.subline":"Ümumi baxış · bölmələr · status",
      "home.status":"Status",
      "home.quickOpen":"Bölmələri aç",
      "home.metrics.divisions":"Bölmələr",
      "home.metrics.active":"Aktiv",
      "home.metrics.academy":"Academy",
      "home.metrics.volunteer":"Volunteer",
      "home.metrics.sales":"Sales",
      "home.metrics.activity":"Aktivlik",
      "home.addLog":"Log əlavə et",
      "home.clearLog":"Təmizlə",
      "home.leadership":"Liderlik",
      "leaders.founder":"Təsisçi, Lider",
      "leaders.ceo":"CEO, Lider",
      "home.badge":"Rəsmi",
      "home.badge2":"Struktur",
      "home.modules":"Modullar",
      "home.modulesHint":"İdarəetmə üçün bölmə aç",
      "home.items":"Maddə",

      "page.division":"Bölmə",
      "page.control":"İdarəetmə",
      "page.status":"Status",
      "page.toggle":"ON/OFF",
      "page.leader":"Lider",
      "page.quick":"Sürətli",
      "page.seed":"Nümunə",
      "page.clear":"Təmizlə",

      "academy.sub":"Proqramlar · Masterclass · Nəşr",
      "academy.items":"Maddələr",
      "academy.tabs.courses":"Kurslar",
      "academy.tabs.masterclass":"Masterclass",
      "academy.tabs.publications":"Nəşr",
      "academy.add":"Maddə əlavə et",

      "volunteer.sub":"Əməliyyat · Rollar · Tədbirlər",
      "volunteer.items":"Maddələr",
      "volunteer.tabs.roles":"Rollar",
      "volunteer.tabs.events":"Tədbirlər",
      "volunteer.tabs.ops":"Ops",
      "volunteer.add":"Maddə əlavə et",

      "sales.sub":"Məhsullar · Ortaqlar · Satış axını",
      "sales.channels":"Kanallar",
      "sales.channel.publishing":"Nəşr məhsulları",
      "sales.channel.chh":"CHH markalı məhsullar",
      "sales.channel.partners":"Ortaqların məhsulları",
      "sales.channel.services":"Xidmətlər",
      "sales.items":"Maddələr",
      "sales.tabs.products":"Məhsullar",
      "sales.tabs.partners":"Ortaqlar",
      "sales.tabs.pipeline":"Pipeline",
      "sales.add":"Maddə əlavə et",

      "contact.title":"Rəsmi Əlaqə",
      "contact.sub":"Kanallar · Form · Dəstək",
      "contact.direct":"Birbaşa",
      "contact.phone":"Telefon",
      "contact.call":"Zəng",
      "contact.social":"Sosial",
      "contact.form":"Form",
      "contact.openForm":"Google Form aç",
      "contact.quick":"Sürətli",

      "modal.addItem":"Maddə əlavə et",
      "modal.type":"Tip",
      "modal.title":"Başlıq",
      "modal.note":"Qeyd",
      "modal.save":"Yadda saxla",
      "modal.cancel":"Ləğv et",

      "bot.send":"Göndər",
      "bot.hint":"Yaz: “status”, “open academy”, “add product”, “language az/en/ru”"
    },
    en: {
      "top.subtitle":"Official operational platform",
      "nav.home":"Home",
      "nav.academy":"Academy",
      "nav.volunteer":"Volunteer",
      "nav.sales":"Sales & Market",
      "nav.contact":"Contact",

      "home.kicker":"Holding Console",
      "home.subline":"Overview · divisions · status",
      "home.status":"Status",
      "home.quickOpen":"Open divisions",
      "home.metrics.divisions":"Divisions",
      "home.metrics.active":"Active",
      "home.metrics.academy":"Academy",
      "home.metrics.volunteer":"Volunteer",
      "home.metrics.sales":"Sales",
      "home.metrics.activity":"Activity",
      "home.addLog":"Add log",
      "home.clearLog":"Clear",
      "home.leadership":"Leadership",
      "leaders.founder":"Founder, Leader",
      "leaders.ceo":"CEO, Leader",
      "home.badge":"Official",
      "home.badge2":"Structured",
      "home.modules":"Modules",
      "home.modulesHint":"Open a division to manage items",
      "home.items":"Items",

      "page.division":"Division",
      "page.control":"Control",
      "page.status":"Status",
      "page.toggle":"ON/OFF",
      "page.leader":"Leader",
      "page.quick":"Quick",
      "page.seed":"Seed",
      "page.clear":"Clear",

      "academy.sub":"Programs · Masterclasses · Publications",
      "academy.items":"Items",
      "academy.tabs.courses":"Courses",
      "academy.tabs.masterclass":"Masterclass",
      "academy.tabs.publications":"Publications",
      "academy.add":"Add item",

      "volunteer.sub":"Ops · Roles · Events",
      "volunteer.items":"Items",
      "volunteer.tabs.roles":"Roles",
      "volunteer.tabs.events":"Events",
      "volunteer.tabs.ops":"Ops",
      "volunteer.add":"Add item",

      "sales.sub":"Products · Partners · Sales flow",
      "sales.channels":"Channels",
      "sales.channel.publishing":"Publishing products",
      "sales.channel.chh":"CHH branded products",
      "sales.channel.partners":"Partner products",
      "sales.channel.services":"Services",
      "sales.items":"Items",
      "sales.tabs.products":"Products",
      "sales.tabs.partners":"Partners",
      "sales.tabs.pipeline":"Pipeline",
      "sales.add":"Add item",

      "contact.title":"Official Contact",
      "contact.sub":"Channels · Form · Support",
      "contact.direct":"Direct",
      "contact.phone":"Phone",
      "contact.call":"Call",
      "contact.social":"Social",
      "contact.form":"Form",
      "contact.openForm":"Open Google Form",
      "contact.quick":"Quick",

      "modal.addItem":"Add item",
      "modal.type":"Type",
      "modal.title":"Title",
      "modal.note":"Note",
      "modal.save":"Save",
      "modal.cancel":"Cancel",

      "bot.send":"Send",
      "bot.hint":"Try: “status”, “open academy”, “add product”, “language az/en/ru”"
    },
    ru: {
      "top.subtitle":"Официальная операционная платформа",
      "nav.home":"Главная",
      "nav.academy":"Academy",
      "nav.volunteer":"Volunteer",
      "nav.sales":"Sales & Market",
      "nav.contact":"Контакты",

      "home.kicker":"Панель холдинга",
      "home.subline":"Обзор · подразделения · статус",
      "home.status":"Статус",
      "home.quickOpen":"Открыть подразделения",
      "home.metrics.divisions":"Подразделения",
      "home.metrics.active":"Активно",
      "home.metrics.academy":"Academy",
      "home.metrics.volunteer":"Volunteer",
      "home.metrics.sales":"Sales",
      "home.metrics.activity":"Активность",
      "home.addLog":"Добавить лог",
      "home.clearLog":"Очистить",
      "home.leadership":"Руководство",
      "leaders.founder":"Основатель, Лидер",
      "leaders.ceo":"CEO, Лидер",
      "home.badge":"Официально",
      "home.badge2":"Структура",
      "home.modules":"Модули",
      "home.modulesHint":"Откройте подразделение для управления",
      "home.items":"Элементы",

      "page.division":"Подразделение",
      "page.control":"Управление",
      "page.status":"Статус",
      "page.toggle":"ON/OFF",
      "page.leader":"Лидер",
      "page.quick":"Быстро",
      "page.seed":"Заполнить",
      "page.clear":"Очистить",

      "academy.sub":"Программы · Мастер-классы · Публикации",
      "academy.items":"Элементы",
      "academy.tabs.courses":"Курсы",
      "academy.tabs.masterclass":"Мастер-классы",
      "academy.tabs.publications":"Публикации",
      "academy.add":"Добавить",

      "volunteer.sub":"Операции · Роли · События",
      "volunteer.items":"Элементы",
      "volunteer.tabs.roles":"Роли",
      "volunteer.tabs.events":"События",
      "volunteer.tabs.ops":"Ops",
      "volunteer.add":"Добавить",

      "sales.sub":"Продукты · Партнёры · Продажи",
      "sales.channels":"Каналы",
      "sales.channel.publishing":"Издательские продукты",
      "sales.channel.chh":"Бренд CHH",
      "sales.channel.partners":"Продукты партнёров",
      "sales.channel.services":"Услуги",
      "sales.items":"Элементы",
      "sales.tabs.products":"Продукты",
      "sales.tabs.partners":"Партнёры",
      "sales.tabs.pipeline":"Pipeline",
      "sales.add":"Добавить",

      "contact.title":"Официальные контакты",
      "contact.sub":"Каналы · Форма · Поддержка",
      "contact.direct":"Прямые",
      "contact.phone":"Телефон",
      "contact.call":"Звонок",
      "contact.social":"Соцсети",
      "contact.form":"Форма",
      "contact.openForm":"Открыть Google Form",
      "contact.quick":"Быстро",

      "modal.addItem":"Добавить",
      "modal.type":"Тип",
      "modal.title":"Название",
      "modal.note":"Заметка",
      "modal.save":"Сохранить",
      "modal.cancel":"Отмена",

      "bot.send":"Отправить",
      "bot.hint":"Напишите: “status”, “open academy”, “add product”, “language az/en/ru”"
    }
  };

  function t(key){
    return (i18n[state.lang] && i18n[state.lang][key]) || key;
  }
  function applyI18n(){
    document.documentElement.lang = state.lang;
    qsa("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    // placeholders (only for bot input)
    const inp = qs("#crysiaInput");
    if(inp){
      const ph = state.lang === "az" ? "Komanda yaz…" : state.lang === "ru" ? "Введите команду…" : "Type a command…";
      inp.placeholder = ph;
    }
  }

  function setLang(lang){
    if(!["az","en","ru"].includes(lang)) return;
    state.lang = lang;
    saveState();
    qsa(".lang__btn").forEach(b=>b.classList.toggle("is-active", b.dataset.lang === lang));
    applyI18n();
    renderAll();
    crysiaSay(shortBot("lang", {lang}));
  }

  // ===== Routing =====
  function setActiveRoute(route) {
    if (!ROUTES.has(route)) route = "home";
    routeFx.classList.add("on");
    window.setTimeout(() => routeFx.classList.remove("on"), 220);

    views.forEach(v => v.classList.toggle("is-active", v.dataset.view === route));
    navBtns.forEach(b => {
      const on = b.dataset.route === route;
      b.classList.toggle("is-active", on);
      if (on) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    qsa(".drawer__item").forEach(b => b.classList.toggle("is-active", b.dataset.route === route));

    closeDrawer();
    if (location.hash !== "#" + route) location.hash = route;
  }

  function openDrawer() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("lock");
    document.body.classList.add("lock");
    window.setTimeout(() => drawerPanel && drawerPanel.focus(), 0);
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("lock");
    document.body.classList.remove("lock");
  }

  // ===== UI render =====
  function fmtTime(iso){
    try{
      const d = new Date(iso);
      const hh = String(d.getHours()).padStart(2,"0");
      const mm = String(d.getMinutes()).padStart(2,"0");
      return `${hh}:${mm}`;
    }catch{ return ""; }
  }

  function renderHome(){
    qs("#year").textContent = "2026";
    qsa(".year").forEach(y=>y.textContent = "2026");

    const onA = !!state.toggles.academy;
    const onV = !!state.toggles.volunteer;
    const onS = !!state.toggles.sales;

    qs("#holdingStatus").textContent = (onA || onV || onS) ? "ACTIVE" : "PAUSED";
    qs("#miniAcademy").textContent = onA ? "ON" : "OFF";
    qs("#miniVolunteer").textContent = onV ? "ON" : "OFF";
    qs("#miniSales").textContent = onS ? "ON" : "OFF";

    qs("#chipAcademy").textContent = onA ? "ON" : "OFF";
    qs("#chipVolunteer").textContent = onV ? "ON" : "OFF";
    qs("#chipSales").textContent = onS ? "ON" : "OFF";

    const cntA = countAll(state.lists.academy);
    const cntV = countAll(state.lists.volunteer);
    const cntS = countAll(state.lists.sales);
    qs("#countAcademy").textContent = String(cntA);
    qs("#countVolunteer").textContent = String(cntV);
    qs("#countSales").textContent = String(cntS);

    const act = qs("#homeActivity");
    act.innerHTML = "";
    const a = state.activity.slice(-6).reverse();
    a.forEach(x=>{
      const el = document.createElement("div");
      el.className = "logItem";
      el.innerHTML = `<div class="logItem__t">${escapeHtml(x.t)}</div><div class="logItem__d">${fmtTime(x.d)}</div>`;
      act.appendChild(el);
    });
  }

  function renderDivisionStatus(){
    qs("#statusAcademy").textContent = state.toggles.academy ? "ON" : "OFF";
    qs("#statusVolunteer").textContent = state.toggles.volunteer ? "ON" : "OFF";
    qs("#statusSales").textContent = state.toggles.sales ? "ON" : "OFF";
  }

  function renderLists(){
    renderList("academy", qs("#academyList"));
    renderList("volunteer", qs("#volunteerList"));
    renderList("sales", qs("#salesList"));
  }

  function renderList(domain, mount){
    if(!mount) return;
    const scope = state.active[domain];
    const data = state.lists[domain][scope] || [];
    mount.innerHTML = "";

    if(!state.toggles[domain]){
      mount.appendChild(emptyLine(domain, true));
      return;
    }

    if(data.length === 0){
      mount.appendChild(emptyLine(domain, false));
      return;
    }

    data
      .slice()
      .sort((a,b)=> (b.created||"").localeCompare(a.created||""))
      .forEach(item=>{
        const el = document.createElement("div");
        el.className = "item";
        el.innerHTML = `
          <div class="item__top">
            <div class="item__title">${escapeHtml(item.title || "-")}</div>
            <button class="iconBtn" type="button" aria-label="Remove" data-remove="${domain}:${scope}:${item.id}">✕</button>
          </div>
          ${item.note ? `<div class="item__note">${escapeHtml(item.note)}</div>` : ""}
          <div class="item__meta">
            <div class="pillMini">${escapeHtml(scope)}</div>
            <div class="pillMini">${fmtTime(item.created || nowISO())}</div>
          </div>
        `;
        mount.appendChild(el);
      });
  }

  function emptyLine(domain, paused){
    const el = document.createElement("div");
    el.className = "item";
    const msg = paused
      ? (state.lang==="az" ? "Bölmə OFF-dur." : state.lang==="ru" ? "Раздел выключен." : "Division is OFF.")
      : (state.lang==="az" ? "Heç nə yoxdur." : state.lang==="ru" ? "Пусто." : "Empty.");
    el.innerHTML = `<div class="item__title">${msg}</div>`;
    return el;
  }

  function renderTabs(){
    qsa(".tab").forEach(btn=>{
      const domain = btn.dataset.tab;
      const scope = btn.dataset.scope;
      const active = state.active[domain] === scope;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function renderAll(){
    renderHome();
    renderDivisionStatus();
    renderTabs();
    renderLists();
  }

  function countAll(obj){
    let n = 0;
    Object.keys(obj).forEach(k => n += (obj[k] || []).length);
    return n;
  }

  function escapeHtml(s){
    return String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  // ===== Actions =====
  function addActivity(t){
    state.activity.push({ t, d: nowISO() });
    state.activity = state.activity.slice(-50);
    saveState();
    renderHome();
  }

  function toggleDivision(domain){
    state.toggles[domain] = !state.toggles[domain];
    saveState();
    renderAll();
    addActivity(`${domain.toUpperCase()} ${state.toggles[domain] ? "ON" : "OFF"}`);
  }

  function seed(domain){
    const add = (scope, title, note="") => {
      state.lists[domain][scope].push({ id: uid(), title, note, created: nowISO() });
    };

    if(domain === "academy"){
      add("courses","Course #01","Program");
      add("masterclass","Masterclass #01","");
      add("publications","Publication #01","");
    }
    if(domain === "volunteer"){
      add("roles","Role: Coordination","");
      add("events","Event: Internal","");
      add("ops","Ops: Checklist","");
    }
    if(domain === "sales"){
      add("products","CHH Product #01","CHH");
      add("partners","Partner #01","");
      add("pipeline","Lead #01","Contacted");
    }

    saveState();
    renderAll();
    addActivity(`${domain.toUpperCase()} SEED`);
  }

  function clearDomain(domain){
    Object.keys(state.lists[domain]).forEach(scope => state.lists[domain][scope] = []);
    saveState();
    renderAll();
    addActivity(`${domain.toUpperCase()} CLEAR`);
  }

  function removeItem(domain, scope, id){
    const arr = state.lists[domain][scope] || [];
    state.lists[domain][scope] = arr.filter(x => x.id !== id);
    saveState();
    renderAll();
    addActivity(`${domain.toUpperCase()} REMOVE`);
  }

  function uid(){
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
  }

  // ===== Modals =====
  function openModal(id){
    const m = qs("#"+id);
    if(!m) return;
    m.classList.add("is-open");
    m.setAttribute("aria-hidden", "false");
    const panel = qs(".modal__panel", m);
    setTimeout(()=>panel && panel.focus(), 0);
  }
  function closeModal(modalEl){
    modalEl.classList.remove("is-open");
    modalEl.setAttribute("aria-hidden", "true");
  }

  // ===== Crysia =====
  const assistant = qs(".assistant");
  const minBtn = qs(".assistant__min");
  const log = qs("#crysiaLog");
  const form = qs("#crysiaForm");
  const input = qs("#crysiaInput");

  function crysiaMsg(text, who){
    const el = document.createElement("div");
    el.className = "bmsg " + (who === "user" ? "bmsg--user" : "bmsg--bot");
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }
  function crysiaSay(text){
    crysiaMsg(text, "bot");
  }

  function shortBot(type, payload={}){
    const L = state.lang;
    const onOff = (x)=> x ? "ON" : "OFF";
    if(type === "hello"){
      return L==="az" ? "Crysia: hazır." : L==="ru" ? "Crysia: готово." : "Crysia: ready.";
    }
    if(type === "status"){
      const s = `A:${onOff(state.toggles.academy)} V:${onOff(state.toggles.volunteer)} S:${onOff(state.toggles.sales)}`;
      return L==="az" ? `Status: ${s}` : L==="ru" ? `Статус: ${s}` : `Status: ${s}`;
    }
    if(type === "open"){
      const r = payload.route || "home";
      return L==="az" ? `Açıldı: ${r}` : L==="ru" ? `Открыто: ${r}` : `Opened: ${r}`;
    }
    if(type === "added"){
      return L==="az" ? "Əlavə olundu." : L==="ru" ? "Добавлено." : "Added.";
    }
    if(type === "removed"){
      return L==="az" ? "Silindi." : L==="ru" ? "Удалено." : "Removed.";
    }
    if(type === "lang"){
      const x = payload.lang || "az";
      return L==="az" ? `Dil: ${x.toUpperCase()}` : L==="ru" ? `Язык: ${x.toUpperCase()}` : `Language: ${x.toUpperCase()}`;
    }
    if(type === "help"){
      return L==="az"
        ? "Komandalar: status | open academy/volunteer/sales/home | toggle academy/volunteer/sales | add product/partner/pipeline/course/event/role | language az/en/ru"
        : L==="ru"
        ? "Команды: status | open academy/volunteer/sales/home | toggle academy/volunteer/sales | add product/partner/pipeline/course/event/role | language az/en/ru"
        : "Commands: status | open academy/volunteer/sales/home | toggle academy/volunteer/sales | add product/partner/pipeline/course/event/role | language az/en/ru";
    }
    return L==="az" ? "OK." : L==="ru" ? "OK." : "OK.";
  }

  function parseCommand(raw){
    const s = (raw || "").trim();
    const low = s.toLowerCase();

    if(!s) return { type:"none" };
    if(low === "help" || low === "?" ) return { type:"help" };
    if(low.startsWith("language ")){
      const lang = low.split(/\s+/)[1];
      return { type:"language", lang };
    }
    if(low === "status") return { type:"status" };

    if(low.startsWith("open ")){
      const r = low.split(/\s+/)[1];
      return { type:"open", route: normalizeRoute(r) };
    }
    if(low.startsWith("toggle ")){
      const d = low.split(/\s+/)[1];
      return { type:"toggle", domain: normalizeDomain(d) };
    }

    // add <thing>
    if(low.startsWith("add ")){
      const x = low.slice(4).trim();
      return { type:"add", what: x };
    }

    return { type:"unknown", raw:s };
  }

  function normalizeRoute(x){
    if(["home","academy","volunteer","sales","contact"].includes(x)) return x;
    return "home";
  }
  function normalizeDomain(x){
    if(["academy","volunteer","sales"].includes(x)) return x;
    return null;
  }

  function handleCrysia(cmd){
    if(cmd.type === "help"){
      crysiaSay(shortBot("help"));
      return;
    }
    if(cmd.type === "status"){
      crysiaSay(shortBot("status"));
      return;
    }
    if(cmd.type === "language"){
      if(["az","en","ru"].includes(cmd.lang)){
        setLang(cmd.lang);
      } else {
        crysiaSay(shortBot("help"));
      }
      return;
    }
    if(cmd.type === "open"){
      setActiveRoute(cmd.route);
      crysiaSay(shortBot("open", {route:cmd.route}));
      return;
    }
    if(cmd.type === "toggle"){
      if(!cmd.domain){
        crysiaSay(shortBot("help"));
        return;
      }
      toggleDivision(cmd.domain);
      crysiaSay(shortBot("status"));
      return;
    }
    if(cmd.type === "add"){
      const what = cmd.what || "";
      const addTo = (domain, scope, title) => {
        state.lists[domain][scope].push({ id: uid(), title, note:"", created: nowISO() });
        saveState();
        renderAll();
        addActivity(`${domain.toUpperCase()} ADD`);
        crysiaSay(shortBot("added"));
      };

      // simple mapping
      if(what.startsWith("product")){
        addTo("sales","products","New product");
        return;
      }
      if(what.startsWith("partner")){
        addTo("sales","partners","New partner");
        return;
      }
      if(what.startsWith("pipeline") || what.startsWith("lead")){
        addTo("sales","pipeline","New lead");
        return;
      }
      if(what.startsWith("course")){
        addTo("academy","courses","New course");
        return;
      }
      if(what.startsWith("masterclass")){
        addTo("academy","masterclass","New masterclass");
        return;
      }
      if(what.startsWith("publication")){
        addTo("academy","publications","New publication");
        return;
      }
      if(what.startsWith("event")){
        addTo("volunteer","events","New event");
        return;
      }
      if(what.startsWith("role")){
        addTo("volunteer","roles","New role");
        return;
      }
      if(what.startsWith("ops")){
        addTo("volunteer","ops","New ops item");
        return;
      }

      crysiaSay(shortBot("help"));
      return;
    }

    if(cmd.type === "unknown"){
      // short answer only
      crysiaSay(shortBot("help"));
      return;
    }
  }

  // ===== Events =====
  navBtns.forEach(btn => btn.addEventListener("click", () => setActiveRoute(btn.dataset.route)));
  qsa(".drawer__item").forEach(btn => btn.addEventListener("click", () => setActiveRoute(btn.dataset.route)));
  qsa("[data-jump]").forEach(btn => btn.addEventListener("click", () => setActiveRoute(btn.dataset.jump)));

  burger.addEventListener("click", () => {
    if (drawer.classList.contains("is-open")) closeDrawer();
    else openDrawer();
  });
  closeBtn.addEventListener("click", closeDrawer);
  drawer.addEventListener("click", (e) => { if (e.target === drawer) closeDrawer(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDrawer(); closeAllModals(); } });

  // language
  qsa(".lang__btn").forEach(b => b.addEventListener("click", ()=> setLang(b.dataset.lang)));

  // toggles
  qsa("[data-toggle]").forEach(b=>{
    b.addEventListener("click", ()=> toggleDivision(b.dataset.toggle));
  });

  // tabs
  qsa(".tab").forEach(b=>{
    b.addEventListener("click", ()=>{
      const domain = b.dataset.tab;
      const scope = b.dataset.scope;
      state.active[domain] = scope;
      saveState();
      renderTabs();
      renderLists();
    });
  });

  // list remove delegation
  document.addEventListener("click", (e)=>{
    const t = e.target;
    if(!(t instanceof HTMLElement)) return;

    // remove
    const rem = t.getAttribute("data-remove");
    if(rem){
      const [domain, scope, id] = rem.split(":");
      removeItem(domain, scope, id);
      return;
    }

    // home activity actions
    const act = t.getAttribute("data-action");
    if(act === "addActivity"){
      addActivity("LOG");
      return;
    }
    if(act === "clearActivity"){
      state.activity = [{ t:"SYSTEM", d: nowISO() }];
      saveState();
      renderHome();
      return;
    }

    if(act === "academySeed") return seed("academy");
    if(act === "volunteerSeed") return seed("volunteer");
    if(act === "salesSeed") return seed("sales");
    if(act === "academyClear") return clearDomain("academy");
    if(act === "volunteerClear") return clearDomain("volunteer");
    if(act === "salesClear") return clearDomain("sales");

    // modal open
    const open = t.getAttribute("data-modal-open");
    if(open){
      openModal(open);
      return;
    }

    // modal close via attribute
    if(t.hasAttribute("data-close-modal")){
      const m = t.closest(".modal");
      if(m) closeModal(m);
      return;
    }
  });

  // modals close buttons + overlay click
  qsa(".modal").forEach(m=>{
    const close = qs(".modal__close", m);
    close && close.addEventListener("click", ()=> closeModal(m));
    m.addEventListener("click", (e)=>{ if(e.target === m) closeModal(m); });
  });

  // modal forms
  qsa(".modal__form").forEach(f=>{
    f.addEventListener("submit", (e)=>{
      e.preventDefault();
      const form = e.currentTarget;
      const domain = form.getAttribute("data-form");
      const fd = new FormData(form);
      const scope = String(fd.get("scope") || "").trim();
      const title = String(fd.get("title") || "").trim();
      const note = String(fd.get("note") || "").trim();

      if(!domain || !scope || !title) return;

      state.lists[domain][scope].push({
        id: uid(),
        title,
        note,
        created: nowISO()
      });

      saveState();
      renderAll();
      addActivity(`${domain.toUpperCase()} ADD`);
      const modal = form.closest(".modal");
      if(modal) closeModal(modal);
      form.reset();
    });
  });

  function closeAllModals(){
    qsa(".modal.is-open").forEach(m=>closeModal(m));
  }

  // assistant
  minBtn.addEventListener("click", () => assistant.classList.toggle("is-min"));
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const v = (input.value || "").trim();
    if(!v) return;
    crysiaMsg(v, "user");
    input.value = "";
    const cmd = parseCommand(v);
    handleCrysia(cmd);
  });

  // hash routing
  const initial = (location.hash || "#home").replace("#", "");
  setActiveRoute(initial);
  window.addEventListener("hashchange", () => {
    const r = (location.hash || "#home").replace("#", "");
    setActiveRoute(r);
  });

  // init language buttons
  qsa(".lang__btn").forEach(b=>b.classList.toggle("is-active", b.dataset.lang === state.lang));

  applyI18n();
  renderAll();
  crysiaSay(shortBot("hello"));

})();
