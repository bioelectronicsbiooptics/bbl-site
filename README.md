# Bioelectronics & Biooptics Lab (BBL) — Website

Bilingual (English / 한국어) homepage for the **Bioelectronics & Biooptics Lab** — Korean: **유전자 진단 및 치료 연구실**, Dept. of Nano-Bioengineering, Incheon National University.
PI: Youngjun Song, Ph.D. · Spin-off: STD BioElec.

## Structure

```
index.html          Redirects to /en or /ko (browser-language aware)
en/                 English pages
ko/                 Korean pages
  index.html          Home
  research.html       Research — 5 thrusts
  publications.html   Publications (filterable, from the PI's Scholar)
  teaching.html       Teaching — courses
  members.html        People (PI, postdocs, students, alumni)
  join.html           Join Us / open positions
  contact.html        Contact
assets/
  css/style.css       Design system (light + dark, responsive)
  js/main.js          Theme toggle, mobile menu, scroll-reveal, pub filter
tools/
  content.mjs         ← ALL text, data, members, social links (edit this)
  build.mjs           Static-site generator
```

## Editing content

Everything — copy, publications, members, courses, social links — lives in **`tools/content.mjs`**.
Edit it, then regenerate:

```bash
node tools/build.mjs
```

The generated `.html` files are the deployable product — **no build step is needed to host them.**

Copy style: **noun-form (nominal) endings**, KO & EN — deliberately not full sentences.

### Social / outreach links

In `content.mjs → site.social`. Replace the `"#"` placeholders with real URLs (X, GitHub, YouTube, Discord). Set a value to an empty string `""` to hide that icon. Per-member LinkedIn / X live on each entry in `members` (also `"#"` placeholders for now).

## Deploy — GitHub Pages

1. Create a repo and push:
   ```bash
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```
2. Repo **Settings → Pages → Source**: `main` branch, `/ (root)`.
3. Site serves at `https://<user>.github.io/<repo>/` → redirects to `/en/` or `/ko/`.

### Custom domain (stdbioelec.com)

`stdbioelec.com` currently hosts the STD BioElec company site, so **use a subdomain** for the lab (e.g. `lab.stdbioelec.com`) to avoid overwriting it:

1. Add a file named `CNAME` at the repo root containing one line: `lab.stdbioelec.com`
2. At the DNS provider, add a `CNAME` record: `lab` → `<user>.github.io`
3. Repo Settings → Pages → Custom domain → `lab.stdbioelec.com`, then enable HTTPS.

(To instead serve the apex `stdbioelec.com`, the existing company site must move first — decide before pointing DNS.)

Uses Google Fonts (Space Grotesk, Inter, IBM Plex Mono, Jost) and no other external dependencies.
