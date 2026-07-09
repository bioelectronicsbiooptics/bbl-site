/* =====================================================================
   AMSL static-site generator
   Usage:  node tools/build.mjs
   Emits:  /index.html, /en/*.html, /ko/*.html  (pure static, no runtime build)
   ===================================================================== */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  site, pages, ui, researchAreas, publications,
  members, positions, courses, contactInfo,
} from "./content.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fileFor = (key) => pages.find((p) => p.key === key).file;

/* ---------------- SVG assets ---------------- */
const I = {
  logo: `<svg class="brand__mark" viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="1" y="1" width="38" height="38" rx="11" fill="url(#lg)"/><path d="M13 10c0 6 14 8 14 14M27 10c0 6-14 8-14 14M14 13h12M14 19h12M14 25h12" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".95"/><defs><linearGradient id="lg" x1="1" y1="1" x2="39" y2="39"><stop stop-color="#0e7c86"/><stop offset="1" stop-color="#1b7fb0"/></linearGradient></defs></svg>`,
  sun: `<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>`,
  moon: `<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5Z"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  scholar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 2 9l10 5 10-5-10-5Z"/><path d="M6 11v4.5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5V11M22 9v5"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.3 8.6h3.28V21H3.3V8.6ZM9.3 8.6h3.14v1.7h.05c.44-.83 1.5-1.7 3.1-1.7 3.31 0 3.92 2.18 3.92 5.02V21h-3.28v-5.72c0-1.36-.02-3.12-1.9-3.12-1.9 0-2.19 1.48-2.19 3.02V21H9.3V8.6Z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
  external: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>`,
  building: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M8 7h4M8 11h4M8 15h4"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>`,
  discord: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.369A19.79 19.79 0 0 0 15.432 3c-.21.375-.455.88-.623 1.28a18.27 18.27 0 0 0-5.618 0A12.6 12.6 0 0 0 8.568 3 19.74 19.74 0 0 0 3.68 4.37C.533 9.046-.32 13.58.099 18.057A19.9 19.9 0 0 0 6.11 21c.418-.57.79-1.176 1.11-1.814a12.9 12.9 0 0 1-1.748-.834c.147-.108.29-.22.428-.335a14.2 14.2 0 0 0 12.2 0c.14.116.282.227.428.335-.558.33-1.143.61-1.75.834.32.638.692 1.244 1.11 1.814a19.85 19.85 0 0 0 6.011-2.943c.492-5.19-.838-9.68-3.51-13.688ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.42 0-1.334.955-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.335-.955 2.42-2.157 2.42Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.42 0-1.334.955-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.335-.946 2.42-2.157 2.42Z"/></svg>`,
  github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.56 9.56 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.507a2.79 2.79 0 0 0-1.96-1.98C19.8 4.06 12 4.06 12 4.06s-7.8 0-9.54.467A2.79 2.79 0 0 0 .5 6.507 29.1 29.1 0 0 0 .03 12a29.1 29.1 0 0 0 .47 5.493 2.79 2.79 0 0 0 1.96 1.98C4.2 19.94 12 19.94 12 19.94s7.8 0 9.54-.467a2.79 2.79 0 0 0 1.96-1.98A29.1 29.1 0 0 0 23.97 12a29.1 29.1 0 0 0-.47-5.493ZM9.6 15.3V8.7l6.3 3.3-6.3 3.3Z"/></svg>`,
  // research icons
  synthesis: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3"/><path d="M7 15h10"/></svg>`,
  storage: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>`,
  computing: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3v2M14 3v2M10 19v2M14 19v2M3 10h2M3 14h2M19 10h2M19 14h2"/></svg>`,
  diagnosis: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2 5 4-12 2 7h6"/></svg>`,
  platform: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="m2 12 10 5 10-5M2 16l10 5 10-5"/></svg>`,
};

function helixSVG() {
  const rungs = [];
  for (let i = 0; i <= 20; i++) {
    const y = 10 + i * 14;
    const phase = Math.sin((i / 20) * Math.PI * 3);
    const x1 = 70 + phase * 46;
    const x2 = 70 - phase * 46;
    const near = Math.abs(phase) < 0.55;
    rungs.push(
      `<circle cx="${x1.toFixed(1)}" cy="${y}" r="4.2" fill="${phase >= 0 ? "#0e7c86" : "#1b7fb0"}"/>` +
      `<circle cx="${x2.toFixed(1)}" cy="${y}" r="4.2" fill="${phase >= 0 ? "#1b7fb0" : "#0e7c86"}"/>` +
      (near ? `<line x1="${x1.toFixed(1)}" y1="${y}" x2="${x2.toFixed(1)}" y2="${y}" stroke="currentColor" stroke-width="1.4" opacity=".5"/>` : "")
    );
  }
  return `<svg class="hero__helix" viewBox="0 0 140 300" fill="none" aria-hidden="true" style="color:var(--accent)">${rungs.join("")}</svg>`;
}

