/* =====================================================================
   BBL site content model  (edit here, then: node tools/build.mjs)
   - `ui`            : per-language interface strings
   - `researchAreas`: 5 areas, bilingual
   - `publications` : language-neutral (English papers) + topic tags
   - `members`      : bilingual role/note
   - `courses`      : teaching, bilingual
   Copy style: noun-form endings (nominal), KO & EN. Avoid full sentences.
   ===================================================================== */

export const site = {
  nameShort: "BBL",
  nameFull: { en: "Bioelectronics & Biooptics Lab", ko: "유전자 진단 및 치료 연구실" },
  tagline: { en: "Bioelectronics and biooptics for molecular information", ko: "분자 정보를 위한 바이오전자 · 바이오광학" },
  dept: {
    en: "Dept. of Nano-Bioengineering, Incheon National University",
    ko: "인천대학교 나노바이오공학전공",
  },
  scholar: "https://scholar.google.com/citations?hl=en&user=NqwCwVcAAAAJ",
  linkedin: "https://www.linkedin.com/in/youngjun-song-8a287620/",
  spinoff: "https://stdbioelec.com",
  piEmail: "yjunsong@inu.ac.kr",
  labEmail: "labmanager.bebo.inu@stdbioelec.com",
  copyright: "Bioelectronics & Biooptics Lab, Incheon National University",
  // Social / outreach. Replace "#" with real URLs; empty string hides the icon.
  social: {
    email: "labmanager.bebo.inu@stdbioelec.com",
    scholar: "https://scholar.google.com/citations?hl=en&user=NqwCwVcAAAAJ",
    linkedin: "https://www.linkedin.com/in/youngjun-song-8a287620/",
    x: "#",
    github: "#",
    youtube: "#",
    discord: "#",
  },
};

/* Navigation: page key -> file */
export const pages = [
  { key: "index",        file: "index.html" },
  { key: "research",     file: "research.html" },
  { key: "publications", file: "publications.html" },
  { key: "teaching",     file: "teaching.html" },
  { key: "members",      file: "members.html" },
  { key: "contact",      file: "contact.html" },
];

