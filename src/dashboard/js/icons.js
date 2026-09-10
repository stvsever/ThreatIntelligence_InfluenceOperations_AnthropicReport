/* Minimal stroke icon set (24px grid, currentColor). */
(function () {
  "use strict";
  const IO = (window.IO = window.IO || {});

  const P = {
    lr: '<circle cx="4.5" cy="12" r="2"/><path d="M6.5 12H10c2.5 0 2.5-6 5-6h4.5M10 12h9.5M10 12c2.5 0 2.5 6 5 6h4.5"/>',
    td: '<circle cx="12" cy="4.5" r="2"/><path d="M12 6.5V10c0 2.5-6 2.5-6 5v4.5M12 10v9.5M12 10c0 2.5 6 2.5 6 5v4.5"/>',
    radial: '<circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="8.5" stroke-dasharray="2.2 2.8"/><path d="M12 10V3.5M13.8 13l5.6 3.2M10.2 13l-5.6 3.2"/>',
    plus: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8.5v7M8.5 12h7"/>',
    minus: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12h7"/>',
    fit: '<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/><circle cx="12" cy="12" r="2.5"/>',
    zoomIn: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.4-4.4M11 8.2v5.6M8.2 11h5.6"/>',
    zoomOut: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.4-4.4M8.2 11h5.6"/>',
    reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5V8H8"/>',
    fullscreen: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14"/>',
    sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 2.8v2M12 19.2v2M4.6 4.6 6 6M18 18l1.4 1.4M2.8 12h2M19.2 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
    moon: '<path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.4-4.4"/>',
    external: '<path d="M14 4h6v6M20 4l-8.5 8.5M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    left: '<path d="M15 5.5 8.5 12l6.5 6.5"/>',
    right: '<path d="M9 5.5 15.5 12 9 18.5"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.7 9.6a2.4 2.4 0 1 1 3.4 2.2c-.7.3-1.1.9-1.1 1.6v.4"/><path d="M12 16.6v.2"/>',
    minimap: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><rect x="11.5" y="10.5" width="6" height="5" rx="1"/>',
    links: '<circle cx="6" cy="7" r="2"/><circle cx="18" cy="17" r="2"/><path d="M8 7.5c5 .5 3 9 8 9" stroke-dasharray="1.6 2.4"/>',
    pulse: '<path d="M3 12h4l2.2-5 4.2 10 2.2-5H21"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9.2" cy="10" r="1.5"/><path d="M20 15.5 15 11l-8.5 8"/>',
    page: '<path d="M7 3.5h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z"/><path d="M14 3.5V8h4M9 12.5h6M9 16h6"/>',
    target: '<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="1.8"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
    link: '<path d="M10.2 13.8a3.8 3.8 0 0 0 5.4 0l3-3a3.8 3.8 0 0 0-5.4-5.4l-1 1"/><path d="M13.8 10.2a3.8 3.8 0 0 0-5.4 0l-3 3a3.8 3.8 0 0 0 5.4 5.4l1-1"/>',
    panel: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M14.5 4.5v15"/>',
    github: '<path d="M9 19c-4 1.2-4-2-5.6-2.4M14.6 21v-3.3a2.9 2.9 0 0 0-.8-2.2c2.7-.3 5.5-1.3 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.3 1.3a11.4 11.4 0 0 0-6 0C6.3 2.8 5.3 3.1 5.3 3.1a4.3 4.3 0 0 0-.1 3.2A4.7 4.7 0 0 0 3.9 9.5c0 4.7 2.8 5.7 5.5 6a2.9 2.9 0 0 0-.8 2.2V21"/>',
  };

  IO.icon = function (name, size) {
    const s = size || 16;
    return `<svg class="icon" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ""}</svg>`;
  };

  IO.hydrateIcons = function (scope) {
    (scope || document).querySelectorAll("[data-icon]").forEach((el) => {
      el.innerHTML = IO.icon(el.dataset.icon, Number(el.dataset.size) || 16);
      el.removeAttribute("data-icon");
    });
  };
})();