/* ---------------- Layout ---------------- */
function head(lang, pageKey, titleText, desc) {
  const AP = "../assets";
  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titleText}</title>
<meta name="description" content="${desc}">
<meta property="og:title" content="${titleText}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Jost:wght@300;400&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='11' fill='%230e7c86'/%3E%3Cpath d='M13 10c0 6 14 8 14 14M27 10c0 6-14 8-14 14' stroke='white' stroke-width='2.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E">
<link rel="stylesheet" href="${AP}/css/style.css">
<noscript><style>.reveal{opacity:1!important;transform:none!important}</style></noscript>
</head>`;
}

function header(lang, pageKey) {
  const u = ui[lang];
  const other = lang === "en" ? "ko" : "en";
  const otherHref = `../${other}/${fileFor(pageKey)}`;
  const links = pages.map((p) => {
    const active = p.key === pageKey ? " class=\"is-active\"" : "";
    return `<li><a href="./${p.file}"${active}>${u.nav[p.key]}</a></li>`;
  }).join("");
  const langSwitch = `<div class="lang-switch"><a href="./${fileFor(pageKey)}" class="is-active">${ui[lang].langName}</a><a href="${otherHref}">${ui[other].langName}</a></div>`;
  const langSwitchM = `<div class="lang-switch lang-switch-m" style="display:none"><a href="./${fileFor(pageKey)}" class="is-active">${ui[lang].langName}</a><a href="${otherHref}">${ui[other].langName}</a></div>`;
  return `<header class="site-header">
<div class="container nav">
  <a class="brand" href="./index.html" aria-label="${site.nameShort} home">
    ${I.logo}
    <span class="brand__text"><span class="brand__name">${site.nameShort}</span><span class="brand__sub">${site.nameFull[lang]}</span></span>
  </a>
  <nav aria-label="Primary"><ul class="nav__links">${links}${langSwitchM}</ul></nav>
  <div class="nav__tools">
    ${langSwitch}
    <button class="icon-btn theme-toggle" type="button" aria-label="Toggle theme">${I.sun}${I.moon}</button>
    <button class="icon-btn nav__burger" type="button" aria-label="Menu" aria-expanded="false">${I.menu}</button>
  </div>
</div>
</header>`;
}

function wordmark() {
  return `<div class="wordmark"><span class="wm-blue">BIO</span>ELECTRONICS <span class="wm-amp">&amp;</span> <span class="wm-red">BIO</span>OPTICS <span class="wm-lab">LAB.</span></div>`;
}

function socialRow() {
  const s = site.social;
  const items = [
    s.email ? { href: "mailto:" + s.email, icon: "mail", label: "Email" } : null,
    s.scholar ? { href: s.scholar, icon: "scholar", label: "Google Scholar", ext: true } : null,
    s.linkedin ? { href: s.linkedin, icon: "linkedin", label: "LinkedIn", ext: true } : null,
    s.x ? { href: s.x, icon: "x", label: "X", ext: true } : null,
    s.github ? { href: s.github, icon: "github", label: "GitHub", ext: true } : null,
    s.youtube ? { href: s.youtube, icon: "youtube", label: "YouTube", ext: true } : null,
    s.discord ? { href: s.discord, icon: "discord", label: "Discord (internal)", ext: true } : null,
  ].filter(Boolean);
  return items.map((i) => `<a class="social" href="${i.href}" aria-label="${i.label}"${i.ext ? ' target="_blank" rel="noopener"' : ""}>${I[i.icon]}</a>`).join("");
}

function footer(lang) {
  const u = ui[lang];
  const explore = pages.filter((p) => p.key !== "index")
    .map((p) => `<li><a href="./${p.file}">${u.nav[p.key]}</a></li>`).join("");
  return `<footer class="site-footer">