export const ui = {
  en: {
    langName: "EN",
    nav: { index: "Home", research: "Research", publications: "Publications", teaching: "Teaching", members: "People", join: "Join Us", contact: "Join & Contact" },
    cta: { research: "Explore Research", join: "Join the Lab", contact: "Get in Touch", allPubs: "View all publications", scholar: "Google Scholar", readMore: "Read more" },
    hero: {
      tag: "DNA · Bioelectronics · Biooptics",
      titleA: "Molecular systems that ",
      titleGrad: "write, store & compute",
      titleB: " information.",
      sub: "DNA and molecular hardware — electric-field synthesis, DNA data storage, molecular computing, and genetic diagnostics — for memory and biotechnology beyond the limits of CMOS.",
      meta: "PI Youngjun Song, Ph.D. · Incheon National University",
    },
    stats: [
      { num: "636", label: "Citations" },
      { num: "15", label: "h-index" },
      { num: "5", label: "Research thrusts" },
      { num: "2026", label: "Latest in Science Adv." },
    ],
    research: {
      eyebrow: "Research",
      head: "Five thrusts, one idea — DNA as an information medium.",
      sub: "From custom genes on a chip, to archives in DNA, to disease readout from a drop of blood — a single molecular toolkit, five directions.",
    },
    foundry: {
      eyebrow: "Technology · Foundry",
      head: "An on-chip DNA & gene foundry",
      body: "Electric-field synthesis (EPCR) — direct DNA and gene writing on microelectrode chips. A programmable, IDT-style foundry for custom oligos, genes, and mRNA, with industrial translation through our spin-off STD BioElec.",
      list: [
        "Electric-field DNA / gene synthesis on reusable chips (>10⁵ cycles)",
        "Custom oligos, gBlock-style genes, plasmid & mRNA/IVT assembly",
        "Cell-free protein expression pipelines",
        "Commercial translation via STD BioElec bio-foundry",
      ],
    },
    pubs: { eyebrow: "Selected Publications", head: "Recent work" },
    closing: { head: "Now recruiting", body: "Openings for graduate students, undergraduate interns, and postdocs across bio, semiconductor, CS, and AI.", cta: "See open positions" },
    pubPage: {
      title: "Publications",
      sub: "",
      desc: "Peer-reviewed papers and patents from the Bioelectronics & Biooptics Lab.",
      filters: [
        { key: "all", label: "All" },
        { key: "storage", label: "DNA Storage" },
        { key: "synthesis", label: "Synthesis" },
        { key: "computing", label: "Computing" },
        { key: "diagnosis", label: "Diagnostics" },
        { key: "materials", label: "Materials & Devices" },
        { key: "patent", label: "Patents" },
      ],
    },
    researchPage: { title: "Research", sub: "Five directions under one molecular view of information — writing, storage, computing, sensing, and the enabling platforms." },
    teachingPage: {
      title: "Teaching",
      sub: "",
      desc: "Undergraduate and graduate courses by Prof. Youngjun Song.",
      books: "Course books & writing",
      booksBody: "In-progress texts: a NAND Flash textbook + problem set, a BioPython book, molecular-biology / molecular-diagnostics chapters, and a synthetic-biology course text.",
    },
    membersPage: {
      title: "People",
      sub: "",
      desc: "The people of the Bioelectronics & Biooptics Lab.",
      pi: "Principal Investigator", postdocs: "Postdoctoral Researchers", students: "Graduate Researchers", alumni: "Alumni",
      education: "Education", experience: "Experience",
    },
    joinPage: {
      title: "Join Us",
      sub: "Tools that don't exist yet — from DNA data drives to self-made semiconductor cleanrooms.",
    },
    contactPage: { title: "Join & Contact", sub: "", desc: "Openings and contact for the Bioelectronics & Biooptics Lab." },
    footer: { explore: "Explore", connect: "Connect", tagline: "Molecular information systems for memory, computing, and health." },
    backHome: "Home",
  },
  ko: {
    langName: "KO",
    nav: { index: "홈", research: "연구", publications: "논문", teaching: "강의", members: "구성원", join: "합류", contact: "합류 · 연락처" },
    cta: { research: "연구 살펴보기", join: "연구실 합류", contact: "문의하기", allPubs: "전체 논문 보기", scholar: "Google Scholar", readMore: "상세읽기" },
    hero: {
      tag: "DNA · 바이오전자 · 바이오광학",
      titleA: "정보를 ",
      titleGrad: "쓰고, 저장하고, 연산하는",
      titleB: " 분자 시스템.",
      sub: "전기장 DNA 합성, DNA 데이터 스토리지, 분자 컴퓨팅, 유전자 진단 — CMOS의 한계를 넘어서는 메모리와 바이오테크놀로지를 위한 DNA·분자 하드웨어.",
      meta: "책임교수 송영준 · 인천대학교",
    },
    stats: [
      { num: "636", label: "총 인용" },
      { num: "15", label: "h-index" },
      { num: "5", label: "연구 방향" },
      { num: "2026", label: "Science Adv. 최신 게재" },
    ],
    research: {
      eyebrow: "연구",
      head: "다섯 갈래, 하나의 생각 — DNA를 정보의 매체로",
      sub: "칩 위 유전자 합성부터 DNA 아카이브 저장, 한 방울 혈액 진단까지 — 하나의 분자 도구상자, 다섯 갈래의 연구.",
    },
    foundry: {
      eyebrow: "기술 · 파운드리",
      head: "칩 위의 DNA·유전자 파운드리",
      body: "미세전극 칩 위 전기장 DNA·유전자 직접 합성(EPCR) — 커스텀 올리고·유전자·mRNA를 위한 IDT식 프로그래머블 파운드리, 그리고 스핀오프 STD BioElec를 통한 산업화.",
      list: [
        "재사용 칩 위 전기장 DNA·유전자 합성 (10⁵회 이상)",
        "커스텀 올리고, gBlock형 유전자, 플라스미드·mRNA/IVT 조립",
        "무세포 단백질 발현 파이프라인",
        "STD BioElec 바이오파운드리를 통한 상용화",
      ],
    },
    pubs: { eyebrow: "대표 논문", head: "최근 연구" },
    closing: { head: "함께할 연구자 모집", body: "생명·반도체·전산·AI 배경의 대학원생·학부 인턴·박사후연구원 환영.", cta: "모집 공고 보기" },
    pubPage: {
      title: "논문",
      sub: "",
      desc: "유전자 진단 및 치료 연구실의 동료심사 논문과 특허.",
      filters: [
        { key: "all", label: "전체" },
        { key: "storage", label: "DNA 스토리지" },
        { key: "synthesis", label: "합성" },
        { key: "computing", label: "컴퓨팅" },
        { key: "diagnosis", label: "진단" },
        { key: "materials", label: "소재·디바이스" },
        { key: "patent", label: "특허" },
      ],
    },
    researchPage: { title: "연구", sub: "정보를 분자의 관점으로 본 다섯 갈래 — 합성, 저장, 연산, 감지, 그리고 이를 가능케 하는 플랫폼." },
    teachingPage: {
      title: "강의",
      sub: "",
      desc: "송영준 교수의 학부·대학원 강의.",
      books: "교재 · 저술",
      booksBody: "집필 중인 교재: NAND Flash 교재+문제집, 바이오파이썬 책, 분자생물학·분자진단 챕터, 합성생물학 교재.",
    },
    membersPage: {
      title: "구성원",
      sub: "",
      desc: "유전자 진단 및 치료 연구실 구성원.",
      pi: "책임교수", postdocs: "박사후 연구원", students: "대학원 연구원", alumni: "졸업생",
      education: "학력", experience: "경력",
    },
    joinPage: {
      title: "합류하기",
      sub: "아직 세상에 없는 도구 — DNA 데이터 드라이브부터 자작 반도체 클린룸까지.",
    },
    contactPage: { title: "합류 · 연락처", sub: "", desc: "유전자 진단 및 치료 연구실 모집 · 연락." },
    footer: { explore: "둘러보기", connect: "연결", tagline: "메모리·컴퓨팅·헬스케어를 위한 분자 정보 시스템." },
    backHome: "홈",
  },
};

