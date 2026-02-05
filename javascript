/* js/app.js — CHH NEW SYSTEM (route + drawer + Crysia bot)
   Uyğun HTML class-lar:
   .view[data-view], .nav__btn[data-route], .drawer__item[data-route], .burger, .drawer, .drawer__close, .routeFx
   Assistant:
   .assistant, .assistant__min, .assistant__chat, .assistant__form, .assistant__input
*/

(function () {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* =========================
     ROUTE / NAV
  ========================== */
  const ROUTES = ["home", "academy", "volunteer", "sales", "staff", "contact"];

  const routeFx = qs(".routeFx");
  const views = qsa(".view");
  const navBtns = qsa(".nav__btn");
  const drawerItems = qsa(".drawer__item");

  function setActiveRoute(route) {
    if (!ROUTES.includes(route)) route = "home";

    if (routeFx) {
      routeFx.classList.add("on");
      window.setTimeout(() => routeFx.classList.remove("on"), 220);
    }

    views.forEach(v => v.classList.toggle("is-active", v.dataset.view === route));

    navBtns.forEach(b => {
      const on = b.dataset.route === route;
      b.classList.toggle("is-active", on);
      if (on) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });

    drawerItems.forEach(b => b.classList.toggle("is-active", b.dataset.route === route));

    closeDrawer();

    const nextHash = "#" + route;
    if (location.hash !== nextHash) location.hash = nextHash;
  }

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => setActiveRoute(btn.dataset.route));
  });

  drawerItems.forEach(btn => {
    btn.addEventListener("click", () => setActiveRoute(btn.dataset.route));
  });

  qsa("[data-jump]").forEach(btn => {
    btn.addEventListener("click", () => setActiveRoute(btn.dataset.jump));
  });

  window.addEventListener("hashchange", () => {
    const r = (location.hash || "#home").replace("#", "");
    setActiveRoute(r);
  });

  const initial = (location.hash || "#home").replace("#", "");
  setActiveRoute(initial);

  /* =========================
     MOBILE DRAWER
  ========================== */
  const drawer = qs(".drawer");
  const drawerPanel = qs(".drawer__panel");
  const burger = qs(".burger");
  const closeBtn = qs(".drawer__close");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (burger) burger.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("lock");
    document.body.classList.add("lock");
    window.setTimeout(() => drawerPanel && drawerPanel.focus(), 0);
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (burger) burger.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("lock");
    document.body.classList.remove("lock");
  }

  if (burger) {
    burger.addEventListener("click", () => {
      if (drawer && drawer.classList.contains("is-open")) closeDrawer();
      else openDrawer();
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

  if (drawer) {
    drawer.addEventListener("click", (e) => {
      if (e.target === drawer) closeDrawer();
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  /* =========================
     CRYSIA BOT
  ========================== */
  const assistant = qs(".assistant");
  const minBtn = qs(".assistant__min");
  const chat = qs(".assistant__chat");
  const form = qs(".assistant__form");
  const input = qs(".assistant__input");

  if (assistant && minBtn) {
    minBtn.addEventListener("click", () => assistant.classList.toggle("is-min"));
  }

  function addMsg(text, who) {
    if (!chat) return;
    const el = document.createElement("div");
    el.className = "msg " + (who === "user" ? "msg--user" : "msg--bot");
    el.textContent = text;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
  }

  // Staff cədvəlinə əsasən (özündən vəzifə əlavə olunmur)
  const STAFF = [
    { name: "Lalə Həsənli", role: "Founder" },
    { name: "Nicat Umarlı", role: "CEO" },
    { name: "Nazrin Guliyeva", role: "Volunteer Leader" },
    { name: "Shabnam Abdullazadeh", role: "Academy Leader" },
    { name: "Alovsat Alakbarzadeh", role: "Marketing Director" },
    { name: "Alsu Ganbarova", role: "Marketing Assistant" },
    { name: "Fatali Mirzayev", role: "Finance Manager" },
    { name: "Vagif Verdiyev", role: "Project Manager" },
    { name: "Mürsəl Sadiqli", role: "Programist" },
    { name: "Leyla Abbasova", role: "HR Manager" },
    { name: "Shahniyar Mustafayev", role: "HR Manager" },
    { name: "Ali Baxshizadeh", role: "Venue Coordinator" },
    { name: "Munavvar Yusifova", role: "Head of SMM" },
    { name: "Simara Aliyeva", role: "SMM" },
    { name: "Kenan Qasimzadeh", role: "SMM" }
  ];

  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .trim()
      .replace(/[ə]/g, "e")
      .replace(/[ı]/g, "i")
      .replace(/[ö]/g, "o")
      .replace(/[ü]/g, "u")
      .replace(/[ç]/g, "c")
      .replace(/[ş]/g, "s")
      .replace(/[ğ]/g, "g");
  }

  function listLeaders() {
    const leaders = STAFF.filter(x =>
      ["Founder", "CEO", "Volunteer Leader", "Academy Leader", "Marketing Director"].includes(x.role)
    );
    return leaders.map(x => `${x.name} — ${x.role}`).join("\n");
  }

  function findPerson(query) {
    const q = normalize(query);
    if (!q) return null;

    // adla axtarış (hissə uyğun)
    let best = null;
    let bestScore = 0;

    for (const p of STAFF) {
      const n = normalize(p.name);
      // sadə score: neçə söz uyğun gəlir
      const words = q.split(/\s+/).filter(Boolean);
      let score = 0;
      for (const w of words) {
        if (w.length >= 2 && n.includes(w)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }
    return bestScore > 0 ? best : null;
  }

  function replyTo(text) {
    const t = normalize(text);

    // Route əmrləri (istəyə görə)
    if (t === "esas" || t === "home") return "Əsas səhifədəsən. Bölmələr: Academy, Volunteer, Sales & Market.";
    if (t.includes("academy")) return "Academy bölməsi: təlimlər, masterclass-lar, kurslar və nəşriyyat məhsulları.";
    if (t.includes("volunteer")) return "Volunteer bölməsi: komanda işi, klub fəaliyyəti və sosial fəaliyyətlər.";
    if (t.includes("sales") || t.includes("market") || t.includes("satis")) {
      return "Sales & Market: satış və marketinq; nəşr məhsulları, CHH markalı məhsullar, ortaqların məhsulları.";
    }
    if (t.includes("elaqe") || t.includes("kontakt") || t.includes("telefon") || t.includes("gmail")) {
      return "Əlaqə: crystalhaze25.26@gmail.com | 055-441-74-23 | Instagram: crystalhaze.holding";
    }

    if (t.includes("lider") || t.includes("rehber") || t.includes("rəhbər")) {
      return "Liderlər:\n" + listLeaders();
    }

    if (t.includes("staff") || t.includes("komanda") || t.includes("heyet") || t.includes("heyət")) {
      return "Staff siyahısı:\n" + STAFF.map(x => `${x.name} — ${x.role}`).join("\n");
    }

    // Şəxs axtarışı
    const person = findPerson(text);
    if (person) return `${person.name} — ${person.role}`;

    // Default cavab
    return "Sual verə bilərsən: liderlər, bölmələr (Academy / Volunteer / Sales & Market), staff və ya əlaqə.";
  }

  function botIntro() {
    addMsg("Salam! Mən Crysia. CHH haqqında sual ver: liderlər, bölmələr, staff, əlaqə.", "bot");
  }

  if (form && input) {
    botIntro();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = (input.value || "").trim();
      if (!v) return;

      addMsg(v, "user");
      input.value = "";

      // Kiçik gecikmə (təbii effekt)
      window.setTimeout(() => {
        addMsg(replyTo(v), "bot");
      }, 220);
    });
  }
})();