<div class="brand-banner"><div class="container">
  ${wordmark()}
  <div class="social-row">${socialRow()}</div>
</div></div>
<div class="container">
  <div class="footer-grid">
    <div class="footer-brand">
      <a class="brand" href="./index.html">${I.logo}<span class="brand__text"><span class="brand__name">${site.nameShort}</span><span class="brand__sub">${site.nameFull[lang]}</span></span></a>
      <p>${u.footer.tagline}</p>
    </div>
    <div><h5>${u.footer.explore}</h5><ul>${explore}</ul></div>
    <div><h5>${u.footer.connect}</h5><ul>
      <li><a href="${site.scholar}" target="_blank" rel="noopener">Google Scholar</a></li>
      <li><a href="${site.linkedin}" target="_blank" rel="noopener">LinkedIn</a></li>
      <li><a href="${site.spinoff}" target="_blank" rel="noopener">STD BioElec ${I.external}</a></li>
    </ul></div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 ${site.copyright} · ${site.dept[lang]}</span>
    <a class="footer-email" href="mailto:${site.labEmail}">${site.labEmail}</a>
  </div>
</div>
</footer>`;
}

function layout(lang, pageKey, titleText, desc, body) {
  return `${head(lang, pageKey, titleText, desc)}
<body>
${header(lang, pageKey)}
<main>
${body}
</main>
${footer(lang)}
<script src="../assets/js/main.js" defer></script>
</body>
</html>`;
}

function pageHero(lang, title, sub) {
  const u = ui[lang];
  return `<section class="page-hero">
<div class="hero__bg"><div class="hero__grid"></div></div>
<div class="container">
  <div class="breadcrumb"><a href="./index.html">${u.backHome}</a> / ${title}</div>
  <h1 class="reveal">${title}</h1>
  ${sub ? `<p class="reveal">${sub}</p>` : ""}
</div>
</section>`;
}

/* ---------------- Pages ---------------- */
function renderHome(lang) {
  const u = ui[lang];
  const stats = u.stats.map((s) => `<div class="stat"><div class="stat__num">${s.num}</div><div class="stat__label">${s.label}</div></div>`).join("");
  const cards = researchAreas.map((a, i) => {
    const c = a[lang];
    const wide = i >= 3 ? " rcard--wide" : "";
    const tags = a.tags.map((t) => `<span class="tag tag--atcg">${t}</span>`).join("");
    return `<article class="rcard${wide} reveal">
  <div class="rcard__icon">${I[a.icon]}</div>
  <div class="rcard__ix">${a.ix}</div>
  <h3>${c.name}</h3>
  <div class="rcard__en">${c.tagline}</div>
  <p>${c.body}</p>
  <div class="rcard__tags">${tags}</div>
</article>`;
  }).join("");

  const foundryList = u.foundry.list.map((x) => `<li>${I.check}<span>${x}</span></li>`).join("");

  const more = (p) => `<a class="pub__more" href="${p.link || site.spinoff}" target="_blank" rel="noopener">${u.cta.readMore} ↗</a>`;
  const featured = publications.filter((p) => p.featured).slice(0, 4).map((p) => `
  <li class="pub">
    <span class="pub__year">${p.year}</span>
    <div class="pub__body"><h4><a class="pub__link" href="${p.link || site.spinoff}" target="_blank" rel="noopener">${p.title}</a></h4><div class="pub__authors">${p.authors}</div><span class="pub__venue">${p.venue}</span> ${more(p)}</div>
    <span class="pub__badge">${p.featured}</span>
  </li>`).join("");

  const hero = `<section class="hero">