export const researchAreas = [
  {
    ix: "01", icon: "synthesis",
    en: { name: "DNA Synthesis & Synthetic Biology", tagline: "On-demand DNA, gene, and mRNA writing",
      body: "Direct electric-field DNA writing on microelectrode chips (EPCR), plus assembly of genes, plasmids, and mRNA — an on-chip, IDT-style foundry for programmable synthetic biology.",
      bullets: [
        "Electric-field DNA / selective gene synthesis (EPCR) on reusable chips",
        "Amine-to-amine gold-surface conjugation for field-assisted hybridization",
        "Plasmid assembly, mRNA / IVT, and cell-free protein expression",
        "On-demand custom oligo & gene foundry (STD BioElec spin-off)",
      ] },
    ko: { name: "DNA 합성 · 합성생물학", tagline: "온디맨드 DNA·유전자·mRNA 합성",
      body: "미세전극 칩 위 전기장 DNA 직접 합성(EPCR)과 유전자·플라스미드·mRNA 조립 — 프로그래머블 합성생물학을 위한 IDT식 온칩 파운드리.",
      bullets: [
        "재사용 칩 위 전기장 DNA·선택적 유전자 합성 (EPCR)",
        "금 표면 아민-아민 결합을 통한 전기장 혼성화",
        "플라스미드 조립, mRNA/IVT, 무세포 단백질 발현",
        "온디맨드 커스텀 올리고·유전자 파운드리 (STD BioElec)",
      ] },
    tags: ["EPCR", "ssDNA", "mRNA/IVT", "Foundry"],
  },
  {
    ix: "02", icon: "storage",
    en: { name: "DNA Data Storage", tagline: "Archives that fit in a drop of liquid",
      body: "High-density encoding of digital data — 3D models, point clouds, cultural heritage — into DNA, with fast decoding via tailored error-correcting codecs and a liquid, electrically random-accessed DNA drive.",
      bullets: [
        "High-data-density, high-speed DNA data ink for digital preservation",
        "Liquid DNA drive with electric-field random access (EPCR)",
        "Reed–Solomon / erasure-coding CODECs for reliable decoding",
        "Point-cloud & STL storage; digital cultural-heritage archiving",
      ] },
    ko: { name: "DNA 데이터 스토리지", tagline: "한 방울에 담기는 아카이브",
      body: "3D 모델·포인트클라우드·문화재 같은 디지털 데이터의 DNA 고밀도 인코딩, 그리고 맞춤형 오류정정 코덱과 전기장 랜덤액세스 액체 DNA 드라이브 기반 고속 디코딩.",
      bullets: [
        "디지털 보존을 위한 고밀도·고속 DNA 데이터 잉크",
        "전기장 랜덤액세스 액체 DNA 드라이브 (EPCR)",
        "신뢰성 디코딩을 위한 RS·소거정정 코덱",
        "포인트클라우드·STL 저장, 디지털 문화재 아카이빙",
      ] },
    tags: ["CODEC", "Data-Ink", "Random-Access", "Heritage"],
  },
  {
    ix: "03", icon: "computing",
    en: { name: "Molecular & DNA Computing", tagline: "Logic and memory made of molecules",
      body: "Computation with molecules — droplet-based Boolean logic, in-cell miRNA logic driving fluorescent-protein outputs, multi-bit FRET molecular memory, and machine-learning-assisted strand-displacement circuits.",
      bullets: [
        "Programmable DNA Boolean logic in droplet microfluidics",
        "In-cell miRNA logic → fluorescent-protein (RFP/GFP) output",
        "Multi-bit fluorescent (FRET) DNA memory encoding",
        "RNA–DNA chimera strand displacement with ML-assisted readout",
      ] },
    ko: { name: "분자 · DNA 컴퓨팅", tagline: "분자로 만드는 논리와 메모리",
      body: "분자로 하는 연산 — 드롭릿 기반 불리언 논리, 형광단백질 출력을 구동하는 세포 내 miRNA 논리, 다중비트 FRET 분자 메모리, 머신러닝 기반 가닥치환 회로.",
      bullets: [
        "드롭릿 미세유체 프로그래머블 DNA 불리언 논리",
        "세포 내 miRNA 논리 → 형광단백질(RFP/GFP) 출력",
        "다중비트 형광(FRET) DNA 메모리 인코딩",
        "ML 기반 판독의 RNA–DNA 키메라 가닥치환",
      ] },
    tags: ["Boolean", "FRET", "Strand-Disp", "In-Cell"],
  },
  {
    ix: "04", icon: "diagnosis",
    en: { name: "Genetic Diagnosis & Therapy", tagline: "Disease readout from nucleic acids",
      body: "Detection of disease-linked microRNA and cell-free DNA via enzyme-free chemical ligation and electric/optical chips — liquid biopsy coupled with AI for early diagnosis, plus emerging XNA/ASO therapeutic directions.",
      bullets: [
        "Enzyme-free splint / click chemical ligation for miRNA detection",
        "DEP–ITO FRET chips for high-sensitivity nucleic-acid sensing",
        "Circulating cell-free DNA & qPCR liver-cancer (HCC) markers",
        "AI-assisted liquid-biopsy diagnosis; emerging XNA / ASO therapy",
      ] },
    ko: { name: "유전자 진단 · 치료", tagline: "핵산 기반 질병 판독",
      body: "무효소 화학 라이게이션과 전기·광학 칩 기반 질병 연관 microRNA·순환 cell-free DNA 검출, 액상생검과 AI 결합 조기 진단, 그리고 XNA/ASO 치료로의 확장.",
      bullets: [
        "miRNA 검출을 위한 무효소 splint/click 화학 라이게이션",
        "고감도 핵산 검출용 DEP–ITO FRET 칩",
        "순환 cell-free DNA·qPCR 기반 간암(HCC) 마커",
        "AI 기반 액상생검 진단, XNA/ASO 치료로 확장",
      ] },
    tags: ["miRNA", "Liquid-Biopsy", "DEP", "AI-Dx"],
  },
  {
    ix: "05", icon: "platform",
    en: { name: "Enabling Platforms", tagline: "AI, automation & devices that power the lab",
      body: "Cross-cutting infrastructure — AI for science, self-built lab robotics in place of costly instruments, and the nanomaterials and semiconductor devices beneath every project: CNT composites, liquid-metal microfluidics, memory arrays.",
      bullets: [
        "AI for science: protein/structure prediction, LLM gene-token algorithms, point-cloud deep learning",
        "Lab automation: pipetting robots, sourcemeter scripting, microscope & cleanroom builds",
        "CNT composites & flexible electronics; liquid-metal microfluidics",
        "Semiconductor memory devices (PIM / NAND) and process integration",
      ] },
    ko: { name: "지원 플랫폼", tagline: "연구를 떠받치는 AI·자동화·소자",
      body: "모든 프로젝트를 관통하는 인프라 — 과학을 위한 AI, 고가 장비를 대체하는 자작 랩 로봇, 그리고 그 아래 나노소재·반도체 소자: CNT 복합체, 액체금속 미세유체, 메모리 어레이.",
      bullets: [
        "과학을 위한 AI: 단백질/구조 예측, LLM 유전자 토큰 알고리즘, 포인트클라우드 딥러닝",
        "랩 자동화: 파이펫 로봇, 소스미터 스크립팅, 현미경·클린룸 자작",
        "CNT 복합체·유연전자, 액체금속 미세유체",
        "반도체 메모리 소자(PIM/NAND)와 공정 통합",
      ] },
    tags: ["AI4Science", "Automation", "CNT", "Liquid-Metal"],
  },
];

