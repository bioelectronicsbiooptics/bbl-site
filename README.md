# Adaptive Memory Systems Lab (AMSL) — Website

Bilingual (English / 한국어) homepage for the **Adaptive Memory Systems Lab** — *Genetic Diagnosis & Therapy Lab*, Dept. of Nano-Bioengineering, Incheon National University.
PI: Youngjun Song, Ph.D.

> *Building Next-Generation Memory Beyond CMOS.*

## Structure

```
index.html          Language landing (EN / KO)
en/                 English pages
ko/                 Korean pages
  index.html          Home
  research.html       Research — 5 thrusts
  publications.html   Publications (filterable)
  members.html        People (PI, postdocs, students, alumni)
  join.html           Join Us / open positions
  contact.html        Contact
assets/
  css/style.css       Design system (light + dark, responsive)
  js/main.js          Theme toggle, mobile menu, scroll-reveal, pub filter
tools/
  content.mjs         ← ALL text & data (edit this)
  build.mjs           Static-site generator
```

## Research categories (5)

1. **DNA Synthesis & Synthetic Biology** — electric-field synthesis (EPCR), on-chip gene/mRNA foundry (IDT-style, → STD BioElec)
2. **DNA Data Storage** — high-density codecs, liquid DNA drive, digital heritage
3. **Molecular & DNA Computing** — droplet logic, in-cell miRNA logic, FRET memory
4. **Genetic Diagnosis & Therapy** — enzyme-free miRNA / liquid biopsy, AI diagnosis, XNA/ASO
5. **Enabling Platforms** — AI-for-science, lab automation, materials & memory devices

## Editing content

All copy, publications, and member lists live in **`tools/content.mjs`**.
Edit it, then regenerate the static pages:

```bash
node tools/build.mjs
```

The generated `.html` files are the deployable product — **no build step is needed to host them**.

## Deploy (GitHub Pages)

1. Push this repo to GitHub.
2. Settings → Pages → Source: `main` branch, `/ (root)`.
3. The site serves at `…/` (landing) → `…/en/` and `…/ko/`.

Uses Google Fonts (Space Grotesk, Inter, IBM Plex Mono) and no other external dependencies.
