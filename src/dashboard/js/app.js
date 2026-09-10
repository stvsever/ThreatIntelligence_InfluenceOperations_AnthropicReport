/* Application controller: wires the graph, panel, views and controls. */
(function () {
  "use strict";
  const IO = window.IO;
  const D = window.IO_DATA;
  const esc = IO.esc;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem("iov:" + k);
        return v == null ? d : JSON.parse(v);
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem("iov:" + k, JSON.stringify(v));
      } catch (e) {
        /* storage unavailable */
      }
    },
  };

  const S = {
    view: "graph",
    layout: store.get("layout", "lr"),
    colorBy: store.get("colorBy", "group"),
    trends: store.get("trends", false),
    pulse: store.get("pulse", !reduced),
    minimap: store.get("minimap", true),
    theme: store.get("theme", "system"),
    textScale: store.get("textScale", 1),
    motion: store.get("motion", !reduced),
    panel: store.get("panel", true),
  };
  const save = (k) => store.set(k, S[k]);
  const qTheme = /[?&]theme=(light|dark)/.exec(location.search);
  if (qTheme) S.theme = qTheme[1];

  IO.hydrateIcons();
  const tree = IO.buildTree(D);

  /* ---------------------------------------------------------------- */
  /* Theme                                                             */
  /* ---------------------------------------------------------------- */

  const darkMq = matchMedia("(prefers-color-scheme: dark)");
  function resolvedTheme() {
    return S.theme === "system" ? (darkMq.matches ? "dark" : "light") : S.theme;
  }
  function applyTheme() {
    const t = resolvedTheme();
    document.documentElement.dataset.theme = t;
    $("#theme-toggle").innerHTML = IO.icon(t === "dark" ? "sun" : "moon");
    $('meta[name="theme-color"]').setAttribute("content", t === "dark" ? "#141416" : "#F7F6F2");
    syncSeg("theme", S.theme);
  }
  darkMq.addEventListener("change", () => S.theme === "system" && applyTheme());

  /* ---------------------------------------------------------------- */
  /* Graph                                                             */
  /* ---------------------------------------------------------------- */

  const tip = $("#tooltip");
  const graph = new IO.Graph($("#canvas"), tree, {
    minimapHost: $("#minimap"),
    /* Keep fitted content clear of the crumbs, legend and minimap overlays */
    padding(w, h) {
      const overlays = h > 520 && innerWidth > 860;
      return { t: 52, r: 36, b: overlays ? 150 : 40, l: 36 };
    },
    onSelect(n) {
      renderPanel(n);
      renderCrumbs(n);
      writeHash(false);
      syncDepth();
      dismissHint();
    },
    onHover: showNodeTip,
    onTransform(t) {
      $("#zoom-level").textContent = Math.round(t.k * 100) + "%";
    },
    onLayout: syncDepth,
  });
  graph.layout = S.layout;
  graph.textScale = S.textScale;
  graph.motion = S.motion;
  graph.pulse = S.pulse;
  graph.trendLinks = S.trends;
  graph.setColorBy(S.colorBy);
  $("#stage").classList.toggle("color-breakout", S.colorBy === "breakout");
  $("#minimap").hidden = !S.minimap;

  function renderPanel(n) {
    const el = $("#panel-content");
    el.innerHTML = IO.renderPanel(n);
    $("#panel").scrollTop = 0;
    $("#panel-kind").textContent = n.kind === "case" ? n.code : IO.kindLabel(n);
  }

  function renderCrumbs(n) {
    const chain = graph.chain(n);
    $("#crumbs").innerHTML = chain
      .map((p, i) => {
        const cur = i === chain.length - 1 ? ' aria-current="true"' : "";
        const label = p.kind === "case" ? `<span class="code">${esc(p.code)}</span>` : esc(IO.truncate(p.label, 28));
        const sw = p.kind === "group" ? `<span class="swatch" data-g="${p.group}"></span>` : "";
        return `<button data-go="${esc(p.id)}"${cur}>${sw}${label}</button>`;
      })
      .join('<span class="sep" aria-hidden="true">/</span>');
  }

  /* ---------------------------------------------------------------- */
  /* Tooltips                                                          */
  /* ---------------------------------------------------------------- */

  function showNodeTip(n, e) {
    if (!n) {
      tip.hidden = true;
      return;
    }
    const kind = n.kind === "case" ? `${n.code} · case study` : IO.kindLabel(n);
    const text = n.text || n.desc || "";
    const hint = n.children.length
      ? n.expanded
        ? "Click to select. Click again to collapse."
        : `Click to open ${n.children.length} item${n.children.length === 1 ? "" : "s"}. Shift-click for the whole branch.`
      : "Click for details.";
    tip.innerHTML = `<p class="tt-kind">${esc(kind)}</p><p class="tt-title">${esc(n.label)}</p>${
      text ? `<p class="tt-text">${esc(IO.truncate(text, 180))}</p>` : ""
    }<p class="tt-hint">${hint}</p>`;
    tip.hidden = false;
    placeTip(e);
  }
  function placeTip(e) {
    if (!e || tip.hidden) return;
    const pad = 16;
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    let x = e.clientX + pad;
    let y = e.clientY + pad;
    if (x + w > innerWidth - 8) x = e.clientX - w - pad;
    if (y + h > innerHeight - 8) y = e.clientY - h - pad;
    tip.style.transform = `translate(${Math.max(8, x)}px, ${Math.max(8, y)}px)`;
  }
  $("#canvas").addEventListener("pointermove", placeTip);

  const btip = $("#btn-tip");
  let btTimer = 0;
  document.addEventListener("pointerover", (e) => {
    const t = e.target.closest && e.target.closest("[data-tip]");
    clearTimeout(btTimer);
    if (!t) {
      btip.hidden = true;
      return;
    }
    btTimer = setTimeout(() => {
      btip.textContent = t.dataset.tip;
      btip.hidden = false;
      const r = t.getBoundingClientRect();
      const w = btip.offsetWidth;
      const x = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2));
      const below = r.bottom + 8 + btip.offsetHeight < innerHeight;
      btip.style.transform = `translate(${x}px, ${below ? r.bottom + 8 : r.top - btip.offsetHeight - 8}px)`;
    }, 380);
  });
  document.addEventListener("pointerdown", () => {
    clearTimeout(btTimer);
    btip.hidden = true;
  });

  let toastTimer = 0;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.hidden = true), 2200);
  }

  /* ---------------------------------------------------------------- */
  /* Controls                                                          */
  /* ---------------------------------------------------------------- */

  function syncSeg(name, val) {
    $$(`[data-seg="${name}"] [data-val]`).forEach((b) => b.setAttribute("aria-pressed", String(String(b.dataset.val) === String(val))));
  }
  function syncToggles() {
    $('[data-cmd="trends"]').setAttribute("aria-pressed", String(S.trends));
    $('[data-cmd="pulse"]').setAttribute("aria-pressed", String(S.pulse));
    $('[data-cmd="minimap"]').setAttribute("aria-pressed", String(S.minimap));
  }
  function syncDepth() {
    let level = null;
    for (let L = 1; L <= 4; L++) {
      if (tree.all.every((n) => !n.children.length || n.expanded === n.level < L)) level = L;
    }
    syncSeg("depth", level);
  }
  function applyPanel() {
    $("#stage").classList.toggle("panel-closed", !S.panel);
    $('[data-cmd="panel"]').setAttribute("aria-pressed", String(S.panel));
  }

  function closePops(except) {
    $$(".popover").forEach((p) => {
      if (p !== except) p.hidden = true;
    });
  }
  function togglePop(p) {
    closePops(p);
    p.hidden = !p.hidden;
  }

  function renderLegend() {
    const glyphs = `<div class="lg-glyphs">
      <span><svg width="14" height="14" viewBox="-7 -7 14 14"><circle r="6" class="lg-ring"/><circle r="3.6" class="lg-fill"/></svg>Closed branch</span>
      <span><svg width="14" height="14" viewBox="-7 -7 14 14"><circle r="4" class="lg-open"/></svg>Open branch</span>
      <span><svg width="14" height="14" viewBox="-7 -7 14 14"><circle r="2.6" class="lg-fill"/></svg>Detail</span></div>`;
    const L = $("#legend");
    if (S.colorBy === "group") {
      const items = D.groups.map((g) => [g.id, g.label]).concat([["context", "Section overview"]]);
      L.innerHTML = `<p class="lg-title">Actor type</p><ul>${items
        .map(([g, l]) => `<li><span class="swatch" data-g="${g}"></span>${esc(l)}</li>`)
        .join("")}</ul>${glyphs}`;
    } else {
      L.innerHTML = `<p class="lg-title">Reach, Breakout Scale</p><div class="lg-ramp">${[1, 2, 3, 4, 5, 6]
        .map((i) => `<span class="lg-step" data-bo="${i}"><i></i>${i}</span>`)
        .join("")}<span class="lg-step" data-bo="na"><i></i>n/a</span></div><p class="lg-note">Only cases 1 to 4 occur in the report.</p>${glyphs}`;
    }
  }

  function download(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1500);
  }

  function toggleFullscreen() {
    const el = $("#view-graph");
    if (!document.fullscreenElement) {
      const p = el.requestFullscreen ? el.requestFullscreen() : Promise.reject(new Error("unsupported"));
      p.catch(() => toast("Full screen is not available in this browser"));
    } else document.exitFullscreen();
  }

  function cmd(name, val) {
    switch (name) {
      case "layout":
        S.layout = val;
        save("layout");
        graph.setLayout(val);
        syncSeg("layout", val);
        writeHash(false);
        break;
      case "depth":
        graph.expandToLevel(Number(val));
        syncDepth();
        break;
      case "color":
        S.colorBy = val;
        save("colorBy");
        graph.setColorBy(val);
        $("#stage").classList.toggle("color-breakout", val === "breakout");
        syncSeg("color", val);
        renderLegend();
        break;
      case "trends":
        S.trends = !S.trends;
        save("trends");
        graph.setTrendLinks(S.trends);
        syncToggles();
        if (S.trends && !tree.byId.get("overview/trends").expanded) toast("Open “Cross-case trends” in the overview branch to see the links");
        break;
      case "pulse":
        S.pulse = !S.pulse;
        save("pulse");
        graph.setPulse(S.pulse);
        syncToggles();
        break;
      case "minimap":
        S.minimap = !S.minimap;
        save("minimap");
        $("#minimap").hidden = !S.minimap;
        if (S.minimap) graph.drawMinimap();
        syncToggles();
        break;
      case "expand-all":
        graph.expandAll();
        syncDepth();
        break;
      case "collapse-all":
        graph.collapseAll();
        syncDepth();
        break;
      case "zoom-in":
        graph.zoomBy(1.35);
        break;
      case "zoom-out":
        graph.zoomBy(1 / 1.35);
        break;
      case "fit":
        graph.fit();
        break;
      case "reset":
        graph.resetPositions();
        break;
      case "fullscreen":
        toggleFullscreen();
        break;
      case "panel":
        S.panel = !S.panel;
        save("panel");
        applyPanel();
        break;
      case "export-menu":
        togglePop($("#export-menu"));
        break;
      case "settings":
        togglePop($("#settings"));
        break;
      case "help":
        toggleHelp();
        break;
      case "export-svg": {
        closePops();
        const { svg } = graph.exportSVG();
        download(new Blob([svg], { type: "image/svg+xml" }), `influence-operations-map-${S.layout}.svg`);
        toast("SVG downloaded");
        break;
      }
      case "export-png":
        closePops();
        graph
          .exportPNG(2)
          .then((b) => {
            download(b, `influence-operations-map-${S.layout}.png`);
            toast("PNG downloaded");
          })
          .catch(() => toast("PNG export failed in this browser"));
        break;
      case "theme":
        S.theme = val;
        save("theme");
        applyTheme();
        break;
      case "theme-toggle":
        S.theme = resolvedTheme() === "dark" ? "light" : "dark";
        save("theme");
        applyTheme();
        break;
      case "text":
        S.textScale = Number(val);
        save("textScale");
        graph.setTextScale(S.textScale);
        syncSeg("text", val);
        break;
      case "motion":
        S.motion = val === "on";
        save("motion");
        graph.motion = S.motion;
        document.documentElement.classList.toggle("no-motion", !S.motion);
        syncSeg("motion", val);
        break;
      default:
        break;
    }
  }

  function act(name) {
    const n = graph.selected;
    if (name === "expand" && n) graph.setSubtree(n, true);
    else if (name === "collapse" && n) graph.setSubtree(n, false);
    else if (name === "copy-link") {
      const url = location.href;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject(new Error("no clipboard")))
        .then(() => toast("Link to this view copied"))
        .catch(() => toast(url));
    } else if (name === "reveal-matches") {
      graph.revealMany(lastHits);
      $("#search-results").hidden = true;
    } else if (name === "clear-search") {
      $("#search").value = "";
      runSearch("");
    }
  }

  function go(id) {
    const n = tree.byId.get(id);
    if (!n) return;
    $("#search-results").hidden = true;
    if (IO.lightbox.isOpen()) IO.lightbox.close();
    if (S.view !== "graph") setView("graph", true);
    graph.select(n, { focus: true, expand: n.kind !== "item" });
  }

  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-cmd]");
    if (c) {
      cmd(c.dataset.cmd, c.dataset.val);
      return;
    }
    const g = e.target.closest("[data-go]");
    if (g) {
      e.preventDefault();
      go(g.dataset.go);
      return;
    }
    const f = e.target.closest("[data-fig]");
    if (f) {
      IO.lightbox.open(Number(f.dataset.fig));
      return;
    }
    const a = e.target.closest("[data-act]");
    if (a) {
      act(a.dataset.act);
      return;
    }
    const v = e.target.closest("[data-view]");
    if (v) {
      e.preventDefault();
      setView(v.dataset.view, true);
      return;
    }
    if (!e.target.closest(".pop-wrap")) closePops();
    if (!e.target.closest(".search")) $("#search-results").hidden = true;
  });

  /* ---------------------------------------------------------------- */
  /* Search                                                            */
  /* ---------------------------------------------------------------- */

  const KIND_ORDER = { case: 0, group: 1, facet: 2, item: 3, root: 4 };
  let lastHits = [];
  let active = -1;

  function highlight(text, terms) {
    let out = esc(text);
    terms.forEach((t) => {
      const re = new RegExp(`(${esc(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }

  function runSearch(raw) {
    const q = raw.trim().toLowerCase();
    const box = $("#search-results");
    $("#search-clear").hidden = !q;
    if (!q) {
      graph.setSearch(null);
      box.hidden = true;
      lastHits = [];
      return;
    }
    const terms = q.split(/\s+/).filter(Boolean);
    const hits = tree.all.filter((n) => n !== tree.root && terms.every((t) => n.search.includes(t)));
    hits.sort((a, b) => {
      const la = terms.every((t) => a.label.toLowerCase().includes(t)) ? 0 : 1;
      const lb = terms.every((t) => b.label.toLowerCase().includes(t)) ? 0 : 1;
      return la - lb || KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
    });
    lastHits = hits;
    graph.setSearch(new Set(hits.map((n) => n.id)));
    active = -1;
    if (!hits.length) {
      box.innerHTML = `<li class="sr-empty">No matches for “${esc(raw.trim())}”</li>`;
      box.hidden = false;
      return;
    }
    box.innerHTML =
      hits
        .slice(0, 14)
        .map((n) => {
          const owner = n.caseNode && n.caseNode !== n ? n.caseNode.code : "";
          const where = [owner, n.parent && n.parent !== tree.root && n.parent !== n.caseNode ? n.parent.label : ""].filter(Boolean).join(" / ");
          return `<li><button data-go="${esc(n.id)}" role="option"><span class="swatch" data-g="${n.group}"></span><span class="sr-main"><span class="sr-label">${
            n.code ? `<span class="code">${esc(n.code)}</span> ` : ""
          }${highlight(n.label, terms)}</span>${where ? `<span class="sr-path">${esc(where)}</span>` : ""}</span><span class="sr-kind">${esc(IO.kindLabel(n))}</span></button></li>`;
        })
        .join("") +
      `<li class="sr-foot"><span>${hits.length} match${hits.length === 1 ? "" : "es"}</span><button class="link-btn" data-act="reveal-matches">Reveal all in map</button></li>`;
    box.hidden = false;
  }

  const input = $("#search");
  input.addEventListener("input", () => runSearch(input.value));
  input.addEventListener("focus", () => input.value && runSearch(input.value));
  input.addEventListener("keydown", (e) => {
    const items = $$("#search-results button[data-go]");
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!items.length) return;
      active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items.forEach((b, i) => b.classList.toggle("active", i === active));
      items[active].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const b = items[Math.max(0, active)];
      if (b) {
        b.click();
        input.blur();
      }
    }
  });

  /* ---------------------------------------------------------------- */
  /* Views and routing                                                 */
  /* ---------------------------------------------------------------- */

  let graphFitted = false;
  function setView(v, push) {
    S.view = v;
    $$(".view").forEach((s) => (s.hidden = s.id !== `view-${v}`));
    $$(".tabs [data-view]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.view === v)));
    if (v === "graph" && !graphFitted) {
      graphFitted = true;
      requestAnimationFrame(() => graph.fit(false));
    }
    if (v !== "graph") tip.hidden = true;
    writeHash(push);
  }

  function writeHash(push) {
    let h = `#/${S.view}`;
    if (S.view === "graph") {
      if (graph.selected && graph.selected !== tree.root) h += `/${encodeURIComponent(graph.selected.id)}`;
      if (S.layout !== "lr") h += `?layout=${S.layout}`;
    }
    if (location.hash !== h) history[push ? "pushState" : "replaceState"](null, "", h);
  }

  function readHash() {
    const m = location.hash.match(/^#\/(graph|cases|figures|about)(?:\/([^?]*))?(?:\?(.*))?$/);
    if (!m) return { view: "graph" };
    const params = new URLSearchParams(m[3] || "");
    return { view: m[1], id: m[2] ? decodeURIComponent(m[2]) : null, layout: params.get("layout") };
  }

  function applyHash() {
    const h = readHash();
    if (h.layout && ["lr", "td", "radial"].includes(h.layout) && h.layout !== S.layout) cmd("layout", h.layout);
    setView(h.view, false);
    if (h.view === "graph" && h.id && tree.byId.has(h.id)) graph.select(tree.byId.get(h.id), { focus: true, expand: true });
    if (h.view === "figures" && h.id && /^\d+$/.test(h.id)) IO.lightbox.open(Number(h.id));
  }
  window.addEventListener("popstate", applyHash);

  /* ---------------------------------------------------------------- */
  /* Keyboard                                                          */
  /* ---------------------------------------------------------------- */

  function toggleHelp() {
    const h = $("#help");
    h.hidden = !h.hidden;
    if (!h.hidden) h.querySelector("button").focus();
  }

  document.addEventListener("keydown", (e) => {
    if (IO.lightbox.isOpen()) return;
    const typing = /^(input|textarea|select)$/i.test(e.target.tagName);
    if (e.key === "Escape") {
      if (!$("#help").hidden) {
        $("#help").hidden = true;
        return;
      }
      closePops();
      $("#search-results").hidden = true;
      if (typing && e.target.id === "search") {
        e.target.value = "";
        runSearch("");
        e.target.blur();
      }
      return;
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === "/") {
      e.preventDefault();
      input.focus();
      return;
    }
    if (k === "?") {
      toggleHelp();
      return;
    }
    if (k === "t" || k === "T") {
      cmd("theme-toggle");
      return;
    }
    if (S.view !== "graph") return;
    const map = {
      1: ["layout", "lr"],
      2: ["layout", "td"],
      3: ["layout", "radial"],
      f: ["fit"],
      "+": ["zoom-in"],
      "=": ["zoom-in"],
      "-": ["zoom-out"],
      e: ["expand-all"],
      c: ["collapse-all"],
      r: ["reset"],
      l: ["trends"],
      p: ["pulse"],
      m: ["minimap"],
      d: ["panel"],
      b: ["color", S.colorBy === "group" ? "breakout" : "group"],
    };
    const m = map[k] || map[k.toLowerCase()];
    if (m) {
      e.preventDefault();
      cmd(m[0], m[1]);
    }
  });

  /* ---------------------------------------------------------------- */
  /* First-run hint                                                    */
  /* ---------------------------------------------------------------- */

  function dismissHint() {
    const h = $("#hint");
    if (h.hidden || !graphReady) return;
    h.classList.add("gone");
    setTimeout(() => (h.hidden = true), 400);
    store.set("hintSeen", true);
  }
  $("#hint-close").addEventListener("click", dismissHint);

  /* ---------------------------------------------------------------- */
  /* Boot                                                              */
  /* ---------------------------------------------------------------- */

  let graphReady = false;
  applyTheme();
  document.documentElement.classList.toggle("no-motion", !S.motion);
  syncSeg("layout", S.layout);
  syncSeg("color", S.colorBy);
  syncSeg("text", S.textScale);
  syncSeg("motion", S.motion ? "on" : "off");
  syncToggles();
  applyPanel();
  renderLegend();
  IO.renderCasesView($("#view-cases"));
  IO.renderFiguresView($("#view-figures"));
  IO.renderAboutView($("#view-about"));

  const startHash = location.hash;
  graph.update({ animate: false });
  graph.select(tree.root);
  $("#hint").hidden = store.get("hintSeen", false) || /[?&]nohint\b/.test(location.search);
  if (startHash) history.replaceState(null, "", startHash);
  applyHash();
  if (S.view === "graph") {
    graphFitted = true;
    graph.fit(false);
  }
  graphReady = true;

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      graph.remeasure();
      if (S.view === "graph" && (!graph.selected || graph.selected === tree.root)) graph.fit(false);
    });
  }

  IO.app = { graph, tree, go, cmd };
})();
