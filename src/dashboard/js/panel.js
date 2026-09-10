/*
 * Detail panel: renders whatever node is selected in the graph.
 * Links inside the panel use data attributes handled by app.js:
 *   data-go="<node id>"   select and focus a node
 *   data-fig="<n>"        open a figure in the lightbox
 *   data-act="expand" | "collapse"   open or close the selected branch
 */
(function () {
  "use strict";
  const IO = (window.IO = window.IO || {});

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  IO.esc = esc;

  const KIND_LABEL = { root: "Report section", group: "Actor group", case: "Case study", facet: "Case facet", item: "Detail" };
  const GROUP_NAME = { state: "State and state-aligned", commercial: "Influence for hire", domestic: "Domestic and opposition", context: "Section overview", root: "Report" };

  function pageHref(p) {
    return `${IO_DATA.meta.url}#page=${p}`;
  }
  IO.pageHref = pageHref;

  function pageLink(p, label) {
    if (!p) return "";
    return `<a class="page-ref" href="${pageHref(p)}" target="_blank" rel="noopener" title="Open page ${p} of the report">${label || `p. ${p}`}${IO.icon("external", 12)}</a>`;
  }
  function pagesLink(pages) {
    if (!pages) return "";
    return pageLink(pages[0], `pp. ${pages[0]} to ${pages[1]}`);
  }
  IO.pageLink = pageLink;
  IO.pagesLink = pagesLink;

  function swatch(group) {
    return `<span class="swatch" data-g="${esc(group)}"></span>`;
  }

  function breakoutBadge(n) {
    if (n == null) return `<span class="bo-badge na" title="The report assigns no Breakout category">Not rated</span>`;
    return `<span class="bo-badge" data-bo="${n}" title="Breakout Scale category ${n} of 6"><span class="bo-bar">${[1, 2, 3, 4, 5, 6]
      .map((i) => `<i class="${i <= n ? "on" : ""}"></i>`)
      .join("")}</span>Category ${n}</span>`;
  }
  IO.breakoutBadge = breakoutBadge;

  function metrics(list) {
    return `<div class="metrics m${list.length}">${list
      .map((m) => `<div class="metric"><div class="metric-v">${esc(m.v)}</div><div class="metric-l">${esc(m.l)}</div></div>`)
      .join("")}</div>`;
  }

  function table(t) {
    return `<div class="table-wrap"><table class="data-table"><thead><tr>${t.cols
      .map((c) => `<th>${esc(c)}</th>`)
      .join("")}</tr></thead><tbody>${t.rows
      .map((r) => `<tr>${r.map((c, i) => `<td${i === 0 ? ' class="first"' : ""}>${esc(c)}</td>`).join("")}</tr>`)
      .join("")}</tbody></table></div>`;
  }

  function figThumb(f) {
    return `<button class="fig-thumb" data-fig="${f.n}" title="Open figure ${f.n}">
      <img src="assets/figures/fig-${String(f.n).padStart(2, "0")}.jpg" alt="${esc(f.alt)}" loading="lazy">
      <span class="fig-thumb-cap"><b>Fig. ${f.n}</b> ${esc(f.t)}</span></button>`;
  }
  IO.figThumb = figThumb;

  function caseCard(c) {
    return `<button class="case-card" data-go="${esc(c.id)}">
      <span class="case-card-top">${swatch(c.group)}<span class="code">${esc(c.id)}</span>${breakoutBadge(c.breakout.n)}</span>
      <span class="case-card-title">${esc(c.short)}</span>
      <span class="case-card-meta">${esc(c.origin)} <span class="arrow">to</span> ${esc(c.target)}</span>
    </button>`;
  }
  IO.caseCard = caseCard;

  function crumbs(n) {
    const chain = [];
    for (let p = n.parent; p; p = p.parent) chain.unshift(p);
    if (!chain.length) return "";
    return `<nav class="panel-crumbs">${chain
      .map((p) => `<button data-go="${esc(p.id)}">${esc(p.code || IO.truncate(p.label, 26))}</button>`)
      .join('<span class="sep">/</span>')}</nav>`;
  }

  function childList(n) {
    return `<ul class="child-list">${n.children
      .map(
        (c) => `<li><button data-go="${esc(c.id)}"><span class="cl-t">${esc(c.label)}</span>${
          c.children.length ? `<span class="cl-n">${c.children.length}</span>` : ""
        }</button></li>`
      )
      .join("")}</ul>`;
  }

  function branchButtons(n) {
    if (!n.children.length) return "";
    return `<div class="branch-actions">
      <button class="btn sm" data-act="expand">${IO.icon("plus", 14)}Expand branch</button>
      <button class="btn sm" data-act="collapse">${IO.icon("minus", 14)}Collapse branch</button>
    </div>`;
  }

  function trendChips(caseId) {
    const list = IO_DATA.trends.filter((t) => t.cases.includes(caseId));
    if (!list.length) return "";
    return `<section class="p-sec"><h3>Cross-case trends</h3><p class="fine">Trend links are an editorial mapping from the case text to the section’s trend list.</p>
      <div class="chips">${list.map((t) => `<button class="chip" data-go="trend/${t.id}">${esc(t.t)}</button>`).join("")}</div></section>`;
  }

  function relatedCases(ids, title) {
    const cs = ids.map((id) => IO_DATA.cases.find((c) => c.id === id)).filter(Boolean);
    if (!cs.length) return `<section class="p-sec"><h3>${esc(title)}</h3><p class="muted">None of the nine cases.</p></section>`;
    return `<section class="p-sec"><h3>${esc(title)}</h3><div class="case-cards">${cs.map(caseCard).join("")}</div></section>`;
  }

  function breakoutDistribution() {
    const counts = {};
    IO_DATA.cases.forEach((c) => {
      const k = c.breakout.n == null ? "na" : c.breakout.n;
      counts[k] = (counts[k] || 0) + 1;
    });
    const max = Math.max(...Object.values(counts));
    const rows = [1, 2, 3, 4, 5, 6, "na"].map((k) => {
      const v = counts[k] || 0;
      const label = k === "na" ? "Not rated" : `Cat. ${k}`;
      return `<div class="dist-row" title="${v} case${v === 1 ? "" : "s"}"><span class="dist-l">${label}</span><span class="dist-track"><span class="dist-bar" style="width:${(v / max) * 100}%"></span></span><span class="dist-v">${v}</span></div>`;
    });
    return `<div class="dist">${rows.join("")}</div>`;
  }

  IO.renderPanel = function (n) {
    const D = IO_DATA;
    let head = "";
    let body = "";
    const eyebrow = (txt) => `<p class="eyebrow">${txt}</p>`;

    if (n.kind === "root") {
      head = `${eyebrow("Anthropic threat report, September 2026")}<h2 class="p-title">Influence operations on Claude</h2>`;
      body = `
        <p class="lede">Nine disrupted operations in which governments, state media, commercial firms and political operators tried to use Claude to plan, staff and run covert influence campaigns.</p>
        <div class="metrics">
          <div class="metric"><div class="metric-v">9</div><div class="metric-l">operations disrupted</div></div>
          <div class="metric"><div class="metric-v">6</div><div class="metric-l">continents targeted</div></div>
          <div class="metric"><div class="metric-v">18</div><div class="metric-l">figures from the report</div></div>
          <div class="metric"><div class="metric-v">8 mo.</div><div class="metric-l">Dec 2025 to Aug 2026</div></div>
        </div>
        <section class="p-sec"><h3>Actor groups</h3>
          <ul class="group-list">${D.groups
            .map((g) => {
              const k = D.cases.filter((c) => c.group === g.id).length;
              return `<li><button data-go="group/${g.id}">${swatch(g.id)}<span class="gl-t">${esc(g.label)}</span><span class="gl-n">${k} cases</span><span class="gl-d">${esc(g.desc)}</span></button></li>`;
            })
            .join("")}
            <li><button data-go="overview">${swatch("context")}<span class="gl-t">Section overview</span><span class="gl-n">method and trends</span><span class="gl-d">Definition, investigation method, the Breakout Scale and nine cross-case trends.</span></button></li>
          </ul></section>
        <section class="p-sec"><h3>Reach on the Breakout Scale</h3>${breakoutDistribution()}
          <p class="fine">Only one operation broke out of social media into another medium. None reached celebrity amplification or policy response.</p></section>
        <section class="p-sec how"><h3>Reading the map</h3>
          <ul class="how-list">
            <li><b>Click</b> a node to open it and expand its branch. Click again to collapse.</li>
            <li><b>Shift-click</b> expands or collapses a whole branch at once.</li>
            <li><b>Drag</b> the canvas to pan, drag a node to move its branch, <b>scroll</b> to zoom.</li>
            <li><b>Arrow keys</b> walk the tree once the canvas has focus. Press <kbd>?</kbd> for all shortcuts.</li>
          </ul></section>
        <p class="source">Source: ${esc(D.meta.report)}, ${pagesLink(D.meta.pages)}</p>`;
    } else if (n.kind === "group" && n.group === "context") {
      head = `${eyebrow("Section overview")}<h2 class="p-title">How the report frames the problem</h2>`;
      body = `
        <section class="p-sec"><h3>Definition ${pageLink(D.framing.definition.p)}</h3><p>${esc(D.framing.definition.text)}</p></section>
        <section class="p-sec"><h3>Scope ${pageLink(D.framing.scope.p)}</h3><p>${esc(D.framing.scope.text)}</p></section>
        <section class="p-sec"><h3>Elections ${pageLink(D.framing.elections.p)}</h3><p>${esc(D.framing.elections.text)}</p></section>
        <section class="p-sec"><h3>In this branch</h3>${childList(n)}</section>
        ${branchButtons(n)}`;
    } else if (n.kind === "group") {
      const g = n.groupData;
      const cs = D.cases.filter((c) => c.group === g.id);
      head = `${eyebrow(`${swatch(g.id)} Actor group`)}<h2 class="p-title">${esc(g.label)}</h2>`;
      body = `<p class="lede">${esc(g.desc)}</p>
        <section class="p-sec"><h3>${cs.length} cases</h3><div class="case-cards">${cs.map(caseCard).join("")}</div></section>
        ${branchButtons(n)}`;
    } else if (n.kind === "case") {
      const c = n.caseData;
      const figs = c.figures.map((nr) => D.figures.find((f) => f.n === nr));
      head = `${eyebrow(`${swatch(c.group)}<span class="code">${esc(c.id)}</span> ${esc(GROUP_NAME[c.group])}`)}<h2 class="p-title">${esc(c.title)}</h2>`;
      body = `
        <dl class="facts">
          <div><dt>Origin</dt><dd>${esc(c.origin)}</dd></div>
          <div><dt>Target</dt><dd>${esc(c.target)}</dd></div>
          <div><dt>Reach</dt><dd>${breakoutBadge(c.breakout.n)}</dd></div>
          <div><dt>Report</dt><dd>${pagesLink(c.pages)}</dd></div>
        </dl>
        <p class="lede">${esc(c.summary)}</p>
        ${metrics(c.metrics)}
        <section class="p-sec"><h3>Attribution</h3><p>${esc(c.attribution)}</p></section>
        <section class="p-sec"><h3>Reach ${pageLink(c.breakout.p)}</h3><p>${esc(c.breakout.why)}</p></section>
        <section class="p-sec"><h3>Figures</h3><div class="fig-grid">${figs.map(figThumb).join("")}</div></section>
        ${trendChips(c.id)}
        <section class="p-sec"><h3>Explore this case</h3>${childList(n)}</section>
        ${branchButtons(n)}`;
    } else if (n.kind === "facet") {
      const owner = n.caseNode ? n.caseNode.caseData : null;
      head = `${eyebrow(owner ? `${swatch(owner.group)}<span class="code">${esc(owner.id)}</span> ${esc(owner.short)}` : "Section overview")}<h2 class="p-title">${esc(n.label)}</h2>`;
      if (n.text) body += `<p class="lede">${esc(n.text)}</p>`;
      if (n.table) body += `<section class="p-sec"><h3>Table ${pageLink(n.p)}</h3>${table(n.table)}</section>`;
      else if (n.id.endsWith("/figures")) {
        body += `<div class="fig-grid">${n.children.map((c) => figThumb(c.figure)).join("")}</div>`;
      } else {
        body += `<ol class="detail-list">${n.children
          .map(
            (c) => `<li><button class="dl-t" data-go="${esc(c.id)}">${c.tag ? `<span class="tag ${esc(c.tag)}">${esc(c.tag)}</span>` : ""}${esc(c.label)}</button>
              ${c.metrics ? metrics(c.metrics) : `<p>${esc(c.text)}</p>`}${c.p ? `<p class="ref">${pageLink(c.p)}</p>` : ""}</li>`
          )
          .join("")}</ol>`;
      }
      if (n.pages) body += `<p class="source">Report ${pagesLink(n.pages)}</p>`;
      body += branchButtons(n);
    } else {
      const owner = n.caseNode ? n.caseNode.caseData : null;
      const where = owner ? `${swatch(owner.group)}<span class="code">${esc(owner.id)}</span> ${esc(n.parent.label)}` : esc(n.parent.label);
      head = `${eyebrow(where)}<h2 class="p-title">${n.tag ? `<span class="tag ${esc(n.tag)}">${esc(n.tag)}</span>` : ""}${esc(n.label)}</h2>`;
      if (n.figure) {
        const f = n.figure;
        body += `<figure class="p-figure"><button data-fig="${f.n}" title="View full size"><img src="assets/figures/fig-${String(f.n).padStart(2, "0")}.jpg" alt="${esc(f.alt)}"></button>
          <figcaption><b>Figure ${f.n}.</b> ${esc(f.cap)} ${pageLink(f.p)}</figcaption></figure>
          <section class="p-sec"><h3>What it shows</h3><p>${esc(f.alt)}</p></section>`;
      } else if (n.metrics) {
        body += metrics(n.metrics);
      } else if (n.row) {
        body += `<dl class="facts stack">${n.cols.map((c, i) => `<div><dt>${esc(c)}</dt><dd>${esc(n.row[i])}</dd></div>`).join("")}</dl>`;
        if (n.p) body += `<p class="ref">${pageLink(n.p)}</p>`;
      } else {
        if (n.breakoutCat != null && !n.relatedCases) body += `<p>${breakoutBadge(n.breakoutCat)}</p>`;
        body += `<p class="lede">${esc(n.text)}</p>`;
        if (n.facts) body += `<dl class="facts stack">${n.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`;
        if (n.table) body += table(n.table);
        if (n.p) body += `<p class="ref">Source: ${pageLink(n.p)}</p>`;
      }
      if (n.trend) body += relatedCases(n.trend.cases, "Cases showing this trend") + `<p class="fine">Mapping of trends to cases is editorial, based on the case descriptions.</p>`;
      if (n.relatedCases && n.breakoutCat != null) {
        body += relatedCases(n.relatedCases, "Cases in this category");
        body += `<p class="fine">Category descriptions follow Nimmo (2020), Brookings Institution. The report describes Category One explicitly.</p>`;
      }
      if (owner) body += `<p class="back"><button class="btn sm ghost" data-go="${esc(owner.id)}">${IO.icon("left", 14)}Back to ${esc(owner.id)}</button></p>`;
    }

    return `<header class="p-head">${crumbs(n)}${head}</header><div class="p-body">${body}</div>`;
  };

  IO.kindLabel = (n) => KIND_LABEL[n.kind];
})();
