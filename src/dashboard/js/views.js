/* Secondary views: case index, figure gallery, method and sources, lightbox. */
(function () {
  "use strict";
  const IO = window.IO;
  const D = window.IO_DATA;
  const esc = IO.esc;
  const GROUP = Object.fromEntries(D.groups.map((g) => [g.id, g]));
  const ORDER = D.groups.flatMap((g) => D.cases.filter((c) => c.group === g.id));
  const swatch = (g) => `<span class="swatch" data-g="${g}"></span>`;
  const figSrc = (n) => `assets/figures/fig-${String(n).padStart(2, "0")}.jpg`;
  const refused = (c) => c.safeguards.some((s) => s.kind === "refusal");
  const caseOf = (id) => D.cases.find((c) => c.id === id);

  /* ------------------------------------------------------------------ */
  /* Case index                                                          */
  /* ------------------------------------------------------------------ */

  IO.renderCasesView = function (root) {
    const cols = D.breakout.map((b) => ({ k: b.n, t: b.t })).concat([{ k: null, t: "Not rated" }]);
    const scale = cols
      .map((col) => {
        const cs = ORDER.filter((c) => c.breakout.n === col.k);
        return `<div class="scale-col" data-bo="${col.k == null ? "na" : col.k}">
          <div class="scale-head"><span class="scale-n">${col.k == null ? "n/a" : col.k}</span><span class="scale-t">${esc(col.t)}</span></div>
          <div class="scale-body">${
            cs.length
              ? cs.map((c) => `<button class="scale-chip" data-go="${c.id}">${swatch(c.group)}<span class="code">${c.id}</span><span class="sc-t">${esc(c.short)}</span></button>`).join("")
              : `<span class="scale-empty">No cases</span>`
          }</div></div>`;
      })
      .join("");

    const groupHead = D.groups
      .map((g) => `<th colspan="${ORDER.filter((c) => c.group === g.id).length}" class="mx-group">${swatch(g.id)}${esc(g.short)}</th>`)
      .join("");
    const caseHead = ORDER.map(
      (c) => `<th class="mx-case" title="${esc(c.id)}: ${esc(c.short)}"><button data-go="${c.id}"><span class="code">${c.id.slice(4)}</span><span class="mx-iso">${esc(c.iso === "EX" ? "Exile" : c.iso)}</span></button></th>`
    ).join("");
    const mxRows = D.trends
      .map(
        (t) => `<tr><th scope="row"><button data-go="trend/${t.id}">${esc(t.t)}</button></th>${ORDER.map(
          (c) => `<td>${t.cases.includes(c.id) ? `<span class="mx-dot" data-g="${c.group}" title="${esc(c.id)}: ${esc(t.t)}"></span>` : ""}</td>`
        ).join("")}<td class="mx-n">${t.cases.length}</td></tr>`
      )
      .join("");
    const mxFoot = `<tr class="mx-total"><th scope="row">Trends per case</th>${ORDER.map(
      (c) => `<td>${D.trends.filter((t) => t.cases.includes(c.id)).length}</td>`
    ).join("")}<td></td></tr>`;

    const refusals = D.cases.filter(refused).length;
    root.innerHTML = `
      <div class="page">
        <header class="page-head">
          <p class="eyebrow">Case index</p>
          <h1>Nine operations, side by side</h1>
          <p class="lede">Every influence operation in the report compared on who ran it, whom it targeted, how far its content spread and which tactics it used. Select any case to open it in the map.</p>
        </header>
        <div class="tiles">
          <div class="tile"><div class="tile-v">9</div><div class="tile-l">operations disrupted between December 2025 and August 2026</div></div>
          <div class="tile"><div class="tile-v">4 / 2 / 3</div><div class="tile-l">state, commercial and domestic or opposition operators</div></div>
          <div class="tile"><div class="tile-v">${refusals}</div><div class="tile-l">cases where the report describes Claude refusing and the actor rewording around it</div></div>
          <div class="tile"><div class="tile-v">Cat. 4</div><div class="tile-l">highest reach recorded, reached by one operation through FM radio</div></div>
        </div>

        <section class="block">
          <div class="block-head"><h2>Reach on the Breakout Scale</h2>
          <p class="note">Each case sits in the category the report assigned. Higher categories mean content travelled further beyond the operation’s own accounts. Categories follow Nimmo (2020); the Russian state-media case received no category.</p></div>
          <div class="table-wrap"><div class="scale">${scale}</div></div>
          <div class="legend-row">${D.groups.map((g) => `<span>${swatch(g.id)}${esc(g.label)}</span>`).join("")}</div>
        </section>

        <section class="block">
          <div class="block-head"><h2>Tactics across cases</h2>
          <p class="note">Rows are the nine cross-case trends the report lists on pages 42 and 43. A dot marks a case whose description shows that trend. The report states trends at section level, so this mapping is editorial.</p></div>
          <div class="table-wrap"><table class="matrix">
            <thead><tr><th></th>${groupHead}<th></th></tr><tr><th class="mx-corner">Trend</th>${caseHead}<th class="mx-n">Cases</th></tr></thead>
            <tbody>${mxRows}</tbody><tfoot>${mxFoot}</tfoot>
          </table></div>
        </section>

        <section class="block">
          <div class="block-head row"><h2>All cases</h2>
            <div class="filters" id="case-filters">
              <button class="chip" aria-pressed="true" data-filter="all">All</button>
              ${D.groups.map((g) => `<button class="chip" aria-pressed="false" data-filter="${g.id}">${swatch(g.id)}${esc(g.short)}</button>`).join("")}
              <input class="filter-input" id="case-q" type="search" placeholder="Filter cases" aria-label="Filter cases">
            </div>
          </div>
          <div class="table-wrap"><table class="data-table cases-table" id="cases-table"></table></div>
        </section>
      </div>`;

    const COLS = [
      { k: "id", t: "Case", v: (c) => c.id },
      { k: "group", t: "Actor type", v: (c) => D.groups.findIndex((g) => g.id === c.group) },
      { k: "origin", t: "Origin", v: (c) => c.origin },
      { k: "target", t: "Target", v: (c) => c.target },
      { k: "bo", t: "Reach", v: (c) => (c.breakout.n == null ? -1 : c.breakout.n) },
      { k: "metric", t: "Headline figure", v: null },
      { k: "refusal", t: "Claude refused", v: (c) => (refused(c) ? 1 : 0) },
      { k: "figs", t: "Figures", v: (c) => c.figures.length, num: true },
      { k: "pages", t: "Pages", v: (c) => c.pages[0], num: true },
    ];
    const st = { key: "group", dir: 1, group: "all", q: "" };
    const tbl = root.querySelector("#cases-table");

    function draw() {
      let rows = ORDER.slice();
      if (st.group !== "all") rows = rows.filter((c) => c.group === st.group);
      if (st.q) rows = rows.filter((c) => [c.id, c.short, c.title, c.origin, c.target, c.summary].join(" ").toLowerCase().includes(st.q));
      const col = COLS.find((c) => c.k === st.key);
      if (col && col.v) {
        rows.sort((a, b) => {
          const x = col.v(a);
          const y = col.v(b);
          return (x > y ? 1 : x < y ? -1 : 0) * st.dir;
        });
      }
      tbl.innerHTML = `<thead><tr>${COLS.map(
        (c) =>
          `<th${c.num ? ' class="num"' : ""}>${
            c.v
              ? `<button class="sort" data-sort="${c.k}" aria-sort="${st.key === c.k ? (st.dir > 0 ? "ascending" : "descending") : "none"}">${esc(c.t)}<span class="sort-i"></span></button>`
              : esc(c.t)
          }</th>`
      ).join("")}</tr></thead><tbody>${
        rows.length
          ? rows
              .map(
                (c) => `<tr data-go="${c.id}" tabindex="0">
            <td><span class="code">${c.id}</span><span class="ct-t">${esc(c.short)}</span></td>
            <td class="nowrap">${swatch(c.group)}${esc(GROUP[c.group].short)}</td>
            <td>${esc(c.origin)}</td>
            <td>${esc(c.target)}</td>
            <td class="nowrap">${IO.breakoutBadge(c.breakout.n)}</td>
            <td><b>${esc(c.metrics[0].v)}</b> ${esc(c.metrics[0].l)}</td>
            <td>${refused(c) ? "Yes" : '<span class="muted">Not reported</span>'}</td>
            <td class="num">${c.figures.length}</td>
            <td class="num nowrap">${c.pages[0]} to ${c.pages[1]}</td></tr>`
              )
              .join("")
          : `<tr><td colspan="${COLS.length}" class="muted empty">No cases match this filter.</td></tr>`
      }</tbody>`;
    }
    draw();

    tbl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-sort]");
      if (!b) return;
      e.stopPropagation();
      if (st.key === b.dataset.sort) st.dir *= -1;
      else {
        st.key = b.dataset.sort;
        st.dir = 1;
      }
      draw();
    });
    tbl.addEventListener("keydown", (e) => {
      const tr = e.target.closest("tr[data-go]");
      if (tr && e.key === "Enter") tr.click();
    });
    root.querySelector("#case-filters").addEventListener("click", (e) => {
      const b = e.target.closest("[data-filter]");
      if (!b) return;
      st.group = b.dataset.filter;
      root.querySelectorAll("#case-filters [data-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      draw();
    });
    root.querySelector("#case-q").addEventListener("input", (e) => {
      st.q = e.target.value.trim().toLowerCase();
      draw();
    });
  };

  /* ------------------------------------------------------------------ */
  /* Figure gallery                                                      */
  /* ------------------------------------------------------------------ */

  IO.renderFiguresView = function (root) {
    const cards = D.figures
      .map((f) => {
        const c = caseOf(f.c);
        return `<figure class="g-card" data-g="${c.group}">
          <button class="g-img" data-fig="${f.n}" aria-label="Open figure ${f.n} full size"><img src="${figSrc(f.n)}" alt="${esc(f.alt)}" loading="lazy"></button>
          <figcaption>
            <span class="g-meta">Figure ${f.n}<span class="dot-sep"></span>p. ${f.p}</span>
            <span class="g-title">${esc(f.t)}</span>
            <span class="g-cap">${esc(f.cap)}</span>
            <button class="g-case" data-go="${c.id}">${swatch(c.group)}<span class="code">${c.id}</span>${esc(c.short)}</button>
          </figcaption></figure>`;
      })
      .join("");
    root.innerHTML = `
      <div class="page">
        <header class="page-head">
          <p class="eyebrow">Evidence</p>
          <h1>Figures from the report</h1>
          <p class="lede">All 18 figures from the influence operations section, reproduced unaltered from the PDF. Captions are condensed from the originals. Open any figure to view it full size.</p>
        </header>
        <div class="filters" id="fig-filters">
          <button class="chip" aria-pressed="true" data-filter="all">All <span class="chip-n">${D.figures.length}</span></button>
          ${D.groups
            .map((g) => {
              const k = D.figures.filter((f) => caseOf(f.c).group === g.id).length;
              return `<button class="chip" aria-pressed="false" data-filter="${g.id}">${swatch(g.id)}${esc(g.short)} <span class="chip-n">${k}</span></button>`;
            })
            .join("")}
        </div>
        <div class="gallery">${cards}</div>
      </div>`;
    root.querySelector("#fig-filters").addEventListener("click", (e) => {
      const b = e.target.closest("[data-filter]");
      if (!b) return;
      root.querySelectorAll("#fig-filters [data-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      root.querySelectorAll(".g-card").forEach((card) => {
        card.hidden = b.dataset.filter !== "all" && card.dataset.g !== b.dataset.filter;
      });
    });
  };

  /* ------------------------------------------------------------------ */
  /* Method and sources                                                  */
  /* ------------------------------------------------------------------ */

  IO.renderAboutView = function (root) {
    const F = D.framing;
    root.innerHTML = `
      <div class="page prose-page">
        <header class="page-head">
          <p class="eyebrow">Method and sources</p>
          <h1>How to read this map</h1>
          <p class="lede">An independent, interactive rendering of the influence operations section of Anthropic’s September 2026 threat intelligence report. It covers pages 41 to 80 only; the report’s other harm areas are intentionally left out.</p>
        </header>

        <section class="prose">
          <h2>The section in brief</h2>
          <p><b>Definition.</b> ${esc(F.definition.text)} ${IO.pageLink(F.definition.p)}</p>
          <p><b>Scope.</b> ${esc(F.scope.text)} ${IO.pageLink(F.scope.p)}</p>
          <p><b>Elections.</b> ${esc(F.elections.text)} ${IO.pageLink(F.elections.p)}</p>

          <h2>How the cases were found</h2>
          <ul>${F.investigation.map((it) => `<li><b>${esc(it.t)}.</b> ${esc(it.d)} ${IO.pageLink(it.p)}</li>`).join("")}</ul>

          <h2>Measuring reach: the Breakout Scale</h2>
          <p>The report rates each operation on the Breakout Scale, a six-category framework introduced by Ben Nimmo at the Brookings Institution in 2020. ${IO.pageLink(42)}</p>
          <div class="table-wrap"><table class="data-table">
            <thead><tr><th>Category</th><th>Meaning</th><th>Cases in this report</th></tr></thead>
            <tbody>${D.breakout
              .map((b) => {
                const cs = D.cases.filter((c) => c.breakout.n === b.n);
                return `<tr><td class="nowrap">${IO.breakoutBadge(b.n)}</td><td><b>${esc(b.t)}.</b> ${esc(b.d)}</td><td>${
                  cs.length ? cs.map((c) => `<button class="link-btn" data-go="${c.id}">${c.id}</button>`).join(", ") : '<span class="muted">None</span>'
                }</td></tr>`;
              })
              .join("")}
              <tr><td class="nowrap">${IO.breakoutBadge(null)}</td><td>No category given in the report.</td><td><button class="link-btn" data-go="GTG-24015">GTG-24015</button></td></tr>
            </tbody></table></div>

          <h2>Cross-case trends</h2>
          <ol class="trend-list">${D.trends.map((t) => `<li><button class="link-btn strong" data-go="trend/${t.id}">${esc(t.t)}</button> ${esc(t.d)} ${IO.pageLink(t.p)}</li>`).join("")}</ol>

          <h2>About this visualization</h2>
          <ul>
            <li><b>Structure.</b> Cases are grouped by the kind of actor behind them: state and state-aligned bodies, commercial influence-for-hire firms, and domestic or exiled political operators. Each case opens into the same facets (profile, use of Claude, findings, safeguards, network, figures, response) so cases can be compared branch by branch.</li>
            <li><b>Text.</b> Case text is condensed and paraphrased from the report. Every statement links to the page it comes from. Quoted phrases are the threat actors’ own words as quoted in the report.</li>
            <li><b>Figures.</b> The 18 figures are extracted byte for byte from the PDF by <code>src/scripts/extract_figures.py</code> and are not edited.</li>
            <li><b>Editorial layers.</b> The links between trends and cases, and the grouping of cases by actor type, are this project’s reading of the report rather than the report’s own structure.</li>
            <li><b>Color.</b> Actor-type and reach palettes were checked for color-vision deficiency and contrast in both themes; every color is paired with a text label.</li>
          </ul>

          <h2>Sources</h2>
          <ol class="ref-list">${D.references.map((r) => `<li>${esc(r.label)} <a href="${r.url}" target="_blank" rel="noopener">${esc(r.url.replace(/^https?:\/\//, "").split("/")[0])}${IO.icon("external", 12)}</a></li>`).join("")}</ol>

          <p class="disclaimer">Independent visualization. Not affiliated with or endorsed by Anthropic. Report content and figures remain the property of their owners and are reproduced for commentary and research with attribution.</p>
        </section>
      </div>`;
  };

  /* ------------------------------------------------------------------ */
  /* Lightbox                                                            */
  /* ------------------------------------------------------------------ */

  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lb-img");
  const stage = document.getElementById("lb-stage");
  const cap = document.getElementById("lb-cap");
  const pageA = document.getElementById("lb-page");
  const goBtn = document.getElementById("lb-go");
  let lastFocus = null;

  IO.lightbox = {
    i: 0,
    isOpen: () => !lb.hidden,
    open(n) {
      this.i = Math.max(0, D.figures.findIndex((f) => f.n === n));
      lastFocus = document.activeElement;
      lb.hidden = false;
      document.body.classList.add("no-scroll");
      this.render();
      lb.focus();
    },
    close() {
      if (lb.hidden) return;
      lb.hidden = true;
      document.body.classList.remove("no-scroll");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    },
    step(d) {
      this.i = (this.i + d + D.figures.length) % D.figures.length;
      this.render();
    },
    render() {
      const f = D.figures[this.i];
      const c = caseOf(f.c);
      stage.classList.remove("zoomed");
      img.src = figSrc(f.n);
      img.alt = f.alt;
      cap.innerHTML = `<p class="lb-eyebrow">${swatch(c.group)}<span class="code">${c.id}</span> ${esc(c.short)}<span class="dot-sep"></span>Figure ${f.n} of ${D.figures.length}</p>
        <p class="lb-title">${esc(f.t)}</p><p class="lb-text">${esc(f.cap)}</p>`;
      pageA.href = IO.pageHref(f.p);
      pageA.innerHTML = `${IO.icon("page", 15)}Report p. ${f.p}`;
      goBtn.dataset.go = `fig/${f.n}`;
    },
  };

  lb.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lb]");
    if (b) {
      if (b.dataset.lb === "prev") IO.lightbox.step(-1);
      else if (b.dataset.lb === "next") IO.lightbox.step(1);
      else IO.lightbox.close();
      return;
    }
    if (e.target === img) stage.classList.toggle("zoomed");
    else if (e.target === stage) IO.lightbox.close();
  });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") IO.lightbox.close();
    else if (e.key === "ArrowLeft") IO.lightbox.step(-1);
    else if (e.key === "ArrowRight") IO.lightbox.step(1);
    else return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);
})();