/* Publications — from the PI's Google Scholar; topics drive the filter.
   author: string with the PI wrapped in <b>…</b>. featured: shows a badge. */
export const publications = [
  { year: "2026", title: "Electric field–guided random-access DNA data storage", authors: "D. Lim, T. Kang, W. Lee, <b>Y. Song</b>", venue: "Science Advances", topics: ["storage", "synthesis"], featured: "Featured" },
  { year: "2026", title: "High-Data-Density, High-Decoding-Speed, and High-Decoding-Accuracy DNA Data Ink for Digital Preservation", authors: "T. Kang, D. Lim, W. Lee, J. Kim, X. Huang, J. Kim, <b>Y. Song</b>", venue: "ACS Nano", topics: ["storage"], featured: "Featured" },
  { year: "2025", title: "Enzyme-free chemical DNA ligation via amine-crosslinker-mediated DNA assembly for miRNA detection", authors: "D. Lim, Z. Haider, H. Lim, W. Lee, T. Kang, H.S. Eun, J. Kim, <b>Y. Song</b>", venue: "Cell Reports Physical Science", topics: ["diagnosis"], featured: "Featured" },
  { year: "2025", title: "Polymerase elongation onto patterned DNA for random-accessed DNA data storage", authors: "T. Kang, D. Lim, W. Lee, <b>Y. Song</b>", venue: "BioChip Journal 19(3), 636–648", topics: ["storage", "synthesis"] },
  { year: "2025", title: "Amine-to-amine DNA conjugation on gold surfaces for electric field-assisted hybridization", authors: "D. Lim, S. Noh, T. Kang, N. Nergui, H.S. Eun, <b>Y. Song</b>", venue: "Langmuir 41(10), 7008–7015", topics: ["synthesis"] },
  { year: "2025", title: "High-ratio carbon nanotube–carboxymethyl cellulose composite grid for Joule heating device", authors: "W. Lee, D. Lim, T. Kang, C. Lee, S. Noh, H.S. Eun, J.W. Lee, <b>Y. Song</b>", venue: "Advanced Composite Materials", topics: ["materials"] },
  { year: "2025", title: "Elastic conductive CNT/Ecoflex nanocomposites for tactile sensing", authors: "W. Lee, C.H. Lee, T. Kang, <b>Y. Song</b>", venue: "Soft Materials 23(1–2), 45–54", topics: ["materials"] },
  { year: "2024", title: "The multiple fluorescent multi-bit DNA memory encoding system", authors: "N. Nergui, J. Kim, D. Lim, W. Lee, T. Kang, S. Kim, M.S. Shim, <b>Y. Song</b>", venue: "Nano Communication Networks 39, 100497", topics: ["computing", "storage"] },
  { year: "2024", title: "Fabrication of directional carbon nanotube networks by dielectrophoresis with layer-by-layer deposition", authors: "J. Kim, C.H. Lee, C. Lee, N. Nergui, S. Noh, D. Lim, K.H. Song, S. Kim, <b>Y. Song</b>", venue: "IEEE Access 12, 26410–26418", topics: ["materials"] },
  { year: "2024", title: "Eutectic gallium–indium transparent conductive electrodes on flexible substrates for touch sensors", authors: "H. Kim, <b>Y. Song</b>, S. Chang", venue: "Microelectronics Reliability 157, 115402", topics: ["materials"] },
  { year: "2023", title: "Liquid metal electrodynamic accumulation microfluidics system for DNA memory and liquid biopsy", authors: "Y. Jeong, S. Noh, M. Yu, S. Chang, H. Eun, J. Kim, <b>Y. Song</b>", venue: "Advanced Functional Materials 33(51) — Cover", topics: ["storage", "diagnosis", "materials"], featured: "Cover" },
  { year: "2023", title: "Processing DNA storage through programmable assembly in a droplet-based fluidics system", authors: "M. Yu, D. Lim, J. Kim, <b>Y. Song</b>", venue: "Advanced Science 10(32), 2303197", topics: ["storage", "computing"] },
  { year: "2023", title: "Structural conductive carbon nanotube nanocomposites for stretchable electronics", authors: "J. Ahn, S. Noh, D. Kim, B.S. Kim, S. Kim, <b>Y. Song</b>", venue: "Materials Research Express 10(3), 036304", topics: ["materials"] },
  { year: "2021", title: "Programmable DNA-based Boolean logic microfluidic processing unit", authors: "W. Lee, M. Yu, D. Lim, T. Kang, <b>Y. Song</b>", venue: "ACS Nano 15(7), 11644–11654", topics: ["computing"], featured: "Featured" },
  { year: "2021", title: "Dielectrophoretic trapping for nanoparticles, high-molecular-weight DNA, and SYBR Gold using a PCB", authors: "S. Noh, <b>Y. Song</b>", venue: "IEEE Sensors Journal 21(17), 18451–18458", topics: ["materials", "diagnosis"] },
  { year: "2021", title: "Vacuum-filtration fabrication for diverse conductive transparent cellulose electronic devices", authors: "S. Noh, H. An, <b>Y. Song</b>", venue: "Cellulose 28(5), 3081–3096", topics: ["materials"] },
  { year: "2020", title: "DNA double-write / double-binding identity", authors: "M.J. Heller, E. Skowronski, <b>Y. Song</b>, J. Warner, S. Chen", venue: "US Patent 10,754,250", topics: ["patent", "storage"] },
  { year: "2020", title: "Poly-thymine-based DNA photolithography onto electrostatic coupling substrates", authors: "<b>Y. Song</b>", venue: "Materials Science & Engineering: C 111, 110795", topics: ["storage", "synthesis"] },
  { year: "2018", title: "DNA multi-bit non-volatile memory and bit-shifting operations using addressable electrode arrays and electric-field-induced hybridization", authors: "<b>Y. Song</b>, S. Kim, M.J. Heller, X. Huang", venue: "Nature Communications 9(1), 281", topics: ["storage", "computing"], featured: "Featured" },
  { year: "2016", title: "Thin-film deposition apparatus and method using electric field", authors: "J.S. Heo, K. Choi, S.J. Kim, M.J. Heller, <b>Y.J. Song</b>", venue: "US Patent 9,399,826", topics: ["patent", "materials"] },
];

