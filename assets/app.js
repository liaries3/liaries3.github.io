(function () {
  "use strict";

  const doc = document;
  const body = doc.body;
  doc.documentElement.classList.add("js");

  /* reading progress */
  const bar = doc.getElementById("progressBar");
  function updateProgress() {
    if (!bar) return;
    const h = doc.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? (h.scrollTop || body.scrollTop) / max : 0;
    bar.style.width = Math.min(100, Math.max(0, p * 100)) + "%";
  }
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateProgress();
      spy();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateProgress();

  /* mobile nav */
  const menuBtn = doc.getElementById("menuBtn");
  const overlay = doc.getElementById("overlay");
  function closeNav() { body.classList.remove("nav-open"); }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () { body.classList.toggle("nav-open"); });
  }
  if (overlay) overlay.addEventListener("click", closeNav);
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });
  doc.querySelectorAll(".side-link").forEach(function (a) {
    a.addEventListener("click", closeNav);
  });

  /* reveal */
  const reveals = Array.from(doc.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* toc scrollspy */
  const tocLinks = Array.from(doc.querySelectorAll(".toc-nav a"));
  const sections = tocLinks.map(function (a) {
    return doc.getElementById(a.getAttribute("href").slice(1));
  }).filter(Boolean);
  let lastActive = null;
  function spy() {
    if (!sections.length) return;
    const y = (window.scrollY || window.pageYOffset) + 130;
    let current = sections[0];
    for (let i = 0; i < sections.length; i++) {
      const top = sections[i].getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
      if (top <= y) current = sections[i];
    }
    if (current && current.id !== lastActive) {
      lastActive = current.id;
      tocLinks.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current.id);
      });
    }
  }
  spy();

  /* glossary */
  const table = doc.getElementById("glossaryTable");
  if (table && table.tBodies.length) {
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    const search = doc.getElementById("glossarySearch");
    const moduleSel = doc.getElementById("glossaryModule");
    const reset = doc.getElementById("glossaryReset");
    const count = doc.getElementById("glossaryCount");

    const modules = [];
    rows.forEach(function (r) {
      const m = r.getAttribute("data-module") || (r.cells[1] ? r.cells[1].textContent.trim() : "");
      if (m && modules.indexOf(m) === -1) modules.push(m);
    });
    if (moduleSel) {
      modules.forEach(function (m) {
        const o = doc.createElement("option");
        o.value = m;
        o.textContent = m;
        moduleSel.appendChild(o);
      });
    }

    let emptyRow = null;
    function ensureEmpty() {
      if (emptyRow) return emptyRow;
      emptyRow = doc.createElement("tr");
      const td = doc.createElement("td");
      td.colSpan = table.tHead ? table.tHead.rows[0].cells.length : 6;
      td.className = "glossary-empty";
      td.textContent = "没有找到匹配的术语，试试更短的关键词或切换模块。";
      emptyRow.appendChild(td);
      return emptyRow;
    }

    function apply() {
      const q = (search ? search.value : "").trim().toLowerCase();
      const m = moduleSel ? moduleSel.value : "";
      let shown = 0;
      rows.forEach(function (r) {
        const text = r.textContent.toLowerCase();
        const ok = (!q || text.indexOf(q) !== -1) && (!m || r.getAttribute("data-module") === m);
        r.hidden = !ok;
        if (ok) shown++;
      });
      if (shown === 0) tbody.appendChild(ensureEmpty());
      else if (emptyRow && emptyRow.parentNode) emptyRow.parentNode.removeChild(emptyRow);
      if (count) count.textContent = "显示 " + shown + " / 共 " + rows.length + " 条";
    }

    if (search) search.addEventListener("input", apply);
    if (moduleSel) moduleSel.addEventListener("change", apply);
    if (reset) reset.addEventListener("click", function () {
      if (search) search.value = "";
      if (moduleSel) moduleSel.value = "";
      apply();
      if (search) search.focus();
    });
    doc.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (search) search.focus();
      }
    });
    apply();
  }
})();