<div class="hero__bg"><div class="hero__grid"></div><div class="hero__glow"></div>${helixSVG()}</div>
<div class="container"><div class="hero__inner">
  <span class="hero__tag"><span class="dot"></span>${u.hero.tag}</span>
  <h1>${u.hero.titleA}<span class="grad">${u.hero.titleGrad}</span>${u.hero.titleB}</h1>
  <p class="hero__sub">${u.hero.sub}</p>
  <p class="hero__meta">${u.hero.meta}</p>
  <div class="hero__cta">
    <a class="btn btn--primary" href="./research.html">${u.cta.research} ${I.arrow}</a>
    <a class="btn btn--ghost" href="./contact.html#openings">${u.cta.join}</a>
  </div>
</div></div>
</section>`;

  const body = `${hero}
<section class="section section--tight">
  <div class="container"><div class="stats reveal">${stats}</div></div>
</section>

<section class="section section--alt">
  <div class="container">
    <div class="section-head reveal">
      <span class="eyebrow">${u.research.eyebrow}</span>
      <h2>${u.research.head}</h2>
      <p>${u.research.sub}</p>
    </div>
    <div class="grid grid--research">${cards}</div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="feature">
      <div class="feature__text reveal">
        <span class="eyebrow">${u.foundry.eyebrow}</span>
        <h2>${u.foundry.head}</h2>
        <p class="lede" style="margin-top:16px">${u.foundry.body}</p>
        <div class="hero__cta" style="margin-top:26px"><a class="btn btn--ghost" href="./research.html#a01">${u.cta.research} ${I.arrow}</a></div>
      </div>
      <div class="feature__panel reveal">
        <span class="eyebrow">EPCR · STD BioElec</span>
        <h3>${lang === "en" ? "Write once, reuse ×10⁵." : "한 번 합성, 10⁵회 재사용."}</h3>
        <ul class="feature__list">${foundryList}</ul>
        <p class="seq" style="margin-top:22px">5′—ATCG GATE ACGT CODE TCGA—3′</p>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    <div class="section-head reveal"><span class="eyebrow">${u.pubs.eyebrow}</span><h2>${u.pubs.head}</h2></div>
    <ul class="pub-list reveal">${featured}</ul>
    <div style="margin-top:28px"><a class="btn btn--ghost" href="./publications.html">${u.cta.allPubs} ${I.arrow}</a></div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="callout reveal" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:24px">
      <div style="max-width:560px"><h3 style="font-size:1.5rem">${u.closing.head}</h3><p style="color:var(--ink-2);margin-top:10px">${u.closing.body}</p></div>
      <a class="btn btn--primary" href="./contact.html#openings">${u.closing.cta} ${I.arrow}</a>
    </div>
  </div>
</section>`;

  const title = `${site.nameShort} — ${site.tagline[lang]}`;
  return layout(lang, "index", title, site.tagline[lang] + " · " + site.dept[lang], body);
}

function renderResearch(lang) {
  const u = ui[lang];
  const blocks = researchAreas.map((a) => {
    const c = a[lang];
    const bullets = c.bullets.map((b) => `<li>${b}</li>`).join("");
    const tags = a.tags.map((t) => `<span class="tag tag--atcg">${t}</span>`).join("");
    return `<div class="area-block reveal" id="a${a.ix}">
  <div class="area-block__aside">
    <div class="rcard__icon">${I[a.icon]}</div>
    <div class="area-block__ix">${a.ix}</div>
    <h3>${c.name}</h3>
    <div class="en">${c.tagline}</div>
    <div class="rcard__tags" style="margin-top:14px">${tags}</div>
  </div>
  <div class="area-block__main prose">
    <p class="lede">${c.body}</p>
    <ul>${bullets}</ul>
  </div>
</div>`;
  }).join("");

  const body = `${pageHero(lang, u.researchPage.title, u.researchPage.sub)}