export const members = {
  pi: {
    name: "Youngjun Song", nameKo: "송영준", initials: "YS",
    roleEn: "Principal Investigator · Associate Professor, Nano-Bioengineering",
    roleKo: "책임교수 · 인천대학교 나노바이오공학전공 부교수",
    bioEn: "Intelligent semiconductors and nano-bioengineering. Memory-device physics, DNA nanotechnology, and AI toward molecular information systems.",
    bioKo: "지능형 반도체와 나노바이오공학. 메모리 소자 물리·DNA 나노기술·AI를 잇는 분자 정보 시스템.",
    education: [
      { yr: "2011–2014", en: "Ph.D., University of California, San Diego", ko: "박사, 미국 UC San Diego" },
      { yr: "2009–2011", en: "M.S., University of California, San Diego", ko: "석사, 미국 UC San Diego" },
      { yr: "2002–2006", en: "B.S., Inha University", ko: "학사, 인하대학교" },
    ],
    experience: [
      { yr: "2015–2018", en: "Hyundai Motor Central R&D — ADAS & digital cockpit", ko: "현대자동차 중앙연구소 — 주행보조·디지털 콕핏" },
      { yr: "2015", en: "UC San Diego — gene-analysis semiconductor", ko: "UC San Diego — 유전자 분석 반도체" },
      { yr: "2006–2008", en: "Samsung Electronics — Charge-Trap Flash memory", ko: "삼성전자 — Charge-Trap Flash 메모리 개발" },
    ],
    scholar: "https://scholar.google.com/citations?hl=en&user=NqwCwVcAAAAJ",
    linkedin: "https://www.linkedin.com/in/youngjun-song-8a287620/",
    email: "yjunsong@inu.ac.kr",
  },
  postdocs: [
    { name: "Doyoen Lim", nameKo: "임도연", initials: "DL", roleEn: "Postdoctoral Researcher", roleKo: "박사후 연구원", focusEn: "Synthetic Biology", focusKo: "합성생물학", scholar: "https://scholar.google.com/citations?user=s1V6SisAAAAJ&hl=en", linkedin: "#", x: "#" },
    { name: "Wonjin Lee", nameKo: "이원진", initials: "WL", roleEn: "Postdoctoral Researcher", roleKo: "박사후 연구원", focusEn: "Semiconductor · AI", focusKo: "반도체 · AI", scholar: "https://scholar.google.com/citations?user=yO5hGRgAAAAJ&hl=en", linkedin: "#", x: "#" },
  ],
  students: [
    { name: "Taeseok Kang", nameKo: "강태석", initials: "TK", roleEn: "Ph.D. Candidate · Bio-Nanoengineering", roleKo: "박사과정 · 생명나노바이오공학", focusEn: "DNA Data Storage", focusKo: "DNA 데이터 스토리지", scholar: "https://scholar.google.com/citations?user=M8axdgsAAAAJ&hl=en", linkedin: "#", x: "#" },
    { name: "Byunghyun Cho", nameKo: "조병현", initials: "BC", roleEn: "M.S. Student · Intelligent Semiconductor", roleKo: "석사과정 · 지능형반도체", focusEn: "Chip · Semiconductor", focusKo: "칩 · 반도체", linkedin: "#", x: "#" },
  ],
  alumni: [
    { name: "Seunghwan Noh", nameKo: "노승환", noteEn: "M.S. → Ph.D. student, Northeastern University", noteKo: "석사 졸업 → Northeastern 박사과정" },
    { name: "Minsang Yu", nameKo: "유민상", noteEn: "M.S. (formerly Macrogen)", noteKo: "석사 졸업 (전 마크로젠)" },
    { name: "Jeongwoo Kim", nameKo: "김정우", noteEn: "M.S.", noteKo: "석사 졸업" },
    { name: "Changjae Lee", nameKo: "이창재", noteEn: "M.S. → CS, University of Southern California", noteKo: "석사 졸업 → USC 전산 과정" },
    { name: "Zeeshan Haider", nameKo: "지산 하이더", noteEn: "Researcher · Bio-Nanoengineering", noteKo: "연구원 · 생명나노바이오공학" },
  ],
};

