/* =====================================================================
   AMSL site content model  (edit here, then: node tools/build.mjs)
   - `ui`            : per-language interface strings
   - `researchAreas`: 5 areas, bilingual
   - `publications` : language-neutral (English papers) + topic tags
   - `members`      : bilingual role/note
   ===================================================================== */

export const site = {
  nameShort: "AMSL",
  nameFull: { en: "Adaptive Memory Systems Lab", ko: "적응형 메모리 시스템 연구실" },
  tagline: { en: "Building Next-Generation Memory Beyond CMOS", ko: "CMOS를 넘어서는 차세대 메모리를 만듭니다" },
  dept: {
    en: "Genetic Diagnosis & Therapy Lab · Dept. of Nano-Bioengineering, Incheon National University",
    ko: "유전자 진단 & 치료 연구실 · 인천대학교 나노바이오공학전공",
  },
  scholar: "https://scholar.google.com/citations?hl=en&user=NqwCwVcAAAAJ",
  linkedin: "https://www.linkedin.com/in/youngjun-song-8a287620/",
  spinoff: "https://stdbioelec.com",
  piEmail: "yjunsong@inu.ac.kr",
  labEmail: "labmanager.bebo.inu@stdbioelec.com",
  copyright: "Adaptive Memory Systems Lab, Incheon National University",
};

/* Navigation: page key -> file */
export const pages = [
  { key: "index",        file: "index.html" },
  { key: "research",     file: "research.html" },
  { key: "publications", file: "publications.html" },
  { key: "members",      file: "members.html" },
  { key: "join",         file: "join.html" },
  { key: "contact",      file: "contact.html" },
];