<section class="section">
  <div class="container">${blocks}</div>
</section>`;
  return layout(lang, "research", `${u.researchPage.title} — ${site.nameShort}`, u.researchPage.sub, body);
}

function renderPublications(lang) {
  const u = ui[lang];
  const chips = u.pubPage.filters.map((f, i) =>
    `<button class="chip${i === 0 ? " is-active" : ""}" data-filter="${f.key}">${f.label}</button>`).join("");
  const items = publications.map((p) => {
    const badge = p.featured ? `<span class="pub__badge">${p.featured}</span>` : `<span></span>`;
    const more = `<a class="pub__more" href="${p.link || site.spinoff}" target="_blank" rel="noopener">${u.cta.readMore} ↗</a>`;
    return `<li class="pub" data-topics="${p.topics.join(" ")}">
    <span class="pub__year">${p.year}</span>
    <div class="pub__body"><h4><a class="pub__link" href="${p.link || site.spinoff}" target="_blank" rel="noopener">${p.title}</a></h4><div class="pub__authors">${p.authors}</div><span class="pub__venue">${p.venue}</span> ${more}</div>
    ${badge}
  </li>`;
  }).join("");
  const body = `${pageHero(lang, u.pubPage.title, u.pubPage.sub)}
<section class="section">
  <div class="container">
    <div class="filter-bar reveal">${chips}</div>
    <ul class="pub-list reveal">${items}</ul>
    <p style="margin-top:30px;color:var(--ink-3);font-size:.9rem">${lang === "en" ? "Full list on" : "전체 목록은"} <a href="${site.scholar}" target="_blank" rel="noopener">Google Scholar</a>.</p>
  </div>
</section>`;
  return layout(lang, "publications", `${u.pubPage.title} — ${site.nameShort}`, u.pubPage.desc || site.tagline[lang], body);
}

function renderMembers(lang) {
  const u = ui[lang];
  const pi = members.pi;
  const eduRows = pi.education.map((e) => `<li><span class="yr">${e.yr}</span><span>${e[lang]}</span></li>`).join("");
  const expRows = pi.experience.map((e) => `<li><span class="yr">${e.yr}</span><span>${e[lang]}</span></li>`).join("");
  const piName = lang === "ko" ? `${pi.nameKo} <span style="color:var(--ink-3);font-family:var(--font-mono);font-size:.7em">${pi.name}</span>` : `${pi.name} <span style="color:var(--ink-3);font-family:var(--font-mono);font-size:.7em">${pi.nameKo}</span>`;

  const piCard = `<div class="pi-card reveal">
  <div class="pi-card__photo">${pi.initials}</div>
  <div>
    <h3>${piName}</h3>
    <div class="pi-card__title">${lang === "ko" ? pi.roleKo : pi.roleEn}</div>
    <p style="color:var(--ink-2);margin-top:14px;max-width:640px">${lang === "ko" ? pi.bioKo : pi.bioEn}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:22px" class="pi-grid">
      <div><div class="eyebrow" style="margin-bottom:10px">${u.membersPage.education}</div><ul class="timeline">${eduRows}</ul></div>
      <div><div class="eyebrow" style="margin-bottom:10px">${u.membersPage.experience}</div><ul class="timeline">${expRows}</ul></div>
    </div>
    <div class="member__links" style="margin-top:22px">
      <a href="${pi.scholar}" target="_blank" rel="noopener" aria-label="Scholar">${I.scholar}</a>
      <a href="${pi.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">${I.linkedin}</a>
      <a href="mailto:${pi.email}" aria-label="Email">${I.mail}</a>
    </div>
  </div>
