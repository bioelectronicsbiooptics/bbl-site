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
  members, positions, contactInfo,
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
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='11' fill='%230e7c86'/%3E%3Cpath d='M13 10c0 6 14 8 14 14M27 10c0 6-14 8-14 14' stroke='white' stroke-width='2.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E">
<link rel="stylesheet" href="${AP}/css/style.css">
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
  <a class="brand" href="./index.html" aria-label="AMSL home">
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

function footer(lang) {
  const u = ui[lang];
  const explore = pages.filter((p) => p.key !== "index")
    .map((p) => `<li><a href="./${p.file}">${u.nav[p.key]}</a></li>`).join("");
  return `<footer class="site-footer">
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
      <li><a href="mailto:${site.labEmail}">Email</a></li>
    </ul></div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 ${site.copyright}</span>
    <span>${site.dept[lang]}</span>
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
  <p class="reveal">${sub}</p>
</div>
</section>`;
}

/* ---------------- Pages ---------------- */
function renderHome(lang) {
  const u = ui[lang];
  const stats = u.stats.map((s) => `<div class="stat"><div class="stat__num">${s.num}</div><div class="stat__label">${s.label}</div></div>`).join("");
  const cards = researchAreas.map((a, i) => {
    const c = a[lang];
    const wide = i === 4 ? " rcard--wide" : "";
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

  const featured = publications.filter((p) => p.featured).slice(0, 4).map((p) => `
  <li class="pub">
    <span class="pub__year">${p.year}</span>
    <div class="pub__body"><h4>${p.title}</h4><div class="pub__authors">${p.authors}</div><span class="pub__venue">${p.venue}</span></div>
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
    <a class="btn btn--ghost" href="./join.html">${u.cta.join}</a>
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
        <h3>${lang === "en" ? "Write. Reuse. Repeat." : "쓰고. 재사용하고. 반복한다."}</h3>
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
      <a class="btn btn--primary" href="./join.html">${u.closing.cta} ${I.arrow}</a>
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
    return `<li class="pub" data-topics="${p.topics.join(" ")}">
    <span class="pub__year">${p.year}</span>
    <div class="pub__body"><h4>${p.title}</h4><div class="pub__authors">${p.authors}</div><span class="pub__venue">${p.venue}</span></div>
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
  return layout(lang, "publications", `${u.pubPage.title} — ${site.nameShort}`, u.pubPage.sub, body);
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

  const card = (m) => {
    const name = lang === "ko" ? m.nameKo : m.name;
    const sub = lang === "ko" ? m.name : m.nameKo;
    const role = lang === "ko" ? m.roleKo : m.roleEn;
    const links = m.scholar ? `<div class="member__links"><a href="${m.scholar}" target="_blank" rel="noopener" aria-label="Scholar">${I.scholar}</a></div>` : "";
    return `<article class="member reveal"><div class="member__avatar">${m.initials}</div><h4>${name}</h4><div class="member__role">${role}</div><div class="member__note">${sub}</div>${links}</article>`;
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
  return layout(lang, "members", `${u.membersPage.title} — ${site.nameShort}`, u.membersPage.sub, body);
}

function renderJoin(lang) {
  const u = ui[lang];
  const pos = positions[lang].map((p) => `<article class="rcard reveal" style="grid-column:span 2"><h3 style="font-size:1.15rem">${p.role}</h3><p style="margin-top:8px">${p.detail}</p></article>`).join("");
  const why = lang === "en"
    ? { h1: "Why AMSL", p1: "We sit at an unusual intersection — DNA nanotechnology, semiconductor devices, AI, and computer science under one roof. Projects here routinely cross those lines: a DNA data drive needs error-correcting codes and a custom chip; a diagnostic assay needs both wet-lab chemistry and a deep-learning model.", h2: "Who we look for", p2: "Curiosity over credentials. Whether your background is biology, electronics, coding, or AI, what matters is that you like building things that don't exist yet.", h3: "How to apply", p3: "Email the PI with a short note about your interests and a CV. Prospective graduate students, undergraduate interns, and postdocs are all welcome to reach out at any time." }
    : { h1: "왜 AMSL인가", p1: "우리는 DNA 나노기술, 반도체 소자, AI, 전산학이 한 지붕 아래 모인 드문 교차점에 있습니다. 이곳의 프로젝트는 그 경계를 넘나듭니다 — DNA 데이터 드라이브에는 오류정정 코드와 커스텀 칩이 필요하고, 진단 어세이에는 습식 화학과 딥러닝 모델이 함께 필요합니다.", h2: "찾는 사람", p2: "스펙보다 호기심. 생물·전자·코딩·AI 어느 배경이든, 아직 세상에 없는 것을 만드는 걸 좋아하는 사람을 찾습니다.", h3: "지원 방법", p3: "관심사에 대한 짧은 소개와 이력서를 책임교수에게 이메일로 보내주세요. 대학원 진학 희망자, 학부 인턴, 박사후연구원 모두 언제든 환영합니다." };

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

  const body = `${pageHero(lang, u.contactPage.title, u.contactPage.sub)}
<section class="section">
  <div class="container">
    <div class="contact-grid">
      <div class="info-card reveal">${rows}</div>
      <div class="callout reveal">
        <h3 style="font-size:1.3rem">${u.closing.head}</h3>
        <p style="color:var(--ink-2);margin-top:10px">${u.closing.body}</p>
        <div style="margin-top:20px;display:flex;flex-wrap:wrap;gap:10px">
          <a class="btn btn--primary" href="./join.html">${u.cta.join} ${I.arrow}</a>
          <a class="btn btn--ghost" href="${site.scholar}" target="_blank" rel="noopener">${I.scholar} ${u.cta.scholar}</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
  return layout(lang, "contact", `${u.contactPage.title} — ${site.nameShort}`, u.contactPage.sub, body);
}

/* ---------------- Root language landing ---------------- */
function renderRoot() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${site.nameShort} — ${site.nameFull.en}</title>
<meta name="description" content="${site.tagline.en} · ${site.dept.en}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='11' fill='%230e7c86'/%3E%3Cpath d='M13 10c0 6 14 8 14 14M27 10c0 6-14 8-14 14' stroke='white' stroke-width='2.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E">
<link rel="stylesheet" href="assets/css/style.css">
<script>
  (function(){try{var s=localStorage.getItem('amsl-theme');if(s)document.documentElement.setAttribute('data-theme',s);}catch(e){}
  var l=(navigator.language||'en').toLowerCase();if(l.indexOf('ko')===0){/* stay to let user choose, or auto: */}})();
</script>
</head>
<body>
<main class="hero" style="min-height:100vh;display:grid;place-items:center;text-align:center">
  <div class="hero__bg"><div class="hero__grid"></div><div class="hero__glow"></div></div>
  <div class="container" style="position:relative;z-index:1;max-width:620px">
    ${I.logo.replace('class="brand__mark"', 'style="width:60px;height:60px;margin:0 auto 26px"')}
    <span class="hero__tag"><span class="dot"></span>Incheon National University</span>
    <h1 style="font-size:clamp(2.2rem,6vw,3.4rem);margin-top:20px">${site.nameShort}</h1>
    <p class="lede" style="margin-top:14px">${site.nameFull.en} · ${site.nameFull.ko}</p>
    <p style="color:var(--ink-3);margin-top:8px">${site.tagline.en}</p>
    <div class="hero__cta" style="justify-content:center;margin-top:34px">
      <a class="btn btn--primary" href="en/index.html">English ${I.arrow}</a>
      <a class="btn btn--ghost" href="ko/index.html">한국어 ${I.arrow}</a>
    </div>
  </div>
</main>
<script src="assets/js/main.js" defer></script>
</body>
</html>`;
}

/* ---------------- Emit ---------------- */
const renderers = {
  index: renderHome,
  research: renderResearch,
  publications: renderPublications,
  members: renderMembers,
  join: renderJoin,
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
