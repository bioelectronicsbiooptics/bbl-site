# BBL 사이트 — 제작부터 배포까지 전체 가이드

Bioelectronics & Biooptics Lab (유전자 진단 및 치료 연구실) 홈페이지를
**만들고 → 로컬 확인 → GitHub 올리고 → Pages 배포 → 커스텀 도메인(bbl.stdbioelec.com) 연결**하는 전 과정 기록.
다음에 새 사이트를 만들거나 이 사이트를 유지보수할 때 그대로 따라 하면 됩니다.

- **리포**: `github.com/bioelectronicsbiooptics/bbl-site`
- **도메인**: `bbl.stdbioelec.com` (DNS = Google Cloud DNS)
- **로컬 폴더**: `~/Desktop/Home Page`
- **Pages 서버 타깃**: `bioelectronicsbiooptics.github.io`

> ⚠️ **보안**: 토큰/비밀번호는 이 문서에 절대 적지 않습니다. 아래는 전부 자리표시자(`ghp_...`)로 씁니다. 실제 토큰은 쓰고 나면 revoke.

---

## 0. 사전 준비 (설치 도구)

| 도구 | 용도 | 확인 |
|---|---|---|
| Node.js | 정적 페이지 생성 | `node -v` |
| git | 버전관리 | `git --version` |
| GitHub CLI (`gh`) | 리포 생성·push·Pages | `gh --version` |
| Google Cloud SDK (`gcloud`) | DNS 레코드 추가 | `gcloud --version` |
| Python 3 | 로컬 미리보기 서버 | `python3 --version` |

없는 것만 아래에서 설치 (macOS 기준).

---

## 1. 사이트 구조 이해

```
index.html          → /en 또는 /ko로 자동 리다이렉트 (브라우저 언어 감지)
en/ · ko/           → 언어별 페이지 (Home·Research·Publications·Teaching·People·Join&Contact)
assets/css/style.css  디자인 시스템 (라이트/다크, 반응형)
assets/js/main.js     테마 토글·모바일 메뉴·스크롤 애니메이션·논문 필터
tools/content.mjs   ★ 모든 텍스트·논문·구성원·소셜 링크 (여기만 수정)
tools/build.mjs     생성기 (content.mjs → 정적 html)
CNAME               커스텀 도메인 (bbl.stdbioelec.com)
```

**핵심**: 내용은 `tools/content.mjs` 한 곳에서만 고치고, 아래 명령으로 페이지를 다시 만든다.

```bash
cd ~/Desktop/"Home Page"
node tools/build.mjs        # en/·ko/·index.html 재생성
```

생성된 `.html`은 그대로 배포되는 결과물이라 **별도 빌드 서버가 필요 없다.**

---

## 2. 로컬에서 미리보기

```bash
cd ~/Desktop/"Home Page"
python3 -m http.server 8848      # http://localhost:8848
```

- 같은 Wi-Fi의 다른 기기에서 보려면: 맥 LAN IP 확인 후 `http://<맥IP>:8848`
  ```bash
  ipconfig getifaddr en0
  ```
- 끝낼 때: `pkill -f "http.server 8848"`

---

## 3. Git 초기화 & 커밋

```bash
cd ~/Desktop/"Home Page"
git init
printf '.DS_Store\n**/.DS_Store\nnode_modules/\n' > .gitignore
git add -A
git commit -m "Initial site"
git branch -M main
```

이후 수정할 때마다:
```bash
node tools/build.mjs
git add -A && git commit -m "설명"
git push        # (원격 연결 후)
```

---

## 4. GitHub CLI 설치 & 인증

### 설치 (없으면)
```bash
brew install gh          # Homebrew 사용 시
```

### 인증 — 토큰 방식 (device flow가 타임아웃 나면 이게 확실)

1. 토큰 발급: `https://github.com/settings/tokens/new` → 스코프 **`repo`, `read:org`, `workflow`** 체크 → Generate → `ghp_...` 복사
   - ⚠️ `read:org` 빠지면 `gh auth login`이 거부함.
2. 로그인:
   ```bash
   echo ghp_... | gh auth login --with-token
   gh auth status          # 로그인 확인
   ```
   - `--with-token`이 스코프 문제로 막히면, 설정 파일에 직접 써도 됨:
     ```bash
     mkdir -p ~/.config/gh
     printf 'github.com:\n    oauth_token: ghp_...\n    user: <계정>\n    git_protocol: https\n' > ~/.config/gh/hosts.yml
     chmod 600 ~/.config/gh/hosts.yml
     gh auth setup-git
     ```

> 배포 끝나면 토큰 revoke: `github.com/settings/tokens`

---

## 5. GitHub 리포 생성 + push

```bash
cd ~/Desktop/"Home Page"
git branch -M main
gh repo create bioelectronicsbiooptics/bbl-site \
  --public --source=. --remote=origin --push \
  --description "Bioelectronics & Biooptics Lab — bilingual website"
```

→ `github.com/bioelectronicsbiooptics/bbl-site` 생성 + main 브랜치 push 완료.

---

## 6. GitHub Pages 켜기 (main / root)

```bash
gh api --method POST /repos/bioelectronicsbiooptics/bbl-site/pages \
  -f "source[branch]=main" -f "source[path]=/"

# 상태 확인
gh api /repos/bioelectronicsbiooptics/bbl-site/pages \
  --jq '{status:.status, cname:.cname, url:.html_url}'
```