</div>`;

  const ext = (href) => (href && href.startsWith("http")) ? ' target="_blank" rel="noopener"' : "";
  const card = (m) => {
    const name = lang === "ko" ? m.nameKo : m.name;
    const sub = lang === "ko" ? m.name : m.nameKo;
    const role = lang === "ko" ? m.roleKo : m.roleEn;
    const focus = lang === "ko" ? m.focusKo : m.focusEn;
    const focusTag = focus ? `<div class="member__focus"><span class="tag tag--atcg">${focus}</span></div>` : "";
    const soc = [
      m.scholar ? `<a href="${m.scholar}"${ext(m.scholar)} aria-label="Scholar">${I.scholar}</a>` : "",
      m.linkedin ? `<a href="${m.linkedin}"${ext(m.linkedin)} aria-label="LinkedIn">${I.linkedin}</a>` : "",
      m.x ? `<a href="${m.x}"${ext(m.x)} aria-label="X">${I.x}</a>` : "",
    ].join("");
    const links = soc ? `<div class="member__links">${soc}</div>` : "";
    return `<article class="member reveal"><div class="member__avatar">${m.initials}</div><h4>${name}</h4><div class="member__role">${role}</div><div class="member__note">${sub}</div>${focusTag}${links}</article>`;
  };
  const postdocs = members.postdocs.map(card).join("");
  const students = members.students.map(card).join("");
  const alumni = members.alumni.map((m) => {
    const name = lang === "ko" ? m.nameKo : m.name;
    return `<li><b>${name}</b> — <span style="color:var(--ink-3)">${lang === "ko" ? m.noteKo : m.noteEn}</span></li>`;
  }).join("");

  const body = `${pageHero(lang, u.membersPage.title, u.membersPage.sub)}
<section class="section">
  <div class="container">
    <div class="eyebrow reveal">${u.membersPage.pi}</div>
    ${piCard}
    <div class="section-head reveal" style="margin-top:64px;margin-bottom:28px"><span class="eyebrow">${u.membersPage.postdocs}</span></div>
    <div class="members">${postdocs}</div>
    <div class="section-head reveal" style="margin-top:56px;margin-bottom:28px"><span class="eyebrow">${u.membersPage.students}</span></div>
    <div class="members">${students}</div>
    <div class="section-head reveal" style="margin-top:56px;margin-bottom:20px"><span class="eyebrow">${u.membersPage.alumni}</span></div>
    <ul class="prose reveal" style="list-style:none;padding:0;max-width:720px">${alumni}</ul>
  </div>
</section>`;
  return layout(lang, "members", `${u.membersPage.title} — ${site.nameShort}`, u.membersPage.desc || site.tagline[lang], body);
}

function renderJoin(lang) {
  const u = ui[lang];
  const pos = positions[lang].map((p) => `<article class="rcard reveal" style="grid-column:span 2"><h3 style="font-size:1.15rem">${p.role}</h3><p style="margin-top:8px">${p.detail}</p></article>`).join("");
  const why = lang === "en"
    ? { h1: "Why BBL", p1: "An unusual intersection — DNA nanotechnology, semiconductor devices, AI, and computer science under one roof. Projects that routinely cross those lines: a DNA data drive needing error-correcting codes and a custom chip; a diagnostic assay needing both wet-lab chemistry and a deep-learning model.", h2: "Who we look for", p2: "Curiosity over credentials. Any background — biology, electronics, coding, AI — united by a taste for building tools that don't exist yet.", h3: "How to apply", p3: "A short note on your interests plus a CV, by email to the PI. Prospective graduate students, undergraduate interns, and postdocs — welcome any time." }
    : { h1: "왜 BBL인가", p1: "DNA 나노기술·반도체 소자·AI·전산학이 한 지붕 아래 모인 드문 교차점. 경계를 넘나드는 프로젝트 — DNA 데이터 드라이브엔 오류정정 코드와 커스텀 칩, 진단 어세이엔 습식 화학과 딥러닝 모델.", h2: "찾는 사람", p2: "스펙보다 호기심. 생물·전자·코딩·AI 어느 배경이든, 아직 세상에 없는 것을 만들기 좋아하는 사람.", h3: "지원 방법", p3: "관심사에 대한 짧은 소개와 이력서, 책임교수 이메일로. 대학원 진학 희망자·학부 인턴·박사후연구원 모두 언제든 환영." };

  const body = `${pageHero(lang, u.joinPage.title, u.joinPage.sub)}