export const positions = {
  en: [
    { role: "Ph.D. / M.S. Students", detail: "Nano-bioengineering, intelligent semiconductors, or related. Full research assistantship." },
    { role: "Undergraduate Interns", detail: "Semester and summer projects across all five research thrusts." },
    { role: "Postdoctoral Researchers", detail: "DNA storage, molecular computing, bioelectronics, or AI-for-science." },
  ],
  ko: [
    { role: "박사 · 석사과정", detail: "나노바이오공학, 지능형 반도체 또는 관련 분야. 연구조교 지원." },
    { role: "학부 인턴", detail: "다섯 연구 방향 전반에 걸친 학기·여름 프로젝트." },
    { role: "박사후 연구원", detail: "DNA 스토리지, 분자 컴퓨팅, 바이오전자, AI for Science." },
  ],
};

/* Teaching — Prof. Youngjun Song's courses. levelKey groups the list. */
export const courses = [
  { levelEn: "Undergraduate", levelKo: "학부", en: "Electronic & Electrical Properties (Semiconductor Devices)", ko: "전자전기물성 (반도체 소자)", descEn: "Bands, carriers, MOSFETs", descKo: "밴드·캐리어·MOSFET" },
  { levelEn: "Undergraduate", levelKo: "학부", en: "Bioelectronics", ko: "바이오전자공학", descEn: "Semiconductor processes → DEP, liquid biopsy, DNA storage / logic", descKo: "반도체 8대 공정 → DEP·액상생검·DNA 저장/로직" },
  { levelEn: "Undergraduate", levelKo: "학부", en: "Nanodevice Engineering (DNA Nanotech)", ko: "나노소자공학 (DNA 나노텍)", descEn: "Synthesis → PCR → Sanger → NGS", descKo: "합성 → PCR → Sanger → NGS" },
  { levelEn: "Undergraduate", levelKo: "학부", en: "Nano Thin-Film Engineering (Bio-Computing)", ko: "나노박막공학 (바이오컴퓨터공학)", descEn: "DNA computing / storage, MATLAB, RS codes", descKo: "DNA 컴퓨팅/스토리지, MATLAB, RS 코드" },
  { levelEn: "Undergraduate", levelKo: "학부", en: "Bio-Nano Analytical Engineering", ko: "바이오나노 분석공학", descEn: "SEM / TEM / AFM, HPLC, ITC, NMR, XPS", descKo: "SEM·TEM·AFM, HPLC, ITC, NMR, XPS" },
  { levelEn: "Undergraduate", levelKo: "학부", en: "Encoding Theory (ECC / RS)", ko: "인코딩 이론 (ECC / RS)", descEn: "Hamming, Reed–Solomon, erasure coding", descKo: "Hamming, Reed–Solomon, 소거정정 코딩" },
  { levelEn: "UG / Graduate", levelKo: "학부·대학원", en: "Bioinformatics", ko: "바이오인포매틱스", descEn: "NGS pipeline — QC → alignment → quantification → visualization", descKo: "NGS 파이프라인 — QC → 정렬 → 정량 → 시각화" },
  { levelEn: "Graduate", levelKo: "대학원", en: "Molecular Biology Review & Paper Reading", ko: "분자생물학 리뷰 · 논문지도", descEn: "Molecular-diagnostics review + recent literature", descKo: "분자진단 리뷰 + 최신 논문 읽기" },
];

export const contactInfo = {
  addressEn: "Dept. of Nano-Bioengineering, Incheon National University, 119 Academy-ro, Yeonsu-gu, Incheon 22012, Republic of Korea",
  addressKo: "인천광역시 연수구 아카데미로 119, 인천대학교 나노바이오공학전공 (우 22012)",
};
