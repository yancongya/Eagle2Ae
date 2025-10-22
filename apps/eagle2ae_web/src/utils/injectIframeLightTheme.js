// Inject a light theme into a same-origin iframe without touching source files
// The rules are conservative but cover text, major containers, code blocks, and common UI parts.

const INJECT_STYLE_ID = "__ae_eagle_injected_light_theme__";

const LIGHT_THEME_CSS = `
:root { color-scheme: light; }
html, body { background-color: #ffffff !important; color: #111827 !important; }

/* Text colors */
h1,h2,h3,h4,h5,h6,p,span,li,dt,dd,th,td,label,small,div { color: #111827 !important; }
a { color: #2563eb !important; }

/* Code and preformatted */
pre, code, kbd, samp { background-color: #f3f4f6 !important; color: #111827 !important; }

/* Common containers */
header, main, section, aside, footer, nav, article { background-color: #ffffff !important; }

/* Borders */
hr, table, th, td, .card, .panel, .section, .box, .wrapper { border-color: #e5e7eb !important; }

/* Tables */
table { background-color: #ffffff !important; }
thead { background-color: #f8fafc !important; }

/* Form controls */
input, textarea, select { background-color: #ffffff !important; color: #111827 !important; border-color: #d1d5db !important; }
button { background-color: #f3f4f6 !important; color: #111827 !important; border-color: #d1d5db !important; }

/* Eagle-specific sections */
.status-section, .files-section, .actions-section, .log-section { background-color: #f9fafb !important; border-color: #e5e7eb !important; }
.file-item { background-color: #ffffff !important; border-left-color: #3b82f6 !important; }
.file-type, .files-count { background-color: #e5e7eb !important; color: #111827 !important; }
.log-output { background-color: #f3f4f6 !important; color: #111827 !important; }
.status-value.connected { background-color: #dcfce7 !important; color: #166534 !important; }
.status-value.disconnected, .status-value.error { background-color: #fee2e2 !important; color: #991b1b !important; }
.title-settings-btn { color: #6b7280 !important; }
.bottom-sticky { background: linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0)) !important; }

/* AE-specific containers */
.header { background-color: #f8fafc !important; border-color: #e5e7eb !important; }
.title, .title a { color: #2563eb !important; }
.hash { color: #374151 !important; }
.content, .container, .panel { background-color: #ffffff !important; }
.output, .log { background-color: #f3f4f6 !important; color: #111827 !important; }
`;

export function injectLightThemeIntoIframe(iframe) {
  if (!iframe) return;
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    let styleEl = doc.getElementById(INJECT_STYLE_ID);
    if (!styleEl) {
      styleEl = doc.createElement("style");
      styleEl.id = INJECT_STYLE_ID;
      doc.head.appendChild(styleEl);
    }
    styleEl.textContent = LIGHT_THEME_CSS;

    // Ensure class-based light theme overrides take effect in the embedded page
    const rootEl = doc.documentElement;
    const bodyEl = doc.body;
    rootEl?.classList.remove('dark');
    bodyEl?.classList.remove('dark');
    rootEl?.classList.add('theme-light');
    bodyEl?.classList.add('theme-light');
  } catch (_) {
    // Likely cross-origin or not yet ready
  }
}

export function removeLightThemeFromIframe(iframe) {
  if (!iframe) return;
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    const styleEl = doc.getElementById(INJECT_STYLE_ID);
    if (styleEl) styleEl.remove();

    // Restore original dark class if the embedded page relies on it
    const rootEl = doc.documentElement;
    const bodyEl = doc.body;
    rootEl?.classList.remove('theme-light');
    bodyEl?.classList.remove('theme-light');
    rootEl?.classList.add('dark');
    bodyEl?.classList.add('dark');
  } catch (_) {
    // Ignore
  }
}