<section class="section">
  <div class="container">
    <div class="prose reveal">
      <h3>${why.h1}</h3><p>${why.p1}</p>
      <h3>${why.h2}</h3><p>${why.p2}</p>
    </div>
    <div class="section-head reveal" style="margin-top:48px;margin-bottom:24px"><span class="eyebrow">${lang === "en" ? "Open Positions" : "모집 분야"}</span></div>
    <div class="grid grid--research">${pos}</div>
    <div class="callout reveal" style="margin-top:48px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px">
      <div style="max-width:560px"><h3 style="font-size:1.35rem">${why.h3}</h3><p style="color:var(--ink-2);margin-top:10px">${why.p3}</p></div>
      <a class="btn btn--primary" href="mailto:${site.labEmail}">${I.mail} ${u.cta.contact}</a>
    </div>
  </div>
</section>`;
  return layout(lang, "join", `${u.joinPage.title} — ${site.nameShort}`, u.joinPage.sub, body);
}

function renderContact(lang) {
  const u = ui[lang];
  const rows = [
    { icon: "mail", k: lang === "en" ? "Lab / Recruiting" : "연구실 · 모집", v: `<a href="mailto:${site.labEmail}">${site.labEmail}</a>` },
    { icon: "mail", k: lang === "en" ? "Principal Investigator" : "책임교수", v: `<a href="mailto:${site.piEmail}">${site.piEmail}</a>` },
    { icon: "building", k: lang === "en" ? "Institution" : "소속", v: lang === "en" ? contactInfo.addressEn : contactInfo.addressKo },
    { icon: "link", k: lang === "en" ? "Spin-off" : "스핀오프", v: `<a href="${site.spinoff}" target="_blank" rel="noopener">STD BioElec — stdbioelec.com</a>` },
  ].map((r) => `<div class="info-row">${I[r.icon]}<div><div class="k">${r.k}</div><div class="v">${r.v}</div></div></div>`).join("");

  const pos = positions[lang].map((p) => `<article class="rcard reveal rcard--wide"><h3 style="font-size:1.15rem">${p.role}</h3><p style="margin-top:8px">${p.detail}</p></article>`).join("");
  const why = lang === "en"
    ? { h1: "Why BBL", p1: "An unusual intersection — DNA nanotechnology, semiconductor devices, AI, and computer science under one roof. Projects that routinely cross those lines: a DNA data drive needing error-correcting codes and a custom chip; a diagnostic assay needing both wet-lab chemistry and a deep-learning model.", h2: "Who we look for", p2: "Curiosity over credentials. Any background — biology, electronics, coding, AI — united by a taste for building tools that don't exist yet.", h3: "How to apply", p3: "A short note on your interests plus a CV, by email to the PI. Prospective graduate students, undergraduate interns, and postdocs — welcome any time." }
    : { h1: "왜 BBL인가", p1: "DNA 나노기술·반도체 소자·AI·전산학이 한 지붕 아래 모인 드문 교차점. 경계를 넘나드는 프로젝트 — DNA 데이터 드라이브엔 오류정정 코드와 커스텀 칩, 진단 어세이엔 습식 화학과 딥러닝 모델.", h2: "찾는 사람", p2: "스펙보다 호기심. 생물·전자·코딩·AI 어느 배경이든, 아직 세상에 없는 것을 만들기 좋아하는 사람.", h3: "지원 방법", p3: "관심사에 대한 짧은 소개와 이력서, 책임교수 이메일로. 대학원 진학 희망자·학부 인턴·박사후연구원 모두 언제든 환영." };

  const body = `${pageHero(lang, u.contactPage.title, u.contactPage.sub)}
