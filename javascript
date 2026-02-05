/* js/app.js — Crystal Haze Holding
   Uyğunluq: verdiyin HTML + CSS
   Funksiyalar: route sistemi, mobil menyu, Crysia AI bot
*/

(function () {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ================= ROUTE SYSTEM ================= */
  const views = qsa(".view");
  const navBtns = qsa(".nav__btn");
  const routeFx = qs(".routeFx");

  const ROUTES = ["home", "academy", "volunteer", "sales", "contact"];

  function setRoute(route) {
    if (!ROUTES.includes(route)) route = "home";

    routeFx.classList.add("on");
    setTimeout(() => routeFx.classList.remove("on"), 220);

    views.forEach(v => {
      v.classList.toggle("is-active", v.dataset.view === route);
    });

    navBtns.forEach(b => {
      const active = b.dataset.route === route;
      b.classList.toggle("is-active", active);
      active ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current");
    });

    qsa("[data-route]").forEach(b => {
      b.classList.toggle("is-active", b.dataset.route === route);
    });

    closeDrawer();
    location.hash = route;
  }

  navBtns.forEach(btn =>
    btn.addEventListener("click", () => setRoute(btn.dataset.route))
  );

  qsa("[data-jump]").forEach(btn =>
    btn.addEventListener("click", () => setRoute(btn.dataset.jump))
  );

  window.addEventListener("hashchange", () => {
    setRoute(location.hash.replace("#", ""));
  });

  setRoute(location.hash.replace("#", "") || "home");

  /* ================= MOBILE DRAWER ================= */
  const drawer = qs(".drawer");
  const drawerPanel = qs(".drawer__panel");
  const burger = qs(".burger");
  const closeBtn = qs(".drawer__close");

  function openDrawer() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("lock");
    document.body.classList.add("lock");
    drawerPanel.focus();
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("lock");
    document.body.classList.remove("lock");
  }

  burger.addEventListener("click", () => {
    drawer.classList.contains("is-open") ? closeDrawer() : openDrawer();
  });

  closeBtn.addEventListener("click", closeDrawer);
  drawer.addEventListener("click", e => {
    if (e.target === drawer) closeDrawer();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeDrawer();
  });

  /* ================= CRYSIA BOT ================= */
  const assistant = qs(".assistant");
  const minBtn = qs(".assistant__min");
  const chat = qs(".assistant__chat");
  const form = qs(".assistant__form");
  const input = qs(".assistant__input");

  minBtn.addEventListener("click", () => {
    assistant.classList.toggle("is-min");
  });

  function addMsg(text, who) {
    const m = document.createElement("div");
    m.className = "msg " + (who === "user" ? "msg--user" : "msg--bot");
    m.textContent = text;
    chat.appendChild(m);
    chat.scrollTop = chat.scrollHeight;
  }

  const KB = {
    about:
      "Crystal Haze Holding gənclərin inkişaf, liderlik və yaradıcılıq imkanlarını bir araya gətirən holding strukturudur.",
    leaders:
      "Ümumi liderlər: Lalə Həsənli — təsisçi və lider. Nicat Umarlı — CEO və lider.",
    academy:
      "Academy: təlimlər, masterclass-lar, kurslar və nəşriyyat məhsulları. Bölmə lideri: Shabnam Abdullazadeh.",
    volunteer:
      "Volunteer: komanda işi, klub fəaliyyəti və sosial layihələr. Bölmə lideri: Nazrin Guliyeva.",
    sales:
      "Sales & Market: satış bacarıqları, nəşr məhsulları, CHH markalı məhsullar və ortaqların məhsulları.",
    contact:
      "Əlaqə: crystalhaze25.26@gmail.com | 055-441-74-23 | Instagram: crystalhaze.holding"
  };

  function normalize(t) {
    return t
      .toLowerCase()
      .replace(/ə/g, "e")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ü/g, "u")
      .replace(/ç/g, "c")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g");
  }

  function reply(text) {
    const t = normalize(text);

    if (t.includes("lider")) return KB.leaders;
    if (t.includes("academy") || t.includes("telim") || t.includes("kurs")) return KB.academy;
    if (t.includes("volunteer") || t.includes("komanda")) return KB.volunteer;
    if (t.includes("sales") || t.includes("satis") || t.includes("mehsul")) return KB.sales;
    if (t.includes("elaqe") || t.includes("telefon") || t.includes("gmail")) return KB.contact;
    if (t.includes("chh") || t.includes("holding") || t.includes("nedir")) return KB.about;

    return "CHH haqqında soruş: liderlər, Academy, Volunteer, Sales & Market və ya Əlaqə.";
  }

  addMsg("Salam! Mən Crysia. Crystal Haze Holding haqqında sual ver.", "bot");

  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, "user");
    input.value = "";
    setTimeout(() => addMsg(reply(text), "bot"), 300);
  });
})();
