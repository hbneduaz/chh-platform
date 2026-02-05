/* js/app.js — CHH Working Holding System (routing + CRUD + kanban + export/import + theme)
   Assets: assets/chh_logo.png
   Storage keys: chh_db_v1, chh_theme
*/

(() => {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ---------- Utils ----------
  const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    const pad = (x) => String(x).padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  };

  // ---------- DB ----------
  const STORAGE_KEY = "chh_db_v1";
  const THEME_KEY = "chh_theme";

  const defaultDB = () => ({
    meta: {
      org: "Crystal Haze Holding",
      year: 2026,
      createdAt: Date.now(),
    },
    leaders: [
      { id: uid(), name: "Lalə Həsənli", role: "Təsisçi, Lider" },
      { id: uid(), name: "Nicat Umarlı", role: "CEO, Lider" },
    ],
    divisions: [
      { id: "academy", name: "Academy", leaderIds: [], note: "" },
      { id: "volunteer", name: "Volunteer", leaderIds: [], note: "" },
      { id: "sales", name: "Sales & Market", leaderIds: [], note: "" },
    ],
    tasks: [
      {
        id: uid(),
        title: "Academy plan — 1-ci həftə",
        divisionId: "academy",
        status: "todo",
        priority: "M",
        due: todayISO(),
        owner: "Lalə Həsənli",
        createdAt: Date.now(),
      },
      {
        id: uid(),
        title: "Volunteer tədbir planı",
        divisionId: "volunteer",
        status: "doing",
        priority: "H",
        due: todayISO(),
        owner: "Nicat Umarlı",
        createdAt: Date.now(),
      },
      {
        id: uid(),
        title: "Sales & Market — məhsul siyahısı",
        divisionId: "sales",
        status: "done",
        priority: "L",
        due: todayISO(),
        owner: "Nicat Umarlı",
        createdAt: Date.now(),
      },
    ],
    products: [
      { id: uid(), title: "Nəşr məhsulları", divisionId: "sales", type: "nəşr", note: "" },
      { id: uid(), title: "CHH markalı məhsullar", divisionId: "sales", type: "chh", note: "" },
      { id: uid(), title: "Ortaqların məhsulları", divisionId: "sales", type: "ortaq", note: "" },
    ],
    partners: [
      { id: uid(), name: "Partner 1", note: "" },
      { id: uid(), name: "Partner 2", note: "" },
    ],
    logs: [
      { id: uid(), at: Date.now(), text: "Sistem başladıldı." },
    ],
  });

  const loadDB = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultDB();
      const parsed = JSON.parse(raw);
      // minimal migration guards:
      if (!parsed.meta) parsed.meta = { org: "Crystal Haze Holding", year: 2026, createdAt: Date.now() };
      if (!Array.isArray(parsed.tasks)) parsed.tasks = [];
      if (!Array.isArray(parsed.products)) parsed.products = [];
      if (!Array.isArray(parsed.partners)) parsed.partners = [];
      if (!Array.isArray(parsed.logs)) parsed.logs = [];
      if (!Array.isArray(parsed.leaders)) parsed.leaders = [];
      if (!Array.isArray(parsed.divisions)) parsed.divisions = defaultDB().divisions;
      return parsed;
    } catch {
      return defaultDB();
    }
  };

  const saveDB = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  const log = (text) => {
    db.logs.unshift({ id: uid(), at: Date.now(), text });
    db.logs = db.logs.slice(0, 200);
    saveDB();
  };

  let db = loadDB();

  // ---------- Theme ----------
  const appRoot = qs(".app");
  const themeBtn = qs("[data-action='theme']");
  const applyTheme = (t) => {
    const theme = t === "light" ? "light" : "dark";
    appRoot.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  };
  const initTheme = () => applyTheme(localStorage.getItem(THEME_KEY) || "dark");

  // ---------- Routing ----------
  const ROUTES = new Set(["dashboard", "divisions", "tasks", "sales", "partners", "documents", "settings"]);
  let route = "dashboard";

  const setActiveRouteUI = (r) => {
    qsa("[data-route]").forEach((b) => b.classList.toggle("is-active", b.dataset.route === r));
    qsa(".view").forEach((v) => v.classList.toggle("is-active", v.dataset.view === r));
    const crumb = qs(".crumb__v");
    if (crumb) {
      const map = {
        dashboard: "Panel",
        divisions: "Bölmələr",
        tasks: "Tapşırıqlar",
        sales: "Sales & Market",
        partners: "Ortaqlar",
        documents: "Sənədlər",
        settings: "Ayarlar",
      };
      crumb.textContent = map[r] || "Panel";
    }
  };

  const setRoute = (r, push = true) => {
    if (!ROUTES.has(r)) r = "dashboard";
    route = r;
    setActiveRouteUI(r);
    if (push) {
      if (location.hash !== "#" + r) location.hash = r;
    }
    renderAll();
  };

  // ---------- Mobile Menu ----------
  const burger = qs(".top__burger");
  const overlay = qs(".mOverlay");
  const overlayPanel = qs(".mOverlay__panel");
  const overlayClose = qs(".mOverlay__close");

  const openOverlay = () => {
    if (!overlay) return;
    overlay.classList.add("is-open");
    setTimeout(() => overlayPanel && overlayPanel.focus(), 0);
  };
  const closeOverlay = () => {
    if (!overlay) return;
    overlay.classList.remove("is-open");
  };

  // ---------- Modal ----------
  const modal = qs(".modal");
  const modalBox = qs(".modal__box");
  const modalTitle = qs(".modal__title");
  const modalClose = qs(".modal__close");
  const modalContent = qs(".modalContent");

  const openModal = (title, node) => {
    modalTitle.textContent = title || "";
    modalContent.innerHTML = "";
    modalContent.appendChild(node);
    modal.classList.add("is-open");
    setTimeout(() => modalBox && modalBox.focus(), 0);
  };
  const closeModal = () => modal.classList.remove("is-open");

  // ---------- Search ----------
  const searchInput = qs("#globalSearch");
  let globalQuery = "";
  const setGlobalQuery = (q) => {
    globalQuery = (q || "").trim().toLowerCase();
    renderAll();
  };

  // ---------- Render helpers ----------
  const byId = (arr, id) => arr.find((x) => x.id === id);
  const divName = (id) => (byId(db.divisions, id)?.name) || "—";

  const matchesQuery = (text) => {
    if (!globalQuery) return true;
    return String(text || "").toLowerCase().includes(globalQuery);
  };

  const tableSetCols = (tableHead, tableRows, cols) => {
    // cols: array of fr values (numbers)
    const tpl = cols.map((n) => `${n}fr`).join(" ");
    if (tableHead) tableHead.style.gridTemplateColumns = tpl;
    tableRows.forEach((r) => (r.style.gridTemplateColumns = tpl));
  };

  // ---------- Dashboard ----------
  const rDashboard = () => {
    const v = qs('[data-view="dashboard"]');
    if (!v) return;

    // counts
    const tAll = db.tasks.length;
    const todo = db.tasks.filter((t) => t.status === "todo").length;
    const doing = db.tasks.filter((t) => t.status === "doing").length;
    const done = db.tasks.filter((t) => t.status === "done").length;

    const statAll = qs("[data-stat='all']");
    const statTodo = qs("[data-stat='todo']");
    const statDoing = qs("[data-stat='doing']");
    const statDone = qs("[data-stat='done']");
    if (statAll) statAll.textContent = tAll;
    if (statTodo) statTodo.textContent = todo;
    if (statDoing) statDoing.textContent = doing;
    if (statDone) statDone.textContent = done;

    // leaders
    const list = qs("#leadersList");
    if (list) {
      list.innerHTML = "";
      db.leaders.forEach((l) => {
        if (!matchesQuery(l.name + " " + l.role)) return;
        const el = document.createElement("div");
        el.className = "kv";
        el.innerHTML = `<div class="kv__k">${escapeHtml(l.name)}</div><div class="kv__v">${escapeHtml(l.role)}</div>`;
        list.appendChild(el);
      });
      if (!list.childElementCount) list.innerHTML = `<div class="hint">Nəticə tapılmadı.</div>`;
    }

    // latest logs
    const logs = qs("#logList");
    if (logs) {
      logs.innerHTML = "";
      db.logs.slice(0, 8).forEach((x) => {
        if (!matchesQuery(x.text)) return;
        const el = document.createElement("div");
        el.className = "item";
        el.innerHTML = `<div class="item__k">${fmtDate(new Date(x.at).toISOString().slice(0,10))}</div>
                        <div class="item__v">${escapeHtml(x.text)}</div>`;
        logs.appendChild(el);
      });
      if (!logs.childElementCount) logs.innerHTML = `<div class="hint">Log yoxdur.</div>`;
    }
  };

  // ---------- Divisions ----------
  const rDivisions = () => {
    const v = qs('[data-view="divisions"]');
    if (!v) return;

    const box = qs("#divisionsGrid");
    if (!box) return;

    box.innerHTML = "";
    db.divisions.forEach((d) => {
      const leaders = (d.leaderIds || [])
        .map((id) => byId(db.leaders, id)?.name)
        .filter(Boolean);

      const card = document.createElement("div");
      card.className = "card";
      const leaderText = leaders.length ? leaders.join(", ") : "—";
      const count = db.tasks.filter((t) => t.divisionId === d.id).length;

      if (!matchesQuery(`${d.name} ${leaderText} ${d.note || ""}`)) return;

      card.innerHTML = `
        <div class="card__head">
          <div>
            <div class="kicker">Bölmə</div>
            <div class="h2">${escapeHtml(d.name)}</div>
            <div class="sub">Tapşırıqlar: <strong>${count}</strong></div>
          </div>
          <div class="badge"><img src="assets/chh_logo.png" alt="CHH" /><span>CHH</span></div>
        </div>
        <div class="divider"></div>
        <div class="kv"><div class="kv__k">Bölmə lideri</div><div class="kv__v">${escapeHtml(leaderText)}</div></div>
        <div class="kv"><div class="kv__k">Qeyd</div><div class="kv__v">${escapeHtml(d.note || "—")}</div></div>
        <div class="btnRow" style="margin-top:10px;">
          <button class="btn btn--sm btn--primary" data-action="edit-division" data-id="${d.id}">Düzəliş</button>
          <button class="btn btn--sm" data-action="open-tasks" data-id="${d.id}">Tapşırıqlara keç</button>
        </div>
      `;
      box.appendChild(card);
    });

    if (!box.childElementCount) box.innerHTML = `<div class="hint">Nəticə tapılmadı.</div>`;
  };

  // ---------- Tasks (Kanban + Table) ----------
  const rTasks = () => {
    const v = qs('[data-view="tasks"]');
    if (!v) return;

    const divFilter = qs("#taskDivisionFilter");
    const addBtn = qs("[data-action='add-task']");
    const expBtn = qs("[data-action='export']");
    const impBtn = qs("#importFile");

    // Fill division filter
    if (divFilter && !divFilter.dataset.filled) {
      divFilter.innerHTML = `<option value="all">Hamısı</option>` + db.divisions
        .map((d) => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join("");
      divFilter.dataset.filled = "1";
    }

    const filterVal = (divFilter && divFilter.value) ? divFilter.value : "all";

    // Kanban columns
    const cols = {
      todo: qs("#colTodo"),
      doing: qs("#colDoing"),
      done: qs("#colDone"),
    };
    Object.values(cols).forEach((c) => c && (c.innerHTML = ""));

    const filtered = db.tasks
      .filter((t) => filterVal === "all" || t.divisionId === filterVal)
      .filter((t) => matchesQuery(`${t.title} ${t.owner} ${divName(t.divisionId)} ${t.priority} ${t.status}`))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    const counts = { todo: 0, doing: 0, done: 0 };
    filtered.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;

      const node = document.createElement("div");
      node.className = "kcard";
      node.innerHTML = `
        <div class="kcard__t">${escapeHtml(t.title)}</div>
        <div class="kcard__m">${escapeHtml(divName(t.divisionId))} • ${escapeHtml(t.owner || "—")} • Prioritet: ${escapeHtml(t.priority || "M")}</div>
        <div class="kcard__f">
          <span>Deadline: ${escapeHtml(fmtDate(t.due)) || "—"}</span>
          <span style="display:flex; gap:8px;">
            <button class="iconBtn" title="Düzəliş" data-action="edit-task" data-id="${t.id}">✎</button>
            <button class="iconBtn" title="Sil" data-action="del-task" data-id="${t.id}">🗑</button>
          </span>
        </div>
      `;
      (cols[t.status] || cols.todo)?.appendChild(node);
    });

    const cTodo = qs("[data-count='todo']");
    const cDoing = qs("[data-count='doing']");
    const cDone = qs("[data-count='done']");
    if (cTodo) cTodo.textContent = counts.todo;
    if (cDoing) cDoing.textContent = counts.doing;
    if (cDone) cDone.textContent = counts.done;

    // Table
    const thead = qs("#tasksHead");
    const tbody = qs("#tasksBody");
    if (tbody) {
      tbody.innerHTML = "";
      filtered.slice(0, 80).forEach((t) => {
        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `
          <div class="cell">${escapeHtml(t.title)}</div>
          <div class="cell cell--muted">${escapeHtml(divName(t.divisionId))}</div>
          <div class="cell cell--muted">${escapeHtml(t.owner || "—")}</div>
          <div class="cell cell--muted">${escapeHtml(fmtDate(t.due) || "—")}</div>
          <div class="cell cell--muted">${escapeHtml(t.priority || "M")}</div>
          <div class="cell cell--muted">${escapeHtml(statusLabel(t.status))}</div>
          <div class="cell">
            <div class="actions">
              <button class="iconBtn" title="Düzəliş" data-action="edit-task" data-id="${t.id}">✎</button>
              <button class="iconBtn" title="Sil" data-action="del-task" data-id="${t.id}">🗑</button>
            </div>
          </div>
        `;
        tbody.appendChild(row);
      });

      const rows = qsa("#tasksBody .row");
      tableSetCols(thead, rows, [2.2, 1.1, 1.1, 0.9, 0.8, 1.0, 1.0]);
      if (!rows.length) tbody.innerHTML = `<div class="hint">Nəticə tapılmadı.</div>`;
    }

    // Events once
    if (divFilter && !divFilter.dataset.bound) {
      divFilter.addEventListener("change", renderAll);
      divFilter.dataset.bound = "1";
    }
    if (addBtn && !addBtn.dataset.bound) {
      addBtn.addEventListener("click", () => openTaskModal());
      addBtn.dataset.bound = "1";
    }
    if (expBtn && !expBtn.dataset.bound) {
      expBtn.addEventListener("click", exportDB);
      expBtn.dataset.bound = "1";
    }
    if (impBtn && !impBtn.dataset.bound) {
      impBtn.addEventListener("change", importDB);
      impBtn.dataset.bound = "1";
    }
  };

  // ---------- Sales (products) ----------
  const rSales = () => {
    const v = qs('[data-view="sales"]');
    if (!v) return;

    const list = qs("#productList");
    const add = qs("[data-action='add-product']");

    if (list) {
      list.innerHTML = "";
      const items = db.products
        .filter((p) => matchesQuery(`${p.title} ${p.type} ${p.note || ""}`))
        .sort((a, b) => String(a.title).localeCompare(String(b.title), "az"));

      items.forEach((p) => {
        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `
          <div class="cell">${escapeHtml(p.title)}</div>
          <div class="cell cell--muted">${escapeHtml(typeLabel(p.type))}</div>
          <div class="cell cell--muted">${escapeHtml(p.note || "—")}</div>
          <div class="cell">
            <div class="actions">
              <button class="iconBtn" title="Düzəliş" data-action="edit-product" data-id="${p.id}">✎</button>
              <button class="iconBtn" title="Sil" data-action="del-product" data-id="${p.id}">🗑</button>
            </div>
          </div>
        `;
        list.appendChild(row);
      });

      const thead = qs("#productHead");
      const rows = qsa("#productList .row");
      tableSetCols(thead, rows, [1.7, 0.9, 1.6, 0.8]);

      if (!rows.length) list.innerHTML = `<div class="hint">Nəticə tapılmadı.</div>`;
    }

    if (add && !add.dataset.bound) {
      add.addEventListener("click", openProductModal);
      add.dataset.bound = "1";
    }
  };

  // ---------- Partners ----------
  const rPartners = () => {
    const v = qs('[data-view="partners"]');
    if (!v) return;

    const list = qs("#partnerList");
    const add = qs("[data-action='add-partner']");

    if (list) {
      list.innerHTML = "";
      const items = db.partners
        .filter((p) => matchesQuery(`${p.name} ${p.note || ""}`))
        .sort((a, b) => String(a.name).localeCompare(String(b.name), "az"));

      items.forEach((p) => {
        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `
          <div class="cell">${escapeHtml(p.name)}</div>
          <div class="cell cell--muted">${escapeHtml(p.note || "—")}</div>
          <div class="cell">
            <div class="actions">
              <button class="iconBtn" title="Düzəliş" data-action="edit-partner" data-id="${p.id}">✎</button>
              <button class="iconBtn" title="Sil" data-action="del-partner" data-id="${p.id}">🗑</button>
            </div>
          </div>
        `;
        list.appendChild(row);
      });

      const thead = qs("#partnerHead");
      const rows = qsa("#partnerList .row");
      tableSetCols(thead, rows, [1.6, 2.0, 0.8]);

      if (!rows.length) list.innerHTML = `<div class="hint">Nəticə tapılmadı.</div>`;
    }

    if (add && !add.dataset.bound) {
      add.addEventListener("click", openPartnerModal);
      add.dataset.bound = "1";
    }
  };

  // ---------- Documents ----------
  const rDocuments = () => {
    const v = qs('[data-view="documents"]');
    if (!v) return;

    const list = qs("#docsList");
    if (!list) return;

    list.innerHTML = "";
    const items = db.logs
      .filter((x) => matchesQuery(x.text))
      .slice(0, 30);

    items.forEach((x) => {
      const el = document.createElement("div");
      el.className = "item";
      el.innerHTML = `
        <div class="item__k">${fmtDate(new Date(x.at).toISOString().slice(0,10))}</div>
        <div class="item__v">${escapeHtml(x.text)}</div>
      `;
      list.appendChild(el);
    });

    if (!list.childElementCount) list.innerHTML = `<div class="hint">Nəticə tapılmadı.</div>`;
  };

  // ---------- Settings ----------
  const rSettings = () => {
    const v = qs('[data-view="settings"]');
    if (!v) return;

    const yearEl = qs("#yearValue");
    if (yearEl) yearEl.textContent = String(db.meta.year || 2026);

    const orgEl = qs("#orgValue");
    if (orgEl) orgEl.textContent = db.meta.org || "Crystal Haze Holding";

    const resetBtn = qs("[data-action='reset']");
    if (resetBtn && !resetBtn.dataset.bound) {
      resetBtn.addEventListener("click", () => {
        if (!confirm("Sistemi sıfırlamaq istəyirsən? (Bütün məlumatlar silinəcək)")) return;
        db = defaultDB();
        saveDB();
        log("Sistem sıfırlandı.");
        renderAll();
      });
      resetBtn.dataset.bound = "1";
    }

    const leaderBtn = qs("[data-action='manage-leaders']");
    if (leaderBtn && !leaderBtn.dataset.bound) {
      leaderBtn.addEventListener("click", openLeadersModal);
      leaderBtn.dataset.bound = "1";
    }
  };

  // ---------- Global Render ----------
  const renderAll = () => {
    // update year labels
    qsa("[data-year]").forEach((n) => (n.textContent = String(db.meta.year || 2026)));

    rDashboard();
    rDivisions();
    rTasks();
    rSales();
    rPartners();
    rDocuments();
    rSettings();
  };

  // ---------- Escape ----------
  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function statusLabel(s) {
    if (s === "todo") return "Gözləyir";
    if (s === "doing") return "İcrada";
    if (s === "done") return "Bitdi";
    return "—";
  }

  function typeLabel(t) {
    if (t === "nəşr") return "Nəşr";
    if (t === "chh") return "CHH";
    if (t === "ortaq") return "Ortaq";
    return "—";
  }

  // ---------- Modals: Task ----------
  function openTaskModal(existingId) {
    const existing = existingId ? byId(db.tasks, existingId) : null;

    const node = document.createElement("div");
    node.className = "form";
    node.innerHTML = `
      <div class="form__grid">
        <div class="field field--full">
          <div class="field__k">Başlıq</div>
          <input class="input" id="t_title" placeholder="Tapşırıq adı" value="${escapeHtml(existing?.title || "")}">
        </div>
        <div class="field">
          <div class="field__k">Bölmə</div>
          <select class="select" id="t_div">
            ${db.divisions.map((d) => `<option value="${d.id}" ${existing?.divisionId===d.id?"selected":""}>${escapeHtml(d.name)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <div class="field__k">Status</div>
          <select class="select" id="t_status">
            <option value="todo" ${existing?.status==="todo"?"selected":""}>Gözləyir</option>
            <option value="doing" ${existing?.status==="doing"?"selected":""}>İcrada</option>
            <option value="done" ${existing?.status==="done"?"selected":""}>Bitdi</option>
          </select>
        </div>
        <div class="field">
          <div class="field__k">Prioritet</div>
          <select class="select" id="t_pr">
            <option value="H" ${existing?.priority==="H"?"selected":""}>H</option>
            <option value="M" ${(!existing || existing?.priority==="M")?"selected":""}>M</option>
            <option value="L" ${existing?.priority==="L"?"selected":""}>L</option>
          </select>
        </div>
        <div class="field">
          <div class="field__k">Deadline</div>
          <input class="input" id="t_due" type="date" value="${escapeHtml(existing?.due || todayISO())}">
        </div>
        <div class="field field--full">
          <div class="field__k">Məsul</div>
          <input class="input" id="t_owner" placeholder="Ad Soyad" value="${escapeHtml(existing?.owner || "")}">
        </div>
      </div>
      <div class="form__actions">
        <button class="btn btn--ghost" type="button" data-action="cancel">Bağla</button>
        <button class="btn btn--primary" type="button" data-action="save">Yadda saxla</button>
      </div>
    `;

    node.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const act = b.dataset.action;
      if (act === "cancel") closeModal();
      if (act === "save") {
        const title = qs("#t_title", node).value.trim();
        const divisionId = qs("#t_div", node).value;
        const status = qs("#t_status", node).value;
        const priority = qs("#t_pr", node).value;
        const due = qs("#t_due", node).value;
        const owner = qs("#t_owner", node).value.trim();

        if (!title) return alert("Başlıq boş ola bilməz.");

        if (existing) {
          existing.title = title;
          existing.divisionId = divisionId;
          existing.status = status;
          existing.priority = priority;
          existing.due = due;
          existing.owner = owner;
          log(`Tapşırıq düzəldildi: ${title}`);
        } else {
          db.tasks.unshift({
            id: uid(),
            title,
            divisionId,
            status,
            priority,
            due,
            owner,
            createdAt: Date.now(),
          });
          log(`Yeni tapşırıq: ${title}`);
        }
        saveDB();
        closeModal();
        renderAll();
      }
    });

    openModal(existing ? "Tapşırığı düzəlt" : "Yeni tapşırıq", node);
  }

  // ---------- Modals: Product ----------
  function openProductModal(existingId) {
    const existing = existingId ? byId(db.products, existingId) : null;

    const node = document.createElement("div");
    node.className = "form";
    node.innerHTML = `
      <div class="form__grid">
        <div class="field field--full">
          <div class="field__k">Məhsul adı</div>
          <input class="input" id="p_title" placeholder="Məhsul adı" value="${escapeHtml(existing?.title || "")}">
        </div>
        <div class="field">
          <div class="field__k">Tip</div>
          <select class="select" id="p_type">
            <option value="nəşr" ${existing?.type==="nəşr"?"selected":""}>Nəşr məhsulu</option>
            <option value="chh" ${existing?.type==="chh"?"selected":""}>CHH markalı</option>
            <option value="ortaq" ${existing?.type==="ortaq"?"selected":""}>Ortaq məhsulu</option>
          </select>
        </div>
        <div class="field field--full">
          <div class="field__k">Qeyd</div>
          <textarea class="textarea" id="p_note" placeholder="Qısa qeyd">${escapeHtml(existing?.note || "")}</textarea>
        </div>
      </div>
      <div class="form__actions">
        <button class="btn btn--ghost" type="button" data-action="cancel">Bağla</button>
        <button class="btn btn--primary" type="button" data-action="save">Yadda saxla</button>
      </div>
    `;

    node.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const act = b.dataset.action;

      if (act === "cancel") closeModal();
      if (act === "save") {
        const title = qs("#p_title", node).value.trim();
        const type = qs("#p_type", node).value;
        const note = qs("#p_note", node).value.trim();

        if (!title) return alert("Məhsul adı boş ola bilməz.");

        if (existing) {
          existing.title = title;
          existing.type = type;
          existing.note = note;
          log(`Məhsul düzəldildi: ${title}`);
        } else {
          db.products.unshift({ id: uid(), title, divisionId: "sales", type, note });
          log(`Yeni məhsul: ${title}`);
        }
        saveDB();
        closeModal();
        renderAll();
      }
    });

    openModal(existing ? "Məhsulu düzəlt" : "Yeni məhsul", node);
  }

  // ---------- Modals: Partner ----------
  function openPartnerModal(existingId) {
    const existing = existingId ? byId(db.partners, existingId) : null;

    const node = document.createElement("div");
    node.className = "form";
    node.innerHTML = `
      <div class="form__grid">
        <div class="field field--full">
          <div class="field__k">Ortaq adı</div>
          <input class="input" id="pa_name" placeholder="Ortaq adı" value="${escapeHtml(existing?.name || "")}">
        </div>
        <div class="field field--full">
          <div class="field__k">Qeyd</div>
          <textarea class="textarea" id="pa_note" placeholder="Qısa qeyd">${escapeHtml(existing?.note || "")}</textarea>
        </div>
      </div>
      <div class="form__actions">
        <button class="btn btn--ghost" type="button" data-action="cancel">Bağla</button>
        <button class="btn btn--primary" type="button" data-action="save">Yadda saxla</button>
      </div>
    `;

    node.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const act = b.dataset.action;

      if (act === "cancel") closeModal();
      if (act === "save") {
        const name = qs("#pa_name", node).value.trim();
        const note = qs("#pa_note", node).value.trim();
        if (!name) return alert("Ortaq adı boş ola bilməz.");

        if (existing) {
          existing.name = name;
          existing.note = note;
          log(`Ortaq düzəldildi: ${name}`);
        } else {
          db.partners.unshift({ id: uid(), name, note });
          log(`Yeni ortaq: ${name}`);
        }
        saveDB();
        closeModal();
        renderAll();
      }
    });

    openModal(existing ? "Ortağı düzəlt" : "Yeni ortaq", node);
  }

  // ---------- Leaders modal ----------
  function openLeadersModal() {
    const node = document.createElement("div");
    node.className = "form";

    const render = () => {
      node.innerHTML = `
        <div class="toolbar">
          <div class="kicker">Liderlər</div>
          <button class="btn btn--sm btn--primary" type="button" data-action="add">+ Lider</button>
        </div>

        <div class="table">
          <div class="table__head" id="leadersHead">
            <div>Ad Soyad</div>
            <div>Vəzifə</div>
            <div style="text-align:right;">Əməliyyat</div>
          </div>
          <div class="table__body" id="leadersBody"></div>
        </div>

        <div class="divider"></div>

        <div class="toolbar">
          <div class="kicker">Bölmə liderləri</div>
        </div>

        <div class="list" id="divisionLeaders"></div>

        <div class="form__actions">
          <button class="btn btn--primary" type="button" data-action="close">Bağla</button>
        </div>
      `;

      const body = qs("#leadersBody", node);
      db.leaders.forEach((l) => {
        if (!matchesQuery(l.name + " " + l.role)) return;
        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `
          <div class="cell">${escapeHtml(l.name)}</div>
          <div class="cell cell--muted">${escapeHtml(l.role)}</div>
          <div class="cell">
            <div class="actions">
              <button class="iconBtn" title="Düzəliş" data-action="edit" data-id="${l.id}">✎</button>
              <button class="iconBtn" title="Sil" data-action="del" data-id="${l.id}">🗑</button>
            </div>
          </div>
        `;
        body.appendChild(row);
      });

      const head = qs("#leadersHead", node);
      const rows = qsa("#leadersBody .row", node);
      tableSetCols(head, rows, [1.4, 1.6, 0.8]);

      const dl = qs("#divisionLeaders", node);
      dl.innerHTML = "";
      db.divisions.forEach((d) => {
        const leaders = (d.leaderIds || []).map((id) => byId(db.leaders, id)?.name).filter(Boolean);
        const item = document.createElement("div");
        item.className = "item";
        item.innerHTML = `
          <div class="item__k">${escapeHtml(d.name)}</div>
          <div class="item__v">
            <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
              <span style="color: var(--muted);">Lider:</span>
              <strong>${escapeHtml(leaders.join(", ") || "—")}</strong>
            </div>
            <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
              <button class="btn btn--sm" data-action="set-leaders" data-id="${d.id}">Lider seç</button>
              <button class="btn btn--sm" data-action="edit-division" data-id="${d.id}">Bölmə qeyd</button>
            </div>
          </div>
        `;
        dl.appendChild(item);
      });
    };

    render();

    node.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const act = b.dataset.action;
      const id = b.dataset.id;

      if (act === "close") return closeModal();

      if (act === "add") return openLeaderEdit(null, () => { render(); renderAll(); });
      if (act === "edit") return openLeaderEdit(id, () => { render(); renderAll(); });

      if (act === "del") {
        const l = byId(db.leaders, id);
        if (!l) return;
        if (!confirm("Lideri silmək istəyirsən?")) return;

        // remove from divisions
        db.divisions.forEach((d) => {
          d.leaderIds = (d.leaderIds || []).filter((x) => x !== id);
        });

        db.leaders = db.leaders.filter((x) => x.id !== id);
        saveDB();
        log(`Lider silindi: ${l.name}`);
        render();
        renderAll();
      }

      if (act === "set-leaders") {
        const d = byId(db.divisions, id);
        if (!d) return;
        openDivisionLeadersPicker(d.id, () => { render(); renderAll(); });
      }

      if (act === "edit-division") {
        const d = byId(db.divisions, id);
        if (!d) return;
        openDivisionNote(d.id, () => { render(); renderAll(); });
      }
    });

    openModal("Lider idarəsi", node);
  }

  function openLeaderEdit(leaderId, onDone) {
    const existing = leaderId ? byId(db.leaders, leaderId) : null;

    const node = document.createElement("div");
    node.className = "form";
    node.innerHTML = `
      <div class="form__grid">
        <div class="field field--full">
          <div class="field__k">Ad Soyad</div>
          <input class="input" id="l_name" placeholder="Ad Soyad" value="${escapeHtml(existing?.name || "")}">
        </div>
        <div class="field field--full">
          <div class="field__k">Vəzifə</div>
          <input class="input" id="l_role" placeholder="Vəzifə" value="${escapeHtml(existing?.role || "")}">
        </div>
      </div>
      <div class="form__actions">
        <button class="btn btn--ghost" type="button" data-action="cancel">Bağla</button>
        <button class="btn btn--primary" type="button" data-action="save">Yadda saxla</button>
      </div>
    `;

    node.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const act = b.dataset.action;

      if (act === "cancel") closeModal();
      if (act === "save") {
        const name = qs("#l_name", node).value.trim();
        const role = qs("#l_role", node).value.trim();
        if (!name || !role) return alert("Ad və vəzifə boş ola bilməz.");

        if (existing) {
          existing.name = name;
          existing.role = role;
          log(`Lider düzəldildi: ${name}`);
        } else {
          db.leaders.unshift({ id: uid(), name, role });
          log(`Yeni lider: ${name}`);
        }
        saveDB();
        closeModal();
        onDone && onDone();
      }
    });

    openModal(existing ? "Lideri düzəlt" : "Yeni lider", node);
  }

  function openDivisionLeadersPicker(divisionId, onDone) {
    const d = byId(db.divisions, divisionId);
    if (!d) return;

    const selected = new Set(d.leaderIds || []);

    const node = document.createElement("div");
    node.className = "form";
    node.innerHTML = `
      <div class="kicker">Bölmə</div>
      <div class="h2" style="margin-top:6px;">${escapeHtml(d.name)}</div>
      <div class="hint">Bir və ya bir neçə lider seç.</div>

      <div class="divider"></div>

      <div class="list list--tight" id="pickList"></div>

      <div class="form__actions">
        <button class="btn btn--ghost" type="button" data-action="cancel">Bağla</button>
        <button class="btn btn--primary" type="button" data-action="save">Yadda saxla</button>
      </div>
    `;

    const list = qs("#pickList", node);
    db.leaders.forEach((l) => {
      const item = document.createElement("div");
      item.className = "kv";
      item.style.cursor = "pointer";
      item.innerHTML = `
        <div class="kv__k">${escapeHtml(l.name)}</div>
        <div class="kv__v">${selected.has(l.id) ? "Seçildi" : "Seç"}</div>
      `;
      item.addEventListener("click", () => {
        if (selected.has(l.id)) selected.delete(l.id);
        else selected.add(l.id);
        item.querySelector(".kv__v").textContent = selected.has(l.id) ? "Seçildi" : "Seç";
      });
      list.appendChild(item);
    });

    node.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const act = b.dataset.action;

      if (act === "cancel") closeModal();
      if (act === "save") {
        d.leaderIds = Array.from(selected);
        saveDB();
        log(`Bölmə liderləri yeniləndi: ${d.name}`);
        closeModal();
        onDone && onDone();
      }
    });

    openModal("Bölmə lider seçimi", node);
  }

  function openDivisionNote(divisionId, onDone) {
    const d = byId(db.divisions, divisionId);
    if (!d) return;

    const node = document.createElement("div");
    node.className = "form";
    node.innerHTML = `
      <div class="kicker">Bölmə</div>
      <div class="h2" style="margin-top:6px;">${escapeHtml(d.name)}</div>
      <div class="divider"></div>

      <div class="field">
        <div class="field__k">Qeyd</div>
        <textarea class="textarea" id="d_note" placeholder="Bölmə üçün daxili qeyd...">${escapeHtml(d.note || "")}</textarea>
      </div>

      <div class="form__actions">
        <button class="btn btn--ghost" type="button" data-action="cancel">Bağla</button>
        <button class="btn btn--primary" type="button" data-action="save">Yadda saxla</button>
      </div>
    `;

    node.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const act = b.dataset.action;

      if (act === "cancel") closeModal();
      if (act === "save") {
        d.note = qs("#d_note", node).value.trim();
        saveDB();
        log(`Bölmə qeydi yeniləndi: ${d.name}`);
        closeModal();
        onDone && onDone();
      }
    });

    openModal("Bölmə qeydi", node);
  }

  // ---------- Actions (delegation) ----------
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    // routing via menu/buttons
    const routeBtn = btn.dataset.route;
    if (routeBtn) {
      setRoute(routeBtn);
      closeOverlay();
      return;
    }

    if (action === "theme") {
      const current = appRoot.getAttribute("data-theme") || "dark";
      applyTheme(current === "dark" ? "light" : "dark");
      return;
    }

    if (action === "edit-division") {
      openDivisionNote(id, renderAll);
      return;
    }

    if (action === "open-tasks") {
      setRoute("tasks");
      const sel = qs("#taskDivisionFilter");
      if (sel) {
        sel.value = id;
        renderAll();
      }
      return;
    }

    if (action === "edit-task") return openTaskModal(id);

    if (action === "del-task") {
      const t = byId(db.tasks, id);
      if (!t) return;
      if (!confirm("Tapşırıq silinsin?")) return;
      db.tasks = db.tasks.filter((x) => x.id !== id);
      saveDB();
      log(`Tapşırıq silindi: ${t.title}`);
      renderAll();
      return;
    }

    if (action === "add-product") return openProductModal();
    if (action === "edit-product") return openProductModal(id);
    if (action === "del-product") {
      const p = byId(db.products, id);
      if (!p) return;
      if (!confirm("Məhsul silinsin?")) return;
      db.products = db.products.filter((x) => x.id !== id);
      saveDB();
      log(`Məhsul silindi: ${p.title}`);
      renderAll();
      return;
    }

    if (action === "add-partner") return openPartnerModal();
    if (action === "edit-partner") return openPartnerModal(id);
    if (action === "del-partner") {
      const p = byId(db.partners, id);
      if (!p) return;
      if (!confirm("Ortaq silinsin?")) return;
      db.partners = db.partners.filter((x) => x.id !== id);
      saveDB();
      log(`Ortaq silindi: ${p.name}`);
      renderAll();
      return;
    }

    if (action === "manage-leaders") return openLeadersModal();
  });

  // ---------- Export / Import ----------
  function exportDB() {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "chh-data.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
    log("Export edildi: chh-data.json");
    renderAll();
  }

  async function importDB(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== "object") throw new Error("Yanlış fayl.");
      if (!parsed.meta || !Array.isArray(parsed.divisions)) throw new Error("Bu CHH data faylı deyil.");

      db = parsed;
      saveDB();
      log("Import edildi.");
      renderAll();
    } catch (err) {
      alert("Import alınmadı: " + (err?.message || "xəta"));
    }
  }

  // ---------- Global bindings ----------
  if (themeBtn) themeBtn.addEventListener("click", () => {
    const current = appRoot.getAttribute("data-theme") || "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  });

  if (burger) burger.addEventListener("click", () => {
    if (overlay.classList.contains("is-open")) closeOverlay();
    else openOverlay();
  });

  if (overlayClose) overlayClose.addEventListener("click", closeOverlay);

  if (overlay) overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeOverlay();
    }
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => setGlobalQuery(searchInput.value));
  }

  window.addEventListener("hashchange", () => {
    const r = (location.hash || "#dashboard").replace("#", "");
    setRoute(r, false);
  });

  // ---------- Init ----------
  initTheme();
  const initial = (location.hash || "#dashboard").replace("#", "");
  setRoute(initial, false);
  renderAll();
})();