<section class="section">
  <div class="container">
    <div class="contact-grid">
      <div class="info-card reveal">${rows}</div>
      <div class="callout reveal">
        <h3 style="font-size:1.3rem">${u.closing.head}</h3>
        <p style="color:var(--ink-2);margin-top:10px">${u.closing.body}</p>
        <div style="margin-top:20px;display:flex;flex-wrap:wrap;gap:10px">
          <a class="btn btn--primary" href="mailto:${site.labEmail}">${I.mail} ${u.cta.contact}</a>
          <a class="btn btn--ghost" href="${site.scholar}" target="_blank" rel="noopener">${I.scholar} ${u.cta.scholar}</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt" id="openings">
  <div class="container">
    <div class="prose reveal">
      <h3>${why.h1}</h3><p>${why.p1}</p>
      <h3>${why.h2}</h3><p>${why.p2}</p>
    </div>
    <div class="section-head reveal" style="margin-top:48px;margin-bottom:24px"><span class="eyebrow">${lang === "en" ? "Open Positions" : "모집 분야"}</span></div>
    <div class="grid grid--research">${pos}</div>
    <div class="callout reveal" style="margin-top:48px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px">
      <div style="max-width:560px"><h3 style="font-size:1.35rem">${why.h3}</h3><p style="color:var(--ink-2);margin-top:10px">${why.p3}</p></div>
      <a class="btn btn--primary" href="mailto:${site.labEmail}">${I.mail} ${u.cta.contact}</a>
    </div>
  </div>
</section>`;
  return layout(lang, "contact", `${u.contactPage.title} — ${site.nameShort}`, u.contactPage.desc || site.tagline[lang], body);
}

function renderTeaching(lang) {
  const u = ui[lang];
  const rows = courses.map((c) => `
  <li class="pub">
    <span class="pub__year">${lang === "ko" ? c.levelKo : c.levelEn}</span>
    <div class="pub__body"><h4>${lang === "ko" ? c.ko : c.en}</h4><div class="pub__authors">${lang === "ko" ? c.descKo : c.descEn}</div></div>
    <span></span>
  </li>`).join("");
  const body = `${pageHero(lang, u.teachingPage.title, u.teachingPage.sub)}
<section class="section">
  <div class="container">
    <ul class="pub-list reveal">${rows}</ul>
    <div class="callout reveal" style="margin-top:44px">
      <h3 style="font-size:1.25rem">${u.teachingPage.books}</h3>
      <p style="color:var(--ink-2);margin-top:10px">${u.teachingPage.booksBody}</p>
    </div>
  </div>
</section>`;
  return layout(lang, "teaching", `${u.teachingPage.title} — ${site.nameShort}`, u.teachingPage.desc || site.tagline[lang], body);
}

/* ---------------- Root: redirect to preferred language ---------------- */
function renderRoot() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${site.nameShort} — ${site.nameFull.en}</title>
<link rel="canonical" href="en/index.html">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='11' fill='%230e7c86'/%3E%3Cpath d='M13 10c0 6 14 8 14 14M27 10c0 6-14 8-14 14' stroke='white' stroke-width='2.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E">
<meta http-equiv="refresh" content="0; url=en/index.html">
<script>
  (function(){try{var s=localStorage.getItem('amsl-theme');if(s)document.documentElement.setAttribute('data-theme',s);}catch(e){}
  var l=(navigator.language||navigator.userLanguage||'en').toLowerCase();
  location.replace(l.indexOf('ko')===0?'ko/index.html':'en/index.html');})();
</script>
</head>
<body style="font-family:system-ui,sans-serif;padding:2rem;color:#14171c">
<p><a href="en/index.html">Enter — English</a> &nbsp;·&nbsp; <a href="ko/index.html">한국어로 입장</a></p>
</body>
</html>`;
}

/* ---------------- Emit ---------------- */
const renderers = {
  index: renderHome,
  research: renderResearch,
  publications: renderPublications,
  teaching: renderTeaching,
  members: renderMembers,
  contact: renderContact,
};

let count = 0;
for (const lang of ["en", "ko"]) {
  mkdirSync(resolve(ROOT, lang), { recursive: true });
  for (const p of pages) {
    const html = renderers[p.key](lang);
    writeFileSync(resolve(ROOT, lang, p.file), html, "utf8");
    count++;
  }
}
writeFileSync(resolve(ROOT, "index.html"), renderRoot(), "utf8");
count++;
console.log(`✓ Generated ${count} pages (en/, ko/, root).`);
