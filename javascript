/* app.js — Crystal Haze Holding
   Funksional idarəetmə sistemi (SPA + localStorage)
   PC + Mobile uyğun
*/

(function () {
  /* ================= UTIL ================= */
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

  const store = {
    get(key, def) {
      try {
        return JSON.parse(localStorage.getItem(key)) ?? def;
      } catch {
        return def;
      }
    },
    set(key, val) {
      localStorage.setItem(key, JSON.stringify(val));
    }
  };

  /* ================= STATE ================= */
  const state = {
    route: "panel",
    tasks: store.get("chh_tasks", []),
    products: store.get("chh_products", []),
    partners: store.get("chh_partners", []),
    leaders: store.get("chh_leaders", [
      { id: uid(), ad: "Lalə Həsənli", rol: "Təsisçi, Lider", bolme: "Ümumi" },
      { id: uid(), ad: "Nicat Umarlı", rol: "CEO, Lider", bolme: "Ümumi" },
      { id: uid(), ad: "Shabnam Abdullazadeh", rol: "Lider", bolme: "Academy" },
      { id: uid(), ad: "Nazrin Guliyeva", rol: "Lider", bolme: "Volunteer" }
    ]),
    logs: store.get("chh_logs", [])
  };

  function saveAll() {
    store.set("chh_tasks", state.tasks);
    store.set("chh_products", state.products);
    store.set("chh_partners", state.partners);
    store.set("chh_leaders", state.leaders);
    store.set("chh_logs", state.logs);
  }

  function log(text) {
    state.logs.unshift({
      id: uid(),
      text,
      time: new Date().toLocaleString("az-AZ")
    });
    state.logs = state.logs.slice(0, 50);
    saveAll();
    renderLogs();
  }

  /* ================= ROUTER ================= */
  const views = qsa(".view");
  const navBtns = qsa("[data-route]");
  const pageTitle = qs("#pageTitle");

  function setRoute(r) {
    state.route = r;
    views.forEach(v => v.classList.toggle("is-active", v.dataset.view === r));
    navBtns.forEach(b =>
      b.classList.toggle("is-active", b.dataset.route === r)
    );
    if (pageTitle) pageTitle.textContent = bTitle(r);
    location.hash = r;
  }

  function bTitle(r) {
    return {
      panel: "Panel",
      bolmeler: "Bölmələr",
      tapsiriqlar: "Tapşırıqlar",
      sales: "Sales & Market",
      ortaqlar: "Ortaqlar",
      senedler: "Sənədlər",
      ayarlar: "Ayarlar"
    }[r] || "Panel";
  }

  navBtns.forEach(b =>
    b.addEventListener("click", () => setRoute(b.dataset.route))
  );

  setRoute(location.hash.replace("#", "") || "panel");

  /* ================= LEADERS ================= */
  function renderLeaders() {
    const box = qs("#leadersList");
    if (!box) return;
    box.innerHTML = "";
    state.leaders.forEach(l => {
      const d = document.createElement("div");
      d.className = "kv";
      d.innerHTML = `<div class="kv__k">${l.bolme}</div><div class="kv__v">${l.ad} — ${l.rol}</div>`;
      box.appendChild(d);
    });
  }

  /* ================= TASKS ================= */
  function renderTasks() {
    const cols = {
      todo: qs("#colTodo"),
      doing: qs("#colDoing"),
      done: qs("#colDone")
    };
    Object.values(cols).forEach(c => c && (c.innerHTML = ""));

    state.tasks.forEach(t => {
      const el = document.createElement("div");
      el.className = "cardMini";
      el.innerHTML = `
        <strong>${t.title}</strong>
        <div class="sub">${t.bolme} · ${t.mesul}</div>
      `;
      cols[t.status]?.appendChild(el);
    });

    qsa("[data-count]").forEach(c => {
      const st = c.dataset.count;
      c.textContent = state.tasks.filter(t => t.status === st).length;
    });

    qsa("[data-stat]").forEach(s => {
      const k = s.dataset.stat;
      s.textContent =
        k === "all"
          ? state.tasks.length
          : state.tasks.filter(t => t.status === k).length;
    });
  }

  qs("[data-action='add-task']")?.addEventListener("click", () => {
    const title = prompt("Tapşırıq adı");
    if (!title) return;
    state.tasks.push({
      id: uid(),
      title,
      bolme: "Ümumi",
      mesul: "—",
      status: "todo"
    });
    log(`Yeni tapşırıq: ${title}`);
    saveAll();
    renderTasks();
  });

  /* ================= SALES ================= */
  function renderProducts() {
    const list = qs("#productList");
    if (!list) return;
    list.innerHTML = "";
    state.products.forEach(p => {
      const r = document.createElement("div");
      r.innerHTML = `<div>${p.ad}</div><div>${p.tip}</div><div>${p.qeyd}</div><div>—</div>`;
      list.appendChild(r);
    });
  }

  qs("[data-action='add-product']")?.addEventListener("click", () => {
    const ad = prompt("Məhsul adı");
    if (!ad) return;
    const tip = prompt("Tip (Nəşr / CHH / Ortaq)");
    state.products.push({ id: uid(), ad, tip, qeyd: "" });
    log(`Məhsul əlavə edildi: ${ad}`);
    saveAll();
    renderProducts();
  });

  /* ================= PARTNERS ================= */
  function renderPartners() {
    const list = qs("#partnerList");
    if (!list) return;
    list.innerHTML = "";
    state.partners.forEach(p => {
      const r = document.createElement("div");
      r.innerHTML = `<div>${p.ad}</div><div>${p.qeyd}</div><div>—</div>`;
      list.appendChild(r);
    });
  }

  qs("[data-action='add-partner']")?.addEventListener("click", () => {
    const ad = prompt("Ortaq adı");
    if (!ad) return;
    state.partners.push({ id: uid(), ad, qeyd: "" });
    log(`Ortaq əlavə edildi: ${ad}`);
    saveAll();
    renderPartners();
  });

  /* ================= LOGS ================= */
  function renderLogs() {
    const box = qs("#logList") || qs("#docsList");
    if (!box) return;
    box.innerHTML = "";
    state.logs.forEach(l => {
      const d = document.createElement("div");
      d.className = "kv";
      d.innerHTML = `<div class="kv__k">${l.time}</div><div class="kv__v">${l.text}</div>`;
      box.appendChild(d);
    });
  }

  /* ================= AI ASSISTANT ================= */
  const aiLog = qs("#aiLog");
  const aiForm = qs("#aiForm");
  const aiInput = qs("#aiInput");
  qs(".assistant__min")?.addEventListener("click", () => {
    qs(".assistant").classList.toggle("is-min");
  });

  function aiSay(text, who = "bot") {
    const m = document.createElement("div");
    m.className = "msg msg--" + who;
    m.innerHTML = `<div class="msg__bubble">${text}</div>`;
    aiLog.appendChild(m);
    aiLog.scrollTop = aiLog.scrollHeight;
  }

  function aiReply(q) {
    const t = q.toLowerCase();
    if (t.includes("tapşırıq")) return "Tapşırıqlar bölməsindən yeni tapşırıq əlavə və status idarəsi edə bilərsən.";
    if (t.includes("sales")) return "Sales & Market bölməsi məhsul və satış portfelinin idarəsi üçündür.";
    if (t.includes("lider")) return "Liderlər Panel səhifəsində göstərilir və bölmələr üzrə təyin olunur.";
    return "CHH sistemi üzrə soruş: tapşırıq, sales, liderlər, bölmələr.";
  }

  aiForm?.addEventListener("submit", e => {
    e.preventDefault();
    const v = aiInput.value.trim();
    if (!v) return;
    aiSay(v, "user");
    aiInput.value = "";
    setTimeout(() => aiSay(aiReply(v), "bot"), 300);
  });

  /* ================= INIT ================= */
  renderLeaders();
  renderTasks();
  renderProducts();
  renderPartners();
  renderLogs();
})();