export const ui = {
  en: {
    langName: "EN",
    nav: { index: "Home", research: "Research", publications: "Publications", members: "People", join: "Join Us", contact: "Contact" },
    cta: { research: "Explore Research", join: "Join the Lab", contact: "Get in Touch", allPubs: "View all publications", scholar: "Google Scholar" },
    hero: {
      tag: "DNA · Memory · Bioelectronics",
      titleA: "Molecular systems that ",
      titleGrad: "write, store & compute",
      titleB: " information.",
      sub: "We engineer DNA and molecular hardware — electric-field synthesis, DNA data storage, molecular computing, and genetic diagnostics — to build memory and biotechnology beyond the limits of CMOS.",
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
      head: "Five thrusts, one idea: DNA as an information medium.",
      sub: "From writing custom genes on a chip to storing archives in DNA and diagnosing disease from a drop of blood — a single molecular toolkit, five directions.",
    },
    foundry: {
      eyebrow: "Technology · Foundry",
      head: "An on-chip DNA & gene foundry",
      body: "Our electric-field synthesis platform (EPCR) writes DNA and genes directly on microelectrode chips — a programmable, IDT-style foundry for custom oligos, genes, and mRNA, translated to industry through our spin-off STD BioElec.",
      list: [
        "Electric-field DNA / gene synthesis on reusable chips (>10⁵ cycles)",
        "Custom oligos, gBlock-style genes, plasmid & mRNA/IVT assembly",
        "Cell-free protein expression pipelines",
        "Commercial translation via STD BioElec bio-foundry",
      ],
    },
    pubs: { eyebrow: "Selected Publications", head: "Recent work" },
    closing: { head: "We are recruiting.", body: "Graduate students, undergraduate interns, and postdocs from bio, semiconductor, CS, and AI backgrounds are welcome.", cta: "See open positions" },
    pubPage: {
      title: "Publications",
      sub: "Peer-reviewed papers and patents from AMSL. Filter by research topic.",
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
    researchPage: { title: "Research", sub: "Five directions unified by a molecular view of information — write, store, compute, sense, and the platforms that enable them." },
    membersPage: {
      title: "People",
      sub: "A team spanning nano-bioengineering, semiconductor devices, and AI.",
      pi: "Principal Investigator", postdocs: "Postdoctoral Researchers", students: "Graduate Researchers", alumni: "Alumni",
      education: "Education", experience: "Experience",
    },
    joinPage: {
      title: "Join Us",
      sub: "We build tools that don't exist yet — from DNA data drives to self-made semiconductor cleanrooms. If that excites you, let's talk.",
    },
    contactPage: { title: "Contact", sub: "Reach the lab, the PI, or our spin-off." },
    footer: { explore: "Explore", connect: "Connect", tagline: "Molecular information systems for memory, computing, and health." },
    backHome: "Home",
  },
  ko: {
    langName: "KO",
    nav: { index: "홈", research: "연구", publications: "논문", members: "구성원", join: "합류", contact: "연락처" },
    cta: { research: "연구 살펴보기", join: "연구실 합류", contact: "문의하기", allPubs: "전체 논문 보기", scholar: "Google Scholar" },
    hero: {
      tag: "DNA · 메모리 · 바이오전자",
      titleA: "정보를 ",
      titleGrad: "쓰고, 저장하고, 연산하는",
      titleB: " 분자 시스템.",
      sub: "전기장 DNA 합성, DNA 데이터 스토리지, 분자 컴퓨팅, 유전자 진단 — DNA와 분자 하드웨어를 설계해 CMOS의 한계를 넘어서는 메모리와 바이오테크놀로지를 만듭니다.",
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
      head: "다섯 갈래, 하나의 생각 — DNA를 정보의 매체로.",
      sub: "칩 위에서 유전자를 합성하고, 아카이브를 DNA에 저장하고, 한 방울의 혈액으로 질병을 진단하기까지 — 하나의 분자 도구상자, 다섯 갈래의 연구.",
    },
    foundry: {
      eyebrow: "기술 · 파운드리",
      head: "칩 위의 DNA·유전자 파운드리",
      body: "전기장 합성 플랫폼(EPCR)은 미세전극 칩 위에서 DNA와 유전자를 직접 씁니다 — 커스텀 올리고·유전자·mRNA를 만드는 IDT식 프로그래머블 파운드리이며, 스핀오프 STD BioElec를 통해 산업으로 이어집니다.",
      list: [
        "재사용 칩 위 전기장 DNA·유전자 합성 (10⁵회 이상)",
        "커스텀 올리고, gBlock형 유전자, 플라스미드·mRNA/IVT 조립",
        "무세포 단백질 발현 파이프라인",
        "STD BioElec 바이오파운드리를 통한 상용화",
      ],
    },
    pubs: { eyebrow: "대표 논문", head: "최근 연구" },
    closing: { head: "함께할 분을 찾습니다.", body: "생명·반도체·전산·AI를 배경으로 한 대학원생, 학부 인턴, 박사후연구원을 환영합니다.", cta: "모집 공고 보기" },
    pubPage: {
      title: "논문",
      sub: "AMSL의 동료심사 논문과 특허. 연구 주제별로 필터링할 수 있습니다.",
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
    researchPage: { title: "연구", sub: "정보를 분자의 관점으로 바라보는 다섯 갈래 — 쓰고, 저장하고, 연산하고, 감지하고, 이를 가능케 하는 플랫폼." },
    membersPage: {
      title: "구성원",
      sub: "나노바이오공학, 반도체 소자, AI를 아우르는 팀.",
      pi: "책임교수", postdocs: "박사후 연구원", students: "대학원 연구원", alumni: "졸업생",
      education: "학력", experience: "경력",
    },
    joinPage: {
      title: "합류하기",
      sub: "우리는 아직 세상에 없는 도구를 만듭니다 — DNA 데이터 드라이브부터 자작 반도체 클린룸까지. 설렌다면, 이야기해요.",
    },
    contactPage: { title: "연락처", sub: "연구실, 책임교수, 스핀오프로 연락하실 수 있습니다." },
    footer: { explore: "둘러보기", connect: "연결", tagline: "메모리·컴퓨팅·헬스케어를 위한 분자 정보 시스템." },
    backHome: "홈",
  },
};

export const researchAreas = [
  {
    ix: "01", icon: "synthesis",
    en: { name: "DNA Synthesis & Synthetic Biology", tagline: "Writing DNA, genes, and mRNA on demand",
      body: "We write DNA directly with electric fields on microelectrode chips (EPCR), then assemble genes, plasmids, and mRNA — an on-chip, IDT-style foundry for programmable synthetic biology.",
      bullets: [
        "Electric-field DNA / selective gene synthesis (EPCR) on reusable chips",
        "Amine-to-amine gold-surface conjugation for field-assisted hybridization",
        "Plasmid assembly, mRNA / IVT, and cell-free protein expression",
        "On-demand custom oligo & gene foundry (STD BioElec spin-off)",
      ] },
    ko: { name: "DNA 합성 · 합성생물학", tagline: "DNA·유전자·mRNA를 온디맨드로",
      body: "미세전극 칩 위에서 전기장으로 DNA를 직접 쓰고(EPCR), 유전자·플라스미드·mRNA를 조립합니다 — 프로그래머블 합성생물학을 위한 IDT식 온칩 파운드리.",
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
      body: "We encode digital data — 3D models, point clouds, cultural heritage — into DNA at high density and decode it fast with tailored error-correcting codecs and a liquid, electrically random-accessed DNA drive.",
      bullets: [
        "High-data-density, high-speed DNA data ink for digital preservation",
        "Liquid DNA drive with electric-field random access (EPCR)",
        "Reed–Solomon / erasure-coding CODECs for reliable decoding",
        "Point-cloud & STL storage; digital cultural-heritage archiving",
      ] },
    ko: { name: "DNA 데이터 스토리지", tagline: "한 방울에 담기는 아카이브",
      body: "3D 모델·포인트클라우드·문화재 같은 디지털 데이터를 DNA에 고밀도로 인코딩하고, 맞춤형 오류정정 코덱과 전기장 랜덤액세스 액체 DNA 드라이브로 빠르게 디코딩합니다.",
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
      body: "We compute with molecules: droplet-based Boolean logic, in-cell miRNA logic that drives fluorescent-protein outputs, multi-bit FRET molecular memory, and machine-learning-assisted strand-displacement circuits.",
      bullets: [
        "Programmable DNA Boolean logic in droplet microfluidics",
        "In-cell miRNA logic → fluorescent-protein (RFP/GFP) output",
        "Multi-bit fluorescent (FRET) DNA memory encoding",
        "RNA–DNA chimera strand displacement with ML-assisted readout",
      ] },
    ko: { name: "분자 · DNA 컴퓨팅", tagline: "분자로 만드는 논리와 메모리",
      body: "분자로 연산합니다: 드롭릿 기반 불리언 논리, 형광단백질 출력을 구동하는 세포 내 miRNA 논리, 다중비트 FRET 분자 메모리, 머신러닝 기반 가닥치환 회로.",
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
    en: { name: "Genetic Diagnosis & Therapy", tagline: "Reading disease from nucleic acids",
      body: "We detect disease-linked microRNA and cell-free DNA with enzyme-free chemical ligation and electric/optical chips, coupling liquid biopsy with AI for early diagnosis — with emerging XNA/ASO therapeutic directions.",
      bullets: [
        "Enzyme-free splint / click chemical ligation for miRNA detection",
        "DEP–ITO FRET chips for high-sensitivity nucleic-acid sensing",
        "Circulating cell-free DNA & qPCR liver-cancer (HCC) markers",
        "AI-assisted liquid-biopsy diagnosis; emerging XNA / ASO therapy",
      ] },
    ko: { name: "유전자 진단 · 치료", tagline: "핵산으로 질병을 읽다",
      body: "무효소 화학 라이게이션과 전기·광학 칩으로 질병 연관 microRNA와 순환 cell-free DNA를 검출하고, 액상생검과 AI를 결합해 조기 진단합니다 — XNA/ASO 치료로도 확장 중입니다.",
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
      body: "Cross-cutting infrastructure: AI for science, self-built lab robotics that replace costly instruments, and the nanomaterials and semiconductor devices — CNT composites, liquid-metal microfluidics, memory arrays — underneath every project.",
      bullets: [
        "AI for science: protein/structure prediction, LLM gene-token algorithms, point-cloud deep learning",
        "Lab automation: pipetting robots, sourcemeter scripting, microscope & cleanroom builds",
        "CNT composites & flexible electronics; liquid-metal microfluidics",
        "Semiconductor memory devices (PIM / NAND) and process integration",
      ] },
    ko: { name: "지원 플랫폼", tagline: "연구를 떠받치는 AI·자동화·소자",
      body: "모든 프로젝트를 관통하는 인프라: 과학을 위한 AI, 고가 장비를 대체하는 자작 랩 로봇, 그리고 그 아래의 나노소재·반도체 소자 — CNT 복합체, 액체금속 미세유체, 메모리 어레이.",
      bullets: [
        "과학을 위한 AI: 단백질/구조 예측, LLM 유전자 토큰 알고리즘, 포인트클라우드 딥러닝",
        "랩 자동화: 파이펫 로봇, 소스미터 스크립팅, 현미경·클린룸 자작",
        "CNT 복합체·유연전자, 액체금속 미세유체",
        "반도체 메모리 소자(PIM/NAND)와 공정 통합",
      ] },
    tags: ["AI4Science", "Automation", "CNT", "Liquid-Metal"],
  },
];

/* Publications — English (papers are English); topics drive the filter.
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
    bioEn: "Intelligent semiconductors and nano-bioengineering. Bridging memory-device physics, DNA nanotechnology, and AI to build molecular information systems.",
    bioKo: "지능형 반도체와 나노바이오공학. 메모리 소자 물리, DNA 나노기술, AI를 잇는 분자 정보 시스템을 구축합니다.",
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
    { name: "Doyoen Lim", nameKo: "임도연", initials: "DL", roleEn: "Postdoctoral Researcher", roleKo: "박사후 연구원", scholar: "https://scholar.google.com/citations?user=s1V6SisAAAAJ&hl=en" },
    { name: "Wonjin Lee", nameKo: "이원진", initials: "WL", roleEn: "Postdoctoral Researcher", roleKo: "박사후 연구원", scholar: "https://scholar.google.com/citations?user=yO5hGRgAAAAJ&hl=en" },
  ],
  students: [
    { name: "Taeseok Kang", nameKo: "강태석", initials: "TK", roleEn: "Ph.D. Candidate · Bio-Nanoengineering", roleKo: "박사과정 · 생명나노바이오공학", scholar: "https://scholar.google.com/citations?user=M8axdgsAAAAJ&hl=en" },
    { name: "Byunghyun Cho", nameKo: "조병현", initials: "BC", roleEn: "M.S. Student · Intelligent Semiconductor", roleKo: "석사과정 · 지능형반도체" },
    { name: "Zeeshan Haider", nameKo: "지산 하이더", initials: "ZH", roleEn: "Researcher · Bio-Nanoengineering", roleKo: "연구원 · 생명나노바이오공학" },
  ],
  alumni: [
    { name: "Seunghwan Noh", nameKo: "노승환", noteEn: "M.S. → Ph.D. student, Northeastern University", noteKo: "석사 졸업 → Northeastern 박사과정" },
    { name: "Minsang Yu", nameKo: "유민상", noteEn: "M.S. (formerly Macrogen)", noteKo: "석사 졸업 (전 마크로젠)" },
    { name: "Jeongwoo Kim", nameKo: "김정우", noteEn: "M.S.", noteKo: "석사 졸업" },
    { name: "Changjae Lee", nameKo: "이창재", noteEn: "M.S. → CS, University of Southern California", noteKo: "석사 졸업 → USC 전산 과정" },
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

export const contactInfo = {
  addressEn: "Dept. of Nano-Bioengineering, Incheon National University, 119 Academy-ro, Yeonsu-gu, Incheon 22012, Republic of Korea",
  addressKo: "인천광역시 연수구 아카데미로 119, 인천대학교 나노바이오공학전공 (우 22012)",
};
