/* app.js — Crystal Haze Holding | İdarəetmə Platforması (2026)
   Dinamik SPA məntiqi: routing, data store, tapşırıqlar, bölmələr,
   Sales & Market, ortaqlar və AI Assistant (Crysia)
*/

(() => {
  /* ===================== CORE ===================== */
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  const STORAGE_KEY = "chh_platform_2026";

  const DEFAULT_DATA = {
    year: 2026,
    leaders: {
      holding: [
        { name: "Lalə Həsənli", role: "Təsisçi, Lider" },
        { name: "Nicat Umarlı", role: "CEO, Lider" }
      ],
      divisions: {
        Academy: [],
        Volunteer: [],
        "Sales & Market": []
      }
    },
    divisions: [
      { id: "academy", name: "Academy" },
      { id: "volunteer", name: "Volunteer" },
      { id: "sales", name: "Sales & Market" }
    ],
    tasks: [],
    products: [],
    partners: [],
    logs: []
  };

  let state = loadState();

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
      return structuredClone(DEFAULT_DATA);
    }
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
      return structuredClone(DEFAULT_DATA);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function log(action) {
    state.logs.unshift({
      text: action,
      time: new Date().toLocaleString("az-AZ")
    });
    saveState();
    renderLogs();
  }

  /* ===================== ROUTING ===================== */
  const views = qsa(".view");
  const navBtns = qsa("[data-route]");
  const pageTitle = qs("#pageTitle");

  function setRoute(route) {
    views.forEach(v =>
      v.classList.toggle("is-active", v.dataset.view === route)
    );
    navBtns.forEach(b =>
      b.classList.toggle("is-active", b.dataset.route === route)
    );
    if (pageTitle) pageTitle.textContent = routeTitle(route);
    location.hash = route;
  }

  function routeTitle(r) {
    const map = {
      panel: "Panel",
      bolmeler: "Bölmələr",
      tapsiriqlar: "Tapşırıqlar",
      sales: "Sales & Market",
      ortaqlar: "Ortaqlar",
      senedler: "Sənədlər",
      ayarlar: "Ayarlar"
    };
    return map[r] || "Panel";
  }

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => setRoute(btn.dataset.route));
  });

  window.addEventListener("hashchange", () => {
    const r = location.hash.replace("#", "") || "panel";
    setRoute(r);
  });

  setRoute(location.hash.replace("#", "") || "panel");

  /* ===================== PANEL ===================== */
  function renderStats() {
    qs("#statAll").textContent = state.tasks.length;
    qs("#statTodo").textContent = state.tasks.filter(t => t.status === "todo").length;
    qs("#statDoing").textContent = state.tasks.filter(t => t.status === "doing").length;
    qs("#statDone").textContent = state.tasks.filter(t => t.status === "done").length;
  }

  function renderLeaders() {
    const box = qs("#leadersList");
    if (!box) return;
    box.innerHTML = "";

    state.leaders.holding.forEach(l => {
      const div = document.createElement("div");
      div.className = "listItem";
      div.innerHTML = `<strong>${l.name}</strong><span>${l.role}</span>`;
      box.appendChild(div);
    });
  }

  function renderLogs() {
    const box = qs("#logList");
    const box2 = qs("#docsList");
    [box, box2].forEach(b => {
      if (!b) return;
      b.innerHTML = "";
      state.logs.forEach(l => {
        const div = document.createElement("div");
        div.className = "listItem";
        div.innerHTML = `<span>${l.text}</span><small>${l.time}</small>`;
        b.appendChild(div);
      });
    });
  }

  /* ===================== DIVISIONS ===================== */
  function renderDivisions() {
    const grid = qs("#divisionsGrid");
    const mini = qs("#panelDivisionCards");
    if (grid) grid.innerHTML = "";
    if (mini) mini.innerHTML = "";

    state.divisions.forEach(d => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<strong>${d.name}</strong><p>Daxili idarəetmə</p>`;
      card.addEventListener("click", () => setRoute("tapsiriqlar"));

      if (grid) grid.appendChild(card);
      if (mini) mini.appendChild(card.cloneNode(true));
    });
  }

  /* ===================== TASKS ===================== */
  function renderTasks() {
    const cols = {
      todo: qs("#colTodo"),
      doing: qs("#colDoing"),
      done: qs("#colDone")
    };
    Object.values(cols).forEach(c => c && (c.innerHTML = ""));

    const body = qs("#tasksBody");
    if (body) body.innerHTML = "";

    state.tasks.forEach(t => {
      const item = document.createElement("div");
      item.className = "card";
      item.textContent = t.title;
      cols[t.status]?.appendChild(item);

      if (body) {
        const row = document.createElement("div");
        row.innerHTML = `
          <div>${t.title}</div>
          <div>${t.division}</div>
          <div>${t.owner}</div>
          <div>${t.deadline}</div>
          <div>${t.priority}</div>
          <div>${t.status}</div>
          <div><button data-id="${t.id}">✓</button></div>
        `;
        body.appendChild(row);
      }
    });

    renderStats();
  }

  document.addEventListener("click", e => {
    if (e.target.matches("[data-action='task-add']")) {
      const title = prompt("Tapşırıq adı:");
      if (!title) return;
      state.tasks.push({
        id: Date.now(),
        title,
        division: "Academy",
        owner: "—",
        deadline: "—",
        priority: "Normal",
        status: "todo"
      });
      log(`Yeni tapşırıq: ${title}`);
      saveState();
      renderTasks();
    }
  });

  /* ===================== SALES ===================== */
  function renderProducts() {
    const box = qs("#productList");
    if (!box) return;
    box.innerHTML = "";
    state.products.forEach(p => {
      const row = document.createElement("div");
      row.innerHTML = `
        <div>${p.name}</div>
        <div>${p.type}</div>
        <div>${p.status}</div>
        <div>${p.note}</div>
        <div>—</div>
      `;
      box.appendChild(row);
    });
  }

  document.addEventListener("click", e => {
    if (e.target.matches("[data-action='product-add']")) {
      const name = prompt("Məhsul adı:");
      if (!name) return;
      state.products.push({
        name,
        type: "CHH markalı",
        status: "Aktiv",
        note: ""
      });
      log(`Yeni məhsul: ${name}`);
      saveState();
      renderProducts();
    }
  });

  /* ===================== PARTNERS ===================== */
  function renderPartners() {
    const box = qs("#partnerList");
    if (!box) return;
    box.innerHTML = "";
    state.partners.forEach(p => {
      const row = document.createElement("div");
      row.innerHTML = `
        <div>${p.name}</div>
        <div>${p.status}</div>
        <div>${p.contact}</div>
        <div>${p.note}</div>
        <div>—</div>
      `;
      box.appendChild(row);
    });
  }

  document.addEventListener("click", e => {
    if (e.target.matches("[data-action='partner-add']")) {
      const name = prompt("Ortaq adı:");
      if (!name) return;
      state.partners.push({
        name,
        status: "Aktiv",
        contact: "",
        note: ""
      });
      log(`Yeni ortağ: ${name}`);
      saveState();
      renderPartners();
    }
  });

  /* ===================== AI ASSISTANT ===================== */
  const aiLog = qs("#aiLog");
  const aiForm = qs("#aiForm");
  const aiInput = qs("#aiInput");

  function aiReply(text) {
    let reply = "Bu məlumat sistemdə tapılmadı.";

    if (/tapşırıq/i.test(text)) {
      reply = `Sistemdə ${state.tasks.length} tapşırıq var.`;
    } else if (/məhsul/i.test(text)) {
      reply = `Sales & Market bölməsində ${state.products.length} məhsul mövcuddur.`;
    } else if (/lider/i.test(text)) {
      reply = state.leaders.holding.map(l => l.name).join(", ");
    } else if (/ortağ/i.test(text)) {
      reply = `Hazırda ${state.partners.length} ortağ var.`;
    }

    addAiMsg("bot", reply);
  }

  function addAiMsg(type, text) {
    const div = document.createElement("div");
    div.className = "msg msg--" + type;
    div.textContent = text;
    aiLog.appendChild(div);
    aiLog.scrollTop = aiLog.scrollHeight;
  }

  if (aiForm) {
    aiForm.addEventListener("submit", e => {
      e.preventDefault();
      const val = aiInput.value.trim();
      if (!val) return;
      addAiMsg("user", val);
      aiInput.value = "";
      setTimeout(() => aiReply(val), 400);
    });
  }

  /* ===================== INIT ===================== */
  renderStats();
  renderLeaders();
  renderLogs();
  renderDivisions();
  renderTasks();
  renderProducts();
  renderPartners();
})();
