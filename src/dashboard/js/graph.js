/*
 * Interactive tree graph with no dependencies.
 *
 *  - Three tidy layouts: left to right, top down and radial
 *  - Animated expand and collapse, anchored on the node you clicked
 *  - Pan, wheel and pinch zoom, node dragging (moves the whole branch)
 *  - Semantic zoom: detail labels hide when zoomed far out
 *  - A pulse that runs from the root to the selected node, on repeat
 *  - Minimap, trend overlay links, search highlighting, SVG and PNG export
 */
(function () {
  "use strict";
  const IO = (window.IO = window.IO || {});
  const NS = "http://www.w3.org/2000/svg";
  const SANS = '"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif';
  const MONO = '"IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace';

  const KIND = {
    root: { r: 8.5, size: 15, weight: 600, row: 44 },
    group: { r: 6.5, size: 14, weight: 600, row: 34 },
    case: { r: 5.5, size: 13, weight: 500, row: 29 },
    facet: { r: 4.25, size: 12.5, weight: 500, row: 25 },
    item: { r: 3.25, size: 12, weight: 400, row: 21 },
  };
  const DURATION = 560;
  const K_MIN = 0.08;
  const K_MAX = 4;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const rd = (v) => Math.round(v * 10) / 10;
  const hasKids = (n) => !!(n.children && n.children.length);
  const isOpen = (n) => !!n.expanded && hasKids(n);

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  const measureCtx = document.createElement("canvas").getContext("2d");
  const widthCache = new Map();
  function measure(text, font) {
    const key = font + "|" + text;
    let w = widthCache.get(key);
    if (w === undefined) {
      measureCtx.font = font;
      w = measureCtx.measureText(text).width;
      widthCache.set(key, w);
    }
    return w;
  }

  class Graph {
    constructor(host, tree, opts) {
      this.host = host;
      this.root = tree.root;
      this.all = tree.all;
      this.byId = tree.byId;
      this.opts = opts || {};
      this.layout = "lr";
      this.textScale = 1;
      this.colorBy = "group";
      this.trendLinks = false;
      this.pulse = true;
      this.motion = true;
      this.selected = null;
      this.hovered = null;
      this.matches = null;
      this.t = { x: 0, y: 0, k: 1 };
      this.dom = new Map();
      this.linkDom = new Map();
      this.exiting = new Map();
      this.pointers = new Map();
      this.visible = [];
      this.visSet = new Set();
      this.all.forEach((n) => {
        n.off = { x: 0, y: 0 };
        n.x = n.y = n.tx = n.ty = 0;
      });
      this.build();
      this.bind();
    }

    /* ---------------------------------------------------------------- */
    /* DOM                                                               */
    /* ---------------------------------------------------------------- */

    build() {
      this.svg = el("svg", { class: "graph color-group", tabindex: "0", role: "application", "aria-label": "Interactive tree of influence operation cases" });
      this.viewport = el("g", { class: "viewport" }, this.svg);
      this.gLinks = el("g", { class: "links" }, this.viewport);
      this.gTrend = el("g", { class: "tlinks" }, this.viewport);
      this.gPulse = el("g", { class: "pulse" }, this.viewport);
      this.pulseTrack = el("path", { class: "pulse-track" }, this.gPulse);
      this.ripple = el("circle", { class: "ripple", r: 0, opacity: 0 }, this.gPulse);
      this.pulseDots = [3, 2, 1, 0].map((i) => el("circle", { class: "pulse-dot", r: 4.2 - i * 0.7, opacity: 0, "data-i": i }, this.gPulse));
      this.pulseDots.reverse();
      this.gNodes = el("g", { class: "nodes" }, this.viewport);
      this.host.appendChild(this.svg);

      const mh = this.opts.minimapHost;
      if (mh) {
        this.mini = el("svg", { class: "minimap-svg", preserveAspectRatio: "xMidYMid meet" }, mh);
        this.miniLinks = el("path", { class: "mini-links" }, this.mini);
        this.miniNodes = el("g", { class: "mini-nodes" }, this.mini);
        this.miniView = el("rect", { class: "mini-view", rx: 2 }, this.mini);
      }
    }

    nodeDom(n) {
      let d = this.dom.get(n.id);
      if (d) return d;
      const g = el("g", { class: `node k-${n.kind}`, "data-id": n.id, "data-g": n.group, "data-bo": n.bo == null ? "na" : n.bo });
      el("circle", { class: "hit", r: 12 }, g);
      const ring = el("circle", { class: "ring" }, g);
      const dot = el("circle", { class: "dot" }, g);
      const lbl = el("g", { class: "lbl" }, g);
      const box = el("rect", { class: "lbl-hit", rx: 4 }, lbl);
      const text = el("text", { class: "label" }, lbl);
      let code = null;
      if (n.code) {
        code = el("tspan", { class: "code" }, text);
        code.textContent = n.code;
      }
      const name = el("tspan", { class: "name" }, text);
      name.textContent = n.display;
      const count = el("tspan", { class: "count" }, text);
      d = { g, ring, dot, lbl, box, text, code, name, count, alive: false };
      this.dom.set(n.id, d);
      return d;
    }

    styleNode(n, d) {
      const K = KIND[n.kind];
      const s = K.size * this.textScale;
      n._r = K.r * this.textScale;
      n._s = s;
      d.dot.setAttribute("r", n._r);
      d.ring.setAttribute("r", n._r + 4);
      d.text.setAttribute("font-size", s);
      d.text.setAttribute("font-weight", K.weight);
      if (d.code) {
        d.code.setAttribute("font-size", s * 0.9);
        d.name.setAttribute("dx", 6 * this.textScale);
      }
      const collapsed = hasKids(n) && !n.expanded;
      d.count.textContent = collapsed ? String(n.children.length) : "";
      d.count.setAttribute("dx", collapsed ? 7 : 0);
      d.count.setAttribute("font-size", s * 0.85);
      const cl = d.g.classList;
      cl.toggle("open", isOpen(n));
      cl.toggle("collapsed", collapsed);
      cl.toggle("leaf", !hasKids(n));
      cl.toggle("match", !!(this.matches && this.matches.has(n.id)));
      d.g.setAttribute("aria-label", n.label);
    }

    labelWidth(n) {
      const K = KIND[n.kind];
      const s = K.size * this.textScale;
      let w = measure(n.display, `${K.weight} ${s}px ${SANS}`);
      if (n.code) w += measure(n.code, `${K.weight} ${s * 0.9}px ${MONO}`) + 6 * this.textScale;
      if (hasKids(n) && !n.expanded) w += 7 + measure(String(n.children.length), `${K.weight} ${s * 0.85}px ${SANS}`);
      return w;
    }

    /* ---------------------------------------------------------------- */
    /* Layout                                                            */
    /* ---------------------------------------------------------------- */

    breadth(n, own, sep) {
      if (!isOpen(n)) return (n._b = own(n));
      let s = 0;
      n.children.forEach((c, i) => {
        s += this.breadth(c, own, sep);
        if (i) s += sep(n.children[i - 1], c);
      });
      n._kb = s;
      return (n._b = Math.max(own(n), s));
    }

    place(n, start, sep) {
      n._p = start + n._b / 2;
      if (!isOpen(n)) return;
      let cur = start + (n._b - n._kb) / 2;
      n.children.forEach((c, i) => {
        if (i) cur += sep(n.children[i - 1], c);
        this.place(c, cur, sep);
        cur += c._b;
      });
    }

    computeLayout() {
      const vis = [];
      (function walk(n, d) {
        n.depth = d;
        vis.push(n);
        if (isOpen(n)) n.children.forEach((c) => walk(c, d + 1));
      })(this.root, 0);
      const S = this.textScale;
      vis.forEach((n) => {
        n._w = this.labelWidth(n);
        n._r = KIND[n.kind].r * S;
        n._s = KIND[n.kind].size * S;
      });
      const maxD = vis.reduce((m, n) => Math.max(m, n.depth), 0);

      if (this.layout === "lr") {
        const own = (n) => KIND[n.kind].row * S;
        const sep = (a, b) => (isOpen(a) || isOpen(b) ? 10 : 0) * S;
        this.breadth(this.root, own, sep);
        this.place(this.root, 0, sep);
        const colW = [];
        vis.forEach((n) => {
          if (isOpen(n)) colW[n.depth] = Math.max(colW[n.depth] || 0, n._r + 6 * S + n._w);
        });
        const colX = [0];
        for (let d = 1; d <= maxD; d++) colX[d] = colX[d - 1] + (colW[d - 1] || 0) + 64 * S;
        vis.forEach((n) => {
          n._bx = colX[n.depth];
          n._by = n._p;
        });
      } else if (this.layout === "td") {
        const own = (n) => (isOpen(n) ? n._w + 26 * S : n._s * 1.4 + 6 * S);
        const sep = (a, b) => (isOpen(a) || isOpen(b) ? 16 : 2) * S;
        this.breadth(this.root, own, sep);
        this.place(this.root, 0, sep);
        vis.forEach((n) => {
          n._bx = n._p;
          n._by = n.depth * 124 * S;
        });
      } else {
        const own = (n) => (n.kind === "item" ? 1 : n.kind === "facet" ? 1.15 : 1.4);
        const sep = (a, b) => (isOpen(a) || isOpen(b) ? 0.9 : 0.12);
        this.breadth(this.root, own, sep);
        const seam = 1.2;
        const total = this.root._b + seam;
        this.place(this.root, seam / 2, sep);
        const minR = (16 * S * total) / (2 * Math.PI);
        const inner = [];
        const leafAt = [];
        vis.forEach((n) => {
          if (isOpen(n) && n.depth > 0) inner[n.depth] = Math.max(inner[n.depth] || 0, n._w + n._r + 10 * S);
          if (!isOpen(n)) leafAt[n.depth] = true;
        });
        const R = [0];
        for (let d = 1; d <= maxD; d++) {
          let r = R[d - 1] + Math.max(96 * S, (inner[d] || 0) + 34 * S);
          if (leafAt[d]) r = Math.max(r, minR);
          R[d] = r;
        }
        vis.forEach((n) => {
          const a = (n._p / total) * 2 * Math.PI - Math.PI / 2;
          n._bx = n.depth ? Math.cos(a) * R[n.depth] : 0;
          n._by = n.depth ? Math.sin(a) * R[n.depth] : 0;
        });
      }

      vis.forEach((n) => {
        let ox = 0;
        let oy = 0;
        for (let p = n; p; p = p.parent) {
          ox += p.off.x;
          oy += p.off.y;
        }
        n.tx = n._bx + ox;
        n.ty = n._by + oy;
      });
      this.visible = vis;
      this.visSet = new Set(vis.map((n) => n.id));
    }

    /* Label placement relative to the node origin */
    labelSpec(n, x, y, ox, oy) {
      const r = n._r;
      const s = n._s;
      const gap = 6 * this.textScale;
      const open = isOpen(n);
      if (this.layout === "td") {
        if (open) return { rot: 0, x: 0, y: -(r + gap + s * 0.55), anchor: "middle" };
        return { rot: 90, x: r + gap, y: 0, anchor: "start" };
      }
      if (this.layout === "radial") {
        if (n === this.root) return { rot: 0, x: 0, y: r + gap + s * 0.6, anchor: "middle" };
        const a = Math.atan2(y - oy, x - ox);
        const right = Math.cos(a) >= -1e-6;
        const rot = (a * 180) / Math.PI + (right ? 0 : 180);
        const outward = !open;
        if (right === outward) return { rot, x: r + gap, y: 0, anchor: "start" };
        return { rot, x: -(r + gap), y: 0, anchor: "end" };
      }
      return { rot: 0, x: r + gap, y: 0, anchor: "start" };
    }

    applyLabel(n, d) {
      const L = this.labelSpec(n, n.x, n.y, this.root.x, this.root.y);
      const key = `${rd(L.rot)}|${L.x}|${L.y}|${L.anchor}|${n._w}`;
      if (d.lkey === key) return;
      d.lkey = key;
      d.lbl.setAttribute("transform", L.rot ? `rotate(${rd(L.rot)})` : "");
      d.text.setAttribute("x", L.x);
      d.text.setAttribute("y", L.y);
      d.text.setAttribute("text-anchor", L.anchor);
      const w = n._w;
      const bx = L.anchor === "start" ? L.x : L.anchor === "end" ? L.x - w : L.x - w / 2;
      d.box.setAttribute("x", rd(bx - 4));
      d.box.setAttribute("y", rd(L.y - n._s * 0.78));
      d.box.setAttribute("width", rd(w + 8));
      d.box.setAttribute("height", rd(n._s * 1.56));
    }

    linkPath(p, c) {
      const S = this.textScale;
      if (this.layout === "lr") {
        const sx = p.x + p._r + 6 * S + p._w + 9 * S;
        const ex = c.x - c._r - 3;
        const mx = (sx + ex) / 2;
        return `M${rd(sx)},${rd(p.y)}C${rd(mx)},${rd(p.y)} ${rd(mx)},${rd(c.y)} ${rd(ex)},${rd(c.y)}`;
      }
      if (this.layout === "td") {
        const sy = p.y + p._r + 3;
        const ey = c.y - (isOpen(c) ? c._r + 6 * S + c._s * 1.15 + 4 : c._r + 3);
        const my = (sy + ey) / 2;
        return `M${rd(p.x)},${rd(sy)}C${rd(p.x)},${rd(my)} ${rd(c.x)},${rd(my)} ${rd(c.x)},${rd(ey)}`;
      }
      const ox = this.root.x;
      const oy = this.root.y;
      const a1 = Math.atan2(c.y - oy, c.x - ox);
      const r1 = Math.hypot(c.x - ox, c.y - oy);
      const r0 = Math.hypot(p.x - ox, p.y - oy);
      const a0 = r0 < 1 ? a1 : Math.atan2(p.y - oy, p.x - ox);
      const rm = (r0 + r1) / 2;
      return `M${rd(p.x)},${rd(p.y)}C${rd(ox + Math.cos(a0) * rm)},${rd(oy + Math.sin(a0) * rm)} ${rd(ox + Math.cos(a1) * rm)},${rd(oy + Math.sin(a1) * rm)} ${rd(c.x)},${rd(c.y)}`;
    }

    /* ---------------------------------------------------------------- */
    /* Update cycle                                                      */
    /* ---------------------------------------------------------------- */

    update(o) {
      o = o || {};
      const animate = o.animate !== false && this.motion && !document.hidden;
      const anchor = o.anchor || null;
      const before = anchor ? { x: anchor.tx, y: anchor.ty } : null;
      if (this.anim) this.finishAnim();

      this.computeLayout();
      const vis = this.visible;

      vis.forEach((n) => {
        const d = this.nodeDom(n);
        if (!d.alive) {
          const src = n.parent && this.dom.get(n.parent.id) && this.dom.get(n.parent.id).alive ? n.parent : n.parent || n;
          if (this.exiting.has(n.id)) this.exiting.delete(n.id);
          else {
            n.x = src.x;
            n.y = src.y;
          }
          d.alive = true;
          d.g.classList.remove("exiting");
          if (animate) d.g.classList.add("entering");
          if (!d.g.parentNode) this.gNodes.appendChild(d.g);
          if (n.parent) {
            const l = this.link(n);
            l.classList.remove("exiting");
            if (animate) l.classList.add("entering");
          }
        }
        this.styleNode(n, d);
      });

      this.dom.forEach((d, id) => {
        if (d.alive && !this.visSet.has(id)) {
          d.alive = false;
          const n = this.byId.get(id);
          let a = n.parent;
          while (a && !this.visSet.has(a.id)) a = a.parent;
          this.exiting.set(id, { n, x: a ? a.tx : 0, y: a ? a.ty : 0 });
          d.g.classList.remove("entering");
          d.g.classList.add("exiting");
          const l = this.linkDom.get(id);
          if (l) {
            l.classList.remove("entering");
            l.classList.add("exiting");
          }
        }
      });

      let t1 = null;
      if (before) {
        t1 = { k: this.t.k, x: this.t.x + (before.x - anchor.tx) * this.t.k, y: this.t.y + (before.y - anchor.ty) * this.t.k };
      }

      this.pulseDirty = true;
      if (!animate) {
        vis.forEach((n) => {
          n.x = n.tx;
          n.y = n.ty;
        });
        if (t1) this.setTransform(t1);
        this.render(vis);
        this.cleanupExiting();
        this.afterSettle();
        return;
      }
      this.anim = {
        start: performance.now(),
        nodes: vis.map((n) => ({ n, x0: n.x, y0: n.y, x1: n.tx, y1: n.ty })),
        exit: Array.from(this.exiting.values()).map((e) => ({ n: e.n, x0: e.n.x, y0: e.n.y, x1: e.x, y1: e.y })),
        t0: t1 ? Object.assign({}, this.t) : null,
        t1,
      };
      /* rAF pauses in background tabs; make sure the transition always lands */
      clearTimeout(this.animSafety);
      this.animSafety = setTimeout(() => {
        if (this.anim) this.finishAnim();
      }, DURATION + 250);
      this.kick();
    }

    link(n) {
      let l = this.linkDom.get(n.id);
      if (!l) {
        l = el("path", { class: `link lk-${n.kind}`, "data-g": n.group, "data-bo": n.bo == null ? "na" : n.bo });
        this.gLinks.appendChild(l);
        this.linkDom.set(n.id, l);
      }
      return l;
    }

    render(list) {
      const radial = this.layout === "radial";
      list.forEach((n) => {
        const d = this.dom.get(n.id);
        if (!d) return;
        d.g.setAttribute("transform", `translate(${rd(n.x)},${rd(n.y)})`);
        if (radial || !d.lkey || d.lstate !== isOpen(n)) {
          d.lstate = isOpen(n);
          this.applyLabel(n, d);
        }
      });
      this.linkDom.forEach((l, id) => {
        const n = this.byId.get(id);
        if (!n.parent) return;
        const alive = this.visSet.has(id) || this.exiting.has(id);
        if (!alive) return;
        l.setAttribute("d", this.linkPath(n.parent, n));
      });
      if (this.trendLinks) this.renderTrendLinks();
      this.pulseDirty = true;
    }

    finishAnim() {
      const a = this.anim;
      if (!a) return;
      a.nodes.forEach((o) => {
        o.n.x = o.x1;
        o.n.y = o.y1;
      });
      if (a.t1) this.setTransform(a.t1);
      this.anim = null;
      this.render(this.visible);
      this.cleanupExiting();
      this.afterSettle();
    }

    cleanupExiting() {
      this.exiting.forEach((e, id) => {
        const d = this.dom.get(id);
        if (d && d.g.parentNode) d.g.parentNode.removeChild(d.g);
        const l = this.linkDom.get(id);
        if (l && l.parentNode) l.parentNode.removeChild(l);
        this.linkDom.delete(id);
        if (d) {
          d.lkey = null;
          d.g.classList.remove("exiting");
        }
      });
      this.exiting.clear();
      this.dom.forEach((d) => d.g.classList.remove("entering"));
      this.linkDom.forEach((l) => l.classList.remove("entering"));
      this.svg.classList.remove("moving");
    }

    afterSettle() {
      this.drawMinimap();
      this.applyStateClasses();
      if (this.opts.onLayout) this.opts.onLayout();
    }

    tick(now) {
      this.raf = 0;
      let again = false;
      if (this.anim) {
        const a = this.anim;
        const p = clamp((now - a.start) / DURATION, 0, 1);
        const e = easeInOut(p);
        const mv = (o) => {
          o.n.x = o.x0 + (o.x1 - o.x0) * e;
          o.n.y = o.y0 + (o.y1 - o.y0) * e;
        };
        a.nodes.forEach(mv);
        a.exit.forEach(mv);
        if (a.t1) {
          this.setTransform({
            k: a.t0.k,
            x: a.t0.x + (a.t1.x - a.t0.x) * e,
            y: a.t0.y + (a.t1.y - a.t0.y) * e,
          });
        }
        this.render(a.nodes.map((o) => o.n).concat(a.exit.map((o) => o.n)));
        if (p >= 1) this.finishAnim();
        else again = true;
      }
      if (this.tAnim) {
        const z = this.tAnim;
        const p = clamp((now - z.start) / z.dur, 0, 1);
        const e = easeInOut(p);
        this.setTransform({
          k: z.from.k + (z.to.k - z.from.k) * e,
          x: z.from.x + (z.to.x - z.from.x) * e,
          y: z.from.y + (z.to.y - z.from.y) * e,
        });
        if (p >= 1) this.tAnim = null;
        else again = true;
      }
      if (this.pulse && this.selected && this.selected !== this.root) {
        this.renderPulse(now);
        again = true;
      } else {
        this.hidePulse();
      }
      if (again) this.kick();
    }

    kick() {
      if (!this.raf) this.raf = requestAnimationFrame((t) => this.tick(t));
    }

    /* ---------------------------------------------------------------- */
    /* Pulse from the root to the selected node                          */
    /* ---------------------------------------------------------------- */

    chain(n) {
      const c = [];
      for (let p = n; p; p = p.parent) c.unshift(p);
      return c;
    }

    renderPulse(now) {
      if (this.pulseDirty) {
        const ch = this.chain(this.selected).filter((n) => this.visSet.has(n.id));
        let d = "";
        for (let i = 1; i < ch.length; i++) d += this.linkPath(ch[i - 1], ch[i]);
        this.pulseTrack.setAttribute("d", d || "M0,0");
        this.pulseLen = d ? this.pulseTrack.getTotalLength() : 0;
        this.pulseDirty = false;
      }
      const len = this.pulseLen;
      if (!len) return this.hidePulse();
      if (!this.pulseT0) this.pulseT0 = now;
      const dur = clamp(len / 1.25, 480, 1400);
      const rest = 520;
      const t = ((now - this.pulseT0) % (dur + rest)) / dur;
      this.pulseDots.forEach((c, i) => {
        const ti = t - i * 0.05;
        if (ti < 0 || ti > 1) {
          c.setAttribute("opacity", 0);
          return;
        }
        const pt = this.pulseTrack.getPointAtLength(len * easeOut(ti));
        c.setAttribute("cx", rd(pt.x));
        c.setAttribute("cy", rd(pt.y));
        c.setAttribute("opacity", rd((1 - i * 0.26) * Math.min(1, ti * 8)));
      });
      const s = this.selected;
      if (t > 1) {
        const q = clamp((t - 1) * (dur / rest), 0, 1);
        this.ripple.setAttribute("cx", rd(s.x));
        this.ripple.setAttribute("cy", rd(s.y));
        this.ripple.setAttribute("r", rd(s._r + 3 + q * 14));
        this.ripple.setAttribute("opacity", rd((1 - q) * 0.7));
      } else this.ripple.setAttribute("opacity", 0);
    }

    hidePulse() {
      this.pulseDots.forEach((c) => c.setAttribute("opacity", 0));
      this.ripple.setAttribute("opacity", 0);
    }

    /* ---------------------------------------------------------------- */
    /* Selection, search and overlays                                    */
    /* ---------------------------------------------------------------- */

    revealAncestors(n) {
      let changed = false;
      for (let p = n.parent; p; p = p.parent) {
        if (!p.expanded) {
          p.expanded = true;
          changed = true;
        }
      }
      return changed;
    }

    select(n, o) {
      o = o || {};
      if (!n) return;
      let changed = this.revealAncestors(n);
      if (o.expand && hasKids(n) && !n.expanded) {
        n.expanded = true;
        changed = true;
      }
      this.selected = n;
      this.pulseT0 = 0;
      if (changed) this.update({ anchor: o.focus ? null : o.anchorSelf ? n : null });
      else this.applyStateClasses();
      this.pulseDirty = true;
      if (o.focus) this.focus(n, o.zoom);
      if (this.opts.onSelect) this.opts.onSelect(n);
      this.kick();
    }

    applyStateClasses() {
      const sel = this.selected;
      const onPath = new Set(sel ? this.chain(sel).map((n) => n.id) : []);
      const related = new Set();
      if (sel) {
        if (sel.relatedCases) sel.relatedCases.forEach((id) => related.add(id));
        if (sel.kind === "case") {
          this.all.forEach((n) => {
            if (n.trend && n.trend.cases.includes(sel.id)) related.add(n.id);
          });
        }
      }
      this.dom.forEach((d, id) => {
        d.g.classList.toggle("selected", sel && sel.id === id);
        d.g.classList.toggle("on-path", onPath.has(id));
        d.g.classList.toggle("related", related.has(id));
      });
      this.linkDom.forEach((l, id) => l.classList.toggle("on-path", onPath.has(id) && id !== "root"));
      this.svg.classList.toggle("has-sel", !!sel && sel !== this.root);
      if (sel) {
        this.gPulse.setAttribute("data-g", sel.group);
        this.gPulse.setAttribute("data-bo", sel.bo == null ? "na" : sel.bo);
      }
      if (this.trendLinks) this.renderTrendLinks();
    }

    toggle(n, anchor) {
      if (!hasKids(n)) return;
      n.expanded = !n.expanded;
      this.update({ anchor: anchor === false ? null : n });
    }

    setSubtree(n, open) {
      (function walk(x) {
        if (hasKids(x)) {
          x.expanded = open || x === n ? open : x.expanded;
          if (open) x.children.forEach(walk);
        }
      })(n);
      if (!open) n.expanded = false;
      this.update({ anchor: n });
    }

    expandAll() {
      this.all.forEach((n) => {
        if (hasKids(n)) n.expanded = true;
      });
      this.update();
      this.fit(true, 0.6);
    }

    collapseAll() {
      this.all.forEach((n) => {
        n.expanded = n === this.root;
      });
      if (this.selected && !this.visibleAfterCollapse(this.selected)) this.selected = this.root;
      this.update();
      this.fit();
      if (this.opts.onSelect) this.opts.onSelect(this.selected);
    }

    visibleAfterCollapse(n) {
      for (let p = n.parent; p; p = p.parent) if (!p.expanded) return false;
      return true;
    }

    expandToLevel(level) {
      this.all.forEach((n) => {
        if (hasKids(n)) n.expanded = n.level < level;
      });
      if (this.selected) this.revealAncestors(this.selected);
      this.update();
      this.fit(true, level >= 3 ? 0.6 : 0);
    }

    setSearch(ids) {
      this.matches = ids && ids.size ? ids : ids ? new Set() : null;
      this.svg.classList.toggle("searching", !!ids);
      this.dom.forEach((d, id) => d.g.classList.toggle("match", !!(this.matches && this.matches.has(id))));
    }

    revealMany(nodes) {
      let changed = false;
      nodes.forEach((n) => {
        if (this.revealAncestors(n)) changed = true;
      });
      if (changed) {
        this.update();
        this.fit();
      }
    }

    setTrendLinks(on) {
      this.trendLinks = on;
      if (!on) this.gTrend.innerHTML = "";
      else this.renderTrendLinks();
    }

    renderTrendLinks() {
      const g = this.gTrend;
      const want = [];
      this.visible.forEach((n) => {
        if (!n.trend) return;
        n.trend.cases.forEach((cid) => {
          const c = this.byId.get(cid);
          if (c && this.visSet.has(cid)) want.push([n, c]);
        });
      });
      while (g.childNodes.length > want.length) g.removeChild(g.lastChild);
      while (g.childNodes.length < want.length) el("path", { class: "tlink" }, g);
      const sel = this.selected;
      want.forEach(([a, b], i) => {
        const p = g.childNodes[i];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const bend = 0.18;
        const cx = mx - dy * bend;
        const cy = my + dx * bend;
        p.setAttribute("d", `M${rd(a.x)},${rd(a.y)}Q${rd(cx)},${rd(cy)} ${rd(b.x)},${rd(b.y)}`);
        p.setAttribute("data-g", b.group);
        const hot = sel && (sel === a || sel === b || this.hovered === a || this.hovered === b);
        p.classList.toggle("hot", !!hot);
      });
    }

    /* ---------------------------------------------------------------- */
    /* Settings                                                          */
    /* ---------------------------------------------------------------- */

    setLayout(name) {
      if (name === this.layout) return;
      this.layout = name;
      this.all.forEach((n) => (n.off = { x: 0, y: 0 }));
      this.dom.forEach((d) => (d.lkey = null));
      this.svg.classList.add("moving");
      this.update();
      this.fit(true);
    }

    setColorBy(mode) {
      this.colorBy = mode;
      this.svg.classList.toggle("color-group", mode === "group");
      this.svg.classList.toggle("color-breakout", mode === "breakout");
      this.drawMinimap();
    }

    setTextScale(s) {
      this.textScale = s;
      this.dom.forEach((d) => (d.lkey = null));
      this.update({ animate: false });
      this.fit(false);
    }

    setPulse(on) {
      this.pulse = on;
      this.kick();
    }

    resetPositions() {
      this.all.forEach((n) => (n.off = { x: 0, y: 0 }));
      this.update();
      this.fit();
    }

    remeasure() {
      widthCache.clear();
      this.dom.forEach((d) => (d.lkey = null));
      this.update({ animate: false });
    }

    /* ---------------------------------------------------------------- */
    /* Viewport                                                          */
    /* ---------------------------------------------------------------- */

    size() {
      const r = this.host.getBoundingClientRect();
      return { w: r.width || 800, h: r.height || 600 };
    }

    setTransform(t) {
      this.t = { x: t.x, y: t.y, k: clamp(t.k, K_MIN, K_MAX) };
      this.viewport.setAttribute("transform", `translate(${rd(this.t.x)},${rd(this.t.y)}) scale(${this.t.k.toFixed(4)})`);
      const k = this.t.k;
      this.svg.classList.toggle("lod-1", k < 0.5);
      this.svg.classList.toggle("lod-2", k < 0.3);
      const grid = 24 * k;
      this.host.style.backgroundSize = grid >= 9 ? `${grid}px ${grid}px` : "0 0";
      this.host.style.backgroundPosition = `${rd(this.t.x)}px ${rd(this.t.y)}px`;
      this.updateMiniView();
      if (this.opts.onTransform) this.opts.onTransform(this.t);
    }

    animateTo(to, dur) {
      if (!this.motion || document.hidden) return this.setTransform(to);
      const d = dur || 600;
      this.tAnim = { start: performance.now(), from: Object.assign({}, this.t), to, dur: d };
      clearTimeout(this.zoomSafety);
      this.zoomSafety = setTimeout(() => {
        if (this.tAnim && this.tAnim.to === to) {
          this.tAnim = null;
          this.setTransform(to);
        }
      }, d + 250);
      this.kick();
    }

    zoomAround(f, px, py, animated) {
      this.autoFit = false;
      const k = clamp(this.t.k * f, K_MIN, K_MAX);
      const gx = (px - this.t.x) / this.t.k;
      const gy = (py - this.t.y) / this.t.k;
      const to = { k, x: px - gx * k, y: py - gy * k };
      if (animated) this.animateTo(to, 320);
      else this.setTransform(to);
    }

    zoomBy(f) {
      const { w, h } = this.size();
      this.zoomAround(f, w / 2, h / 2, true);
    }

    bounds(list, useTarget) {
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      const add = (x, y) => {
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      };
      const ox = useTarget ? this.root.tx : this.root.x;
      const oy = useTarget ? this.root.ty : this.root.y;
      list.forEach((n) => {
        const x = useTarget ? n.tx : n.x;
        const y = useTarget ? n.ty : n.y;
        const m = (n._r || 4) + 2;
        add(x - m, y - m);
        add(x + m, y + m);
        if (!n._w) return;
        const L = this.labelSpec(n, x, y, ox, oy);
        const sx = L.anchor === "start" ? L.x : L.anchor === "end" ? L.x - n._w : L.x - n._w / 2;
        const a = (L.rot * Math.PI) / 180;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const h = n._s * 0.8;
        [
          [sx, L.y - h],
          [sx + n._w, L.y - h],
          [sx, L.y + h],
          [sx + n._w, L.y + h],
        ].forEach(([lx, ly]) => add(x + lx * cos - ly * sin, y + lx * sin + ly * cos));
      });
      if (!isFinite(x0)) return { x: -50, y: -50, w: 100, h: 100 };
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    }

    /* Fit everything; with minK, never zoom out past minK and instead frame
       the selection, clamped so the view stays on the drawing. */
    fit(animated, minK) {
      const b = this.bounds(this.visible, true);
      const { w, h } = this.size();
      const P = this.opts.padding ? this.opts.padding(w, h) : { t: 48, r: 48, b: 48, l: 48 };
      const aw = Math.max(w - P.l - P.r, 80);
      const ah = Math.max(h - P.t - P.b, 80);
      let k = clamp(Math.min(aw / Math.max(b.w, 1), ah / Math.max(b.h, 1)), K_MIN, 1.35);
      let cx = b.x + b.w / 2;
      let cy = b.y + b.h / 2;
      if (minK && k < minK) {
        k = minK;
        const f = this.selected && this.visSet.has(this.selected.id) ? this.selected : this.root;
        const hw = aw / 2 / k;
        const hh = ah / 2 / k;
        if (b.w > hw * 2) cx = clamp(f.tx, b.x + hw, b.x + b.w - hw);
        if (b.h > hh * 2) cy = clamp(f.ty, b.y + hh, b.y + b.h - hh);
      }
      const to = { k, x: P.l + aw / 2 - cx * k, y: P.t + ah / 2 - cy * k };
      if (animated === false) this.setTransform(to);
      else this.animateTo(to, 650);
      this.autoFit = !minK;
    }

    focus(n, zoom) {
      this.autoFit = false;
      const { w, h } = this.size();
      const k = zoom ? clamp(Math.max(this.t.k, zoom), K_MIN, K_MAX) : Math.max(this.t.k, 0.85);
      let x = n.tx;
      let y = n.ty;
      if (this.layout === "lr") x += Math.min(n._w || 0, 240) / 2;
      this.animateTo({ k, x: w / 2 - x * k, y: h / 2 - y * k }, 650);
    }

    ensureVisible(n) {
      const { w, h } = this.size();
      const sx = n.tx * this.t.k + this.t.x;
      const sy = n.ty * this.t.k + this.t.y;
      const m = 80;
      if (sx < m || sy < m || sx > w - m || sy > h - m) this.focus(n);
    }

    /* ---------------------------------------------------------------- */
    /* Minimap                                                           */
    /* ---------------------------------------------------------------- */

    drawMinimap() {
      if (!this.mini) return;
      const b = this.bounds(this.visible, false);
      const pad = Math.max(b.w, b.h) * 0.06 + 20;
      this.miniBox = { x: b.x - pad, y: b.y - pad, w: b.w + pad * 2, h: b.h + pad * 2 };
      this.mini.setAttribute("viewBox", `${rd(this.miniBox.x)} ${rd(this.miniBox.y)} ${rd(this.miniBox.w)} ${rd(this.miniBox.h)}`);
      let d = "";
      this.visible.forEach((n) => {
        if (n.parent) d += `M${rd(n.parent.x)},${rd(n.parent.y)}L${rd(n.x)},${rd(n.y)}`;
      });
      this.miniLinks.setAttribute("d", d);
      const unit = Math.max(this.miniBox.w, this.miniBox.h) / 180;
      const g = this.miniNodes;
      while (g.childNodes.length > this.visible.length) g.removeChild(g.lastChild);
      while (g.childNodes.length < this.visible.length) el("circle", {}, g);
      this.visible.forEach((n, i) => {
        const c = g.childNodes[i];
        c.setAttribute("cx", rd(n.x));
        c.setAttribute("cy", rd(n.y));
        c.setAttribute("r", rd(unit * (n.kind === "item" ? 1.1 : n.kind === "facet" ? 1.5 : 2.2)));
        c.setAttribute("data-g", n.group);
        c.setAttribute("data-bo", n.bo == null ? "na" : n.bo);
      });
      this.miniView.setAttribute("stroke-width", rd(unit * 1.2));
      this.updateMiniView();
    }

    updateMiniView() {
      if (!this.mini || !this.miniBox) return;
      const { w, h } = this.size();
      const k = this.t.k;
      this.miniView.setAttribute("x", rd(-this.t.x / k));
      this.miniView.setAttribute("y", rd(-this.t.y / k));
      this.miniView.setAttribute("width", rd(w / k));
      this.miniView.setAttribute("height", rd(h / k));
    }

    miniPoint(e) {
      const r = this.mini.getBoundingClientRect();
      const box = this.miniBox;
      const s = Math.min(r.width / box.w, r.height / box.h);
      const offX = (r.width - box.w * s) / 2;
      const offY = (r.height - box.h * s) / 2;
      return { x: box.x + (e.clientX - r.left - offX) / s, y: box.y + (e.clientY - r.top - offY) / s };
    }

    /* ---------------------------------------------------------------- */
    /* Input                                                             */
    /* ---------------------------------------------------------------- */

    bind() {
      const s = this.svg;
      s.addEventListener("wheel", (e) => this.onWheel(e), { passive: false });
      s.addEventListener("pointerdown", (e) => this.onDown(e));
      s.addEventListener("pointermove", (e) => this.onMove(e));
      s.addEventListener("pointerup", (e) => this.onUp(e));
      s.addEventListener("pointercancel", (e) => this.onUp(e));
      s.addEventListener("dblclick", (e) => {
        if (e.target.closest(".node")) return;
        const p = this.local(e);
        this.zoomAround(1.6, p.x, p.y, true);
      });
      s.addEventListener("pointerover", (e) => {
        const g = e.target.closest && e.target.closest(".node");
        const n = g ? this.byId.get(g.dataset.id) : null;
        if (n !== this.hovered) this.setHover(n, e);
      });
      s.addEventListener("pointerleave", () => this.setHover(null));
      s.addEventListener("keydown", (e) => this.onKey(e));

      if (this.mini) {
        let dragging = false;
        const go = (e) => {
          const p = this.miniPoint(e);
          const { w, h } = this.size();
          this.setTransform({ k: this.t.k, x: w / 2 - p.x * this.t.k, y: h / 2 - p.y * this.t.k });
        };
        this.mini.addEventListener("pointerdown", (e) => {
          dragging = true;
          this.mini.setPointerCapture(e.pointerId);
          go(e);
        });
        this.mini.addEventListener("pointermove", (e) => dragging && go(e));
        this.mini.addEventListener("pointerup", () => (dragging = false));
      }

      let last = this.size();
      new ResizeObserver(() => {
        const now = this.size();
        if (now.w === last.w && now.h === last.h) return;
        if (this.autoFit && !this.tAnim) this.fit(false);
        else this.setTransform({ k: this.t.k, x: this.t.x + (now.w - last.w) / 2, y: this.t.y + (now.h - last.h) / 2 });
        last = now;
      }).observe(this.host);
    }

    local(e) {
      const r = this.svg.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    setHover(n, e) {
      if (this.hovered) {
        const d = this.dom.get(this.hovered.id);
        if (d) d.g.classList.remove("hover");
      }
      this.hovered = n;
      if (n) {
        const d = this.dom.get(n.id);
        if (d) d.g.classList.add("hover");
      }
      if (this.trendLinks) this.renderTrendLinks();
      if (this.opts.onHover) this.opts.onHover(n, e);
    }

    onWheel(e) {
      e.preventDefault();
      this.tAnim = null;
      const unit = e.deltaMode === 1 ? 0.05 : e.deltaMode === 2 ? 1 : 0.002;
      const f = Math.pow(2, -e.deltaY * unit * (e.ctrlKey ? 4 : 1));
      const p = this.local(e);
      this.zoomAround(f, p.x, p.y, false);
    }

    onDown(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      this.svg.focus({ preventScroll: true });
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try {
        this.svg.setPointerCapture(e.pointerId);
      } catch (err) {
        /* capture is optional */
      }
      this.tAnim = null;
      if (this.pointers.size === 2) {
        const [a, b] = Array.from(this.pointers.values());
        this.pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y), k0: this.t.k };
        this.drag = null;
        return;
      }
      const g = e.target.closest(".node");
      const n = g ? this.byId.get(g.dataset.id) : null;
      this.drag = { n, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, moved: false };
    }

    onMove(e) {
      if (!this.pointers.has(e.pointerId)) return;
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.pinch && this.pointers.size === 2) {
        const [a, b] = Array.from(this.pointers.values());
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const r = this.svg.getBoundingClientRect();
        const cx = (a.x + b.x) / 2 - r.left;
        const cy = (a.y + b.y) / 2 - r.top;
        this.zoomAround((this.pinch.k0 * d) / this.pinch.d0 / this.t.k, cx, cy, false);
        return;
      }
      const dr = this.drag;
      if (!dr) return;
      if (!dr.moved && Math.hypot(e.clientX - dr.sx, e.clientY - dr.sy) < 4) return;
      if (!dr.moved) {
        dr.moved = true;
        if (this.anim) this.finishAnim();
        this.svg.classList.add(dr.n ? "dragging-node" : "panning");
        if (this.opts.onHover) this.opts.onHover(null);
      }
      const dx = e.clientX - dr.lx;
      const dy = e.clientY - dr.ly;
      dr.lx = e.clientX;
      dr.ly = e.clientY;
      if (!dr.n) {
        this.autoFit = false;
        this.setTransform({ k: this.t.k, x: this.t.x + dx, y: this.t.y + dy });
      }
      else this.moveBranch(dr.n, dx / this.t.k, dy / this.t.k);
    }

    onUp(e) {
      this.pointers.delete(e.pointerId);
      if (this.pinch) {
        if (this.pointers.size < 2) this.pinch = null;
        this.drag = null;
        return;
      }
      const dr = this.drag;
      this.drag = null;
      this.svg.classList.remove("panning", "dragging-node");
      if (!dr) return;
      if (dr.moved) {
        if (dr.n) this.drawMinimap();
        return;
      }
      if (dr.n) this.onNodeClick(dr.n, e);
    }

    moveBranch(n, dx, dy) {
      n.off.x += dx;
      n.off.y += dy;
      (function walk(x, self) {
        x.x += dx;
        x.y += dy;
        x.tx += dx;
        x.ty += dy;
        if (isOpen(x)) x.children.forEach((c) => walk(c, self));
      })(n, this);
      this.render(this.visible);
    }

    onNodeClick(n, e) {
      if (e && (e.shiftKey || e.altKey)) {
        const fully = (function full(x) {
          return !hasKids(x) || (x.expanded && x.children.every(full));
        })(n);
        this.selected = n;
        this.setSubtree(n, !fully);
        if (this.opts.onSelect) this.opts.onSelect(n);
        this.pulseT0 = 0;
        this.kick();
        return;
      }
      if (this.selected === n) {
        if (hasKids(n)) this.toggle(n);
        return;
      }
      const expand = hasKids(n) && !n.expanded;
      if (expand) n.expanded = true;
      this.selected = n;
      this.pulseT0 = 0;
      if (expand) this.update({ anchor: n });
      else this.applyStateClasses();
      this.pulseDirty = true;
      if (this.opts.onSelect) this.opts.onSelect(n);
      this.kick();
    }

    onKey(e) {
      const n = this.selected || this.root;
      const sib = (dir) => {
        if (!n.parent) return null;
        const arr = n.parent.children;
        const i = arr.indexOf(n) + dir;
        return arr[i] || null;
      };
      let target = null;
      switch (e.key) {
        case "ArrowRight":
          if (hasKids(n) && !n.expanded) this.toggle(n);
          else if (isOpen(n)) target = n.children[0];
          break;
        case "ArrowLeft":
          if (isOpen(n) && n !== this.root) this.toggle(n);
          else if (n.parent) target = n.parent;
          break;
        case "ArrowDown":
          target = sib(1);
          break;
        case "ArrowUp":
          target = sib(-1);
          break;
        case "Enter":
        case " ":
          if (hasKids(n)) this.toggle(n);
          break;
        default:
          return;
      }
      e.preventDefault();
      if (target) {
        this.select(target);
        this.ensureVisible(target);
      }
    }

    /* ---------------------------------------------------------------- */
    /* Export                                                            */
    /* ---------------------------------------------------------------- */

    exportSVG() {
      const b = this.bounds(this.visible, false);
      const pad = 40;
      const clone = this.svg.cloneNode(true);
      const src = this.svg.querySelectorAll("*");
      const dst = clone.querySelectorAll("*");
      const props = ["fill", "fill-opacity", "stroke", "stroke-width", "stroke-opacity", "stroke-dasharray", "opacity", "font-family", "font-size", "font-weight", "paint-order", "stroke-linejoin", "stroke-linecap", "dominant-baseline", "display"];
      src.forEach((node, i) => {
        const cs = getComputedStyle(node);
        dst[i].setAttribute("style", props.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(";"));
      });
      clone.querySelectorAll(".pulse, .hit, .lbl-hit").forEach((x) => x.remove());
      const vp = clone.querySelector(".viewport");
      vp.removeAttribute("transform");
      const W = Math.ceil(b.w + pad * 2);
      const H = Math.ceil(b.h + pad * 2);
      clone.setAttribute("xmlns", NS);
      clone.setAttribute("viewBox", `${rd(b.x - pad)} ${rd(b.y - pad)} ${W} ${H}`);
      clone.setAttribute("width", W);
      clone.setAttribute("height", H);
      clone.removeAttribute("class");
      clone.removeAttribute("tabindex");
      const bg = getComputedStyle(this.host).getPropertyValue("--bg").trim() || "#ffffff";
      const rect = el("rect", { x: rd(b.x - pad), y: rd(b.y - pad), width: W, height: H, fill: bg });
      clone.insertBefore(rect, clone.firstChild);
      return { svg: new XMLSerializer().serializeToString(clone), w: W, h: H };
    }

    exportPNG(scale) {
      const { svg, w, h } = this.exportSVG();
      const s = Math.min(scale || 2, 12000 / Math.max(w, h));
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = Math.round(w * s);
          c.height = Math.round(h * s);
          const ctx = c.getContext("2d");
          ctx.scale(s, s);
          ctx.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);
          c.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))), "image/png");
        };
        img.onerror = reject;
        img.src = url;
      });
    }
  }

  IO.Graph = Graph;
})();
