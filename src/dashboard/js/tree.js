/*
 * Builds the navigable hierarchy from IO_DATA:
 *   root > actor group > case > facet > detail
 * plus a "Section overview" branch for the definition, method,
 * Breakout Scale and cross-case trends.
 */
(function () {
  "use strict";
  const IO = (window.IO = window.IO || {});

  const LIMIT = { root: 60, group: 44, case: 40, facet: 38, item: 46 };

  function truncate(s, n) {
    if (s.length <= n) return s;
    const cut = s.slice(0, n - 1);
    const sp = cut.lastIndexOf(" ");
    return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:.(/]+$/, "") + "…";
  }

  function make(id, kind, label, extra) {
    return Object.assign({ id, kind, label, children: [] }, extra || {});
  }

  IO.truncate = truncate;

  IO.buildTree = function (D) {
    const figByN = new Map(D.figures.map((f) => [f.n, f]));

    const root = make("root", "root", D.meta.title, {
      group: "root",
      text: D.framing.scope.text,
      pages: D.meta.pages,
    });

    /* Section overview ------------------------------------------------ */
    const ov = make("overview", "group", "Section overview", {
      group: "context",
      desc: "How the report defines, investigates and measures influence operations, and the trends it sees across cases.",
      pages: [41, 44],
    });
    ov.children.push(
      make("overview/definition", "item", "What counts as an influence operation", { text: D.framing.definition.text, p: D.framing.definition.p }),
      make("overview/scope", "item", "Scope: nine cases, six continents", { text: D.framing.scope.text, p: D.framing.scope.p }),
      make("overview/elections", "item", "Timed to national elections", { text: D.framing.elections.text, p: D.framing.elections.p })
    );

    const method = make("overview/method", "facet", "How cases are investigated", { pages: [41, 42] });
    D.framing.investigation.forEach((it, i) =>
      method.children.push(make(`overview/method/${i}`, "item", it.t, { text: it.d, p: it.p }))
    );
    ov.children.push(method);

    const scale = make("overview/breakout", "facet", "Breakout Scale", {
      p: 42,
      text: "A six-category framework for the reach of influence operations, based on how far content spreads across platforms and communities. Category One means content stayed in a single community on one platform.",
    });
    D.breakout.forEach((b) =>
      scale.children.push(
        make(`breakout/${b.n}`, "item", `Category ${b.n}: ${b.t}`, {
          text: b.d,
          breakoutCat: b.n,
          relatedCases: D.cases.filter((c) => c.breakout.n === b.n).map((c) => c.id),
        })
      )
    );
    ov.children.push(scale);

    const trends = make("overview/trends", "facet", "Cross-case trends", { pages: [42, 44] });
    D.trends.forEach((t) =>
      trends.children.push(make(`trend/${t.id}`, "item", t.t, { text: t.d, p: t.p, trend: t, relatedCases: t.cases }))
    );
    ov.children.push(trends);
    root.children.push(ov);

    /* Actor groups and cases ------------------------------------------ */
    D.groups.forEach((g) => {
      const gn = make(`group/${g.id}`, "group", g.label, { group: g.id, desc: g.desc, groupData: g });
      D.cases.filter((c) => c.group === g.id).forEach((c) => gn.children.push(buildCase(c)));
      root.children.push(gn);
    });

    function buildCase(c) {
      const id = c.id;
      const cn = make(id, "case", c.short, {
        code: id,
        caseData: c,
        group: c.group,
        text: c.summary,
        pages: c.pages,
      });
      const facet = (key, label, extra) => make(`${id}/${key}`, "facet", label, extra);

      const profile = facet("profile", "Profile");
      profile.children.push(
        make(`${id}/profile/actor`, "item", "Actor and attribution", { text: c.attribution, facts: [["Origin", c.origin]] }),
        make(`${id}/profile/target`, "item", "Targeted audience", { text: c.target, facts: [["Region", c.region]] }),
        make(`${id}/profile/reach`, "item", c.breakout.n ? `Reach: Breakout Category ${c.breakout.n}` : "Reach: not rated", {
          text: c.breakout.why,
          p: c.breakout.p,
          breakoutCat: c.breakout.n,
        }),
        make(`${id}/profile/numbers`, "item", "In numbers", {
          metrics: c.metrics,
          text: c.metrics.map((m) => `${m.v} ${m.l}`).join("; "),
        })
      );
      cn.children.push(profile);

      const list = (key, label, items) => {
        if (!items || !items.length) return;
        const fn = facet(key, label);
        items.forEach((it, i) =>
          fn.children.push(make(`${id}/${key}/${i}`, "item", it.t, { text: it.d, p: it.p, tag: it.kind }))
        );
        cn.children.push(fn);
      };
      list("use", "How Claude was used", c.use);
      list("findings", "Key findings", c.findings);
      list("safeguards", "Safeguards and evasion", c.safeguards);

      const net = facet("network", c.network.title, { p: c.network.p, table: c.network });
      c.network.rows.forEach((row, i) =>
        net.children.push(
          make(`${id}/network/${i}`, "item", row[0], {
            row,
            cols: c.network.cols,
            p: c.network.p,
            text: row.slice(1).filter(Boolean).join(". "),
          })
        )
      );
      cn.children.push(net);

      const figs = facet("figures", "Figures from the report");
      c.figures.forEach((nr) => {
        const fig = figByN.get(nr);
        figs.children.push(make(`fig/${nr}`, "item", `Fig. ${nr}: ${fig.t}`, { figure: fig, text: fig.cap, p: fig.p }));
      });
      cn.children.push(figs);

      const resp = facet("response", "Detection and response");
      resp.children.push(
        make(`${id}/response/found`, "item", c.detection.found.t, { text: c.detection.found.d, p: c.detection.found.p }),
        make(`${id}/response/action`, "item", c.detection.action.t, { text: c.detection.action.d, p: c.detection.action.p })
      );
      if (c.indicators) {
        resp.children.push(
          make(`${id}/response/indicators`, "item", "Published indicators", {
            table: c.indicators,
            p: c.indicators.p,
            text: `${c.indicators.rows.length} indicator groups shared for industry partners.`,
          })
        );
      }
      cn.children.push(resp);
      return cn;
    }

    /* Decorate: parent links, levels, inherited colour keys, search text */
    const all = [];
    const byId = new Map();
    (function walk(n, parent, level, caseNode) {
      n.parent = parent;
      n.level = level;
      if (!n.group) n.group = parent ? parent.group : "root";
      if (n.kind === "case") caseNode = n;
      n.caseNode = caseNode || null;
      n.bo = caseNode ? caseNode.caseData.breakout.n : null;
      n.display = truncate(n.label, LIMIT[n.kind]);
      const extra = [n.code, n.text, n.desc, n.row && n.row.join(" "), n.table && n.table.rows.map((r) => r.join(" ")).join(" ")];
      n.search = [n.label].concat(extra.filter(Boolean)).join(" ").toLowerCase();
      n.expanded = level < 2;
      all.push(n);
      byId.set(n.id, n);
      n.children.forEach((c) => walk(c, n, level + 1, caseNode));
    })(root, null, 0, null);

    return { root, all, byId };
  };
})();