`status`가 `building` → 잠시 후 `built`이 되면 서빙 시작.

---

## 7. 커스텀 도메인 (bbl.stdbioelec.com)

### 7-1. 리포에 CNAME 파일 (이미 있음)
```bash
echo "bbl.stdbioelec.com" > CNAME
git add CNAME && git commit -m "Add CNAME" && git push
```
→ GitHub Pages가 자동으로 이 도메인을 커스텀 도메인으로 인식.

### 7-2. DNS 레코드 추가 (Google Cloud DNS)

stdbioelec.com의 네임서버가 `ns-cloud-*.googledomains.com` = **Google Cloud DNS**.
`www`가 이미 `bioelectronicsbiooptics.github.io`로 CNAME 걸려 있음 → `bbl`도 똑같이 추가.

**방법 A — 웹 콘솔 (간단)**
1. `https://console.cloud.google.com/net-services/dns/zones` (stdbioelec 프로젝트 선택)
2. `stdbioelec.com` 존 → **표준 추가(Add standard)**
3. DNS 이름 `bbl` · 유형 `CNAME` · TTL `3600` · 데이터 `bioelectronicsbiooptics.github.io.` (끝점 포함) → 만들기

**방법 B — gcloud CLI (자동)**
```bash
# 설치 (sudo 없이 홈에)
curl -sSL https://sdk.cloud.google.com | bash -s -- --disable-prompts --install-dir="$HOME"
source ~/google-cloud-sdk/path.bash.inc      # 또는 새 터미널

# 인증 + 프로젝트 지정
gcloud auth login
gcloud config set project <stdbioelec-프로젝트ID>

# 존 이름 확인
gcloud dns managed-zones list --format="table(name,dnsName)"

# CNAME 레코드 추가 (ZONE은 위에서 확인한 이름)
gcloud dns record-sets create bbl.stdbioelec.com. \
  --zone=<ZONE> --type=CNAME --ttl=3600 \
  --rrdatas=bioelectronicsbiooptics.github.io.
```

### 7-3. 전파 확인
```bash
dig +short bbl.stdbioelec.com     # bioelectronicsbiooptics.github.io. 나오면 성공
```

---

## 8. HTTPS 적용 & 검증

DNS 전파 후 GitHub가 인증서를 자동 발급(몇 분~1시간). 그 다음:

```bash
# HTTPS 강제
gh api --method PUT /repos/bioelectronicsbiooptics/bbl-site/pages \
  -f https_enforced=true

# 접속 확인
curl -sI https://bbl.stdbioelec.com/ | head -3
```

→ `https://bbl.stdbioelec.com` 접속 완료.

### ⚠️ 인증서가 `none`에서 안 넘어갈 때 (실제 겪음)

DNS·CAA·DNSSEC 다 정상인데 `https_certificate.state`가 계속 `none`이고 `https://`가
`*.github.io` 기본 인증서만 주면 = 발급 상태가 꼬인 것. **Pages를 삭제 후 재생성**하면
CNAME 파일 기준으로 도메인이 자동 복구되고 인증서 발급이 새로 시작된다 (즉시 `issued`로 넘어갔음):

```bash
R=/repos/bioelectronicsbiooptics/bbl-site/pages
gh api --method DELETE "$R"                                   # 삭제
sleep 6
gh api --method POST "$R" -f "source[branch]=main" -f "source[path]=/"   # 재생성 (CNAME 파일로 도메인 자동 인식)
# 몇 초~분 뒤 state가 new → issued → approved
gh api "$R" --jq '.https_certificate.state'
```

- `https_enforced`는 **인증서가 생긴 뒤에만** `true`로 설정 가능 (없으면 404 "certificate does not exist yet").
- 커스텀 도메인을 `-f cname=` 로 비우면 CNAME 파일까지 지워지니 주의 — 재생성 방식이 안전.

---

## 9. 유지보수 루프 (내용 수정 → 자동 재배포)

```bash
cd ~/Desktop/"Home Page"
# 1) tools/content.mjs 편집 (텍스트·논문·구성원·소셜 링크)
node tools/build.mjs              # 2) 재생성
git add -A && git commit -m "내용 수정"
git push                          # 3) push → GitHub Pages 자동 재배포 (1~2분)
```

**자주 하는 수정 위치 (전부 `tools/content.mjs`)**
- 논문 추가/상세페이지 링크: `publications` 배열의 항목에 `link: "https://stdbioelec.com/papers/....html"`
- 소셜 링크(X·GitHub·YouTube·Discord): `site.social`의 `#`를 실제 URL로
- 구성원 개인 LinkedIn·X: `members`의 각 항목 `linkedin` / `x`
- 새 페이지 추가: `pages[]` + `ui.nav` + `tools/build.mjs`에 렌더 함수

---

## 10. 체크리스트 (요약)

- [ ] `node tools/build.mjs` 로 생성 확인
- [ ] `gh auth status` 로그인됨
- [ ] `gh repo create ... --push` 리포 + push
- [ ] `gh api ... /pages` Pages 켜짐 (`built`)
- [ ] `CNAME` 파일 = `bbl.stdbioelec.com`
- [ ] Cloud DNS에 `bbl` CNAME → `bioelectronicsbiooptics.github.io.`
- [ ] `dig +short bbl.stdbioelec.com` 확인
- [ ] `https_enforced=true` + 브라우저 접속 확인
- [ ] **토큰 revoke**
