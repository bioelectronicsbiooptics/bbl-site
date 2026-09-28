# DNAS-1 DNA 저장 실습

- 이름·사진·파일 → UTF-8/파일 byte → 헤더·17 byte 행 → XOR →
  RS(27,19) → DNA → 채널 → 복호 실습.
- 연구실 코드의 XOR·프라이머·복호 흐름을 바탕으로 작성.
  RS 심볼은 1 byte, 가닥은 기본 148 nt.
- 프라이머는 길이에 관계없이 불일치 2개까지 허용.

## 사이트·코드 주소

- [웹 실습](https://bbl.stdbioelec.com/courses/molecular-information-engineering/week04/dna-storage/index.html)
- [설명서](https://bbl.stdbioelec.com/courses/molecular-information-engineering/week04/dna-storage/guide.html)
- [GitHub 코드](https://github.com/bioelectronicsbiooptics/bbl-site/tree/main/courses/molecular-information-engineering/week04/dna-storage)
- [Colab 노트북](https://colab.research.google.com/github/bioelectronicsbiooptics/bbl-site/blob/main/courses/molecular-information-engineering/week04/dna-storage/python/dna_storage_lab.ipynb)
- [Python 실습 ZIP](downloads/dna-storage-python.zip)
- [MATLAB 실습 ZIP](downloads/dna-storage-matlab.zip)
- ZIP 압축 해제 후 `dna-storage-python/python/` 또는
  `dna-storage-matlab/matlab/`에서 실행. 상위 `samples/`를 함께 유지.

## 웹에서 실행

- 배포 폴더의 [index.html](index.html)을 브라우저로 열기.
- 개발 작업폴더에서는 `site/index.html`을 열기.
- 입력 → 인코딩 → 채널 → 불러오기 순서로 실행.
- 인터넷·서버·외부 CDN 불필요. FASTA·CSV·FASTQ·복원 파일 다운로드 가능.
- 설명 링크는 같은 폴더의 [guide.html](guide.html)을 가리킴.
- 개발 작업폴더에서 소스 수정 후 HTML과 로컬 배포 사본 생성:

```sh
python3 web/build.py
python3 tools/publish_site.py --local site
```

## Python·Colab에서 실행

- 위 Colab 주소에서 열기. 또는 **파일 → 노트북 업로드**에서
  [python/dna_storage_lab.ipynb](python/dna_storage_lab.ipynb) 선택.
- 준비 셀부터 순서대로 실행. 개인 이름·사진으로 입력 변경.
- 로컬 실행: Python 3, 사진 축소에만 Pillow 필요.
  상세: [python/README.md](python/README.md).

```sh
python3 python/dnastore.py encode --text 송영준 -o name.fasta
python3 python/dnastore.py simulate name.fasta -o reads.fastq \
  --seed 7 --coverage 10 --p-sub 0.01 --drop 3
python3 python/dnastore.py decode reads.fastq -o restored.txt
```

## MATLAB·MATLAB Online에서 실행

- MATLAB Online에 `matlab/`과 `samples/`를 같은 상위 폴더로 업로드.
- `matlab/`을 현재 폴더로 지정하고 `demo_name` 실행.
- `%%` 섹션을 Ctrl+Enter로 실행하며 중간 변수 확인.
- `demo_photo`, `demo_decode`, `run_all` 순서로 확장.
- 구현은 기본 MATLAB만 사용. Communications Toolbox는 선택 대조용.
- 상세: [matlab/README.md](matlab/README.md).

## 검증

아래 명령은 테스트가 있는 개발 작업폴더에서 실행.

```sh
bash tests/cross_check.sh
node tests/test_web.mjs
```

- Python이 기대 벡터를 생성하고 독립 JS·MATLAB 구현과 비교.
- FASTA 문자열·채널 read 순서·복원 byte·복호 보고서 비교.
- MATLAB 기본 경로: `/Applications/MATLAB_R2026b.app/bin/matlab`.
- 실제 통과 수, 정정 한계 및 채널 수치는 개발 작업폴더의
  `CODEX_SUMMARY.md` 참조. 배포 사본에는 테스트·실행 로그를 포함하지 않음.
- 가닥 index를 RS 전에 읽는 명세상 한계가 있음.
  index 치환·같은 XOR 묶음의 중복 소실은 복원을 막을 수 있음.
- CRC 불일치 결과도 부분 복원 파일로 확인 가능.

## 배포 파일표

| 경로 | 내용 |
|---|---|
| `index.html` | 코덱·예제 그림을 포함한 오프라인 웹 실습 |
| `guide.html` | 개념·코드·사용법 설명서 |
| `fig/*.svg`, `img/*.png` | 설명서 그림·실제 웹 화면 |
| `python/dnastore.py` | 표준 라이브러리 기반 API·CLI |
| `python/dna_storage_lab.ipynb` | 실행 출력이 포함된 Colab 실습 |
| `matlab/dnas_*.m` | 기본 MATLAB 부호화·채널·복호 함수 |
| `matlab/demo_*.m`, `run_all.m`, `test_vectors.m` | 단계별 실습·검산 |
| `web/dnastore.js` | 브라우저·Node 공용 UMD 코덱 |
| `samples/sample_photo.jpg` | 코드로 그린 64 px 예제 그림 |
| `samples/make_sample.py` | 예제 그림 생성 코드 |
| `downloads/dna-storage-python.zip` | Python 코드·노트북·README·예제 사진 |
| `downloads/dna-storage-matlab.zip` | MATLAB 함수·실습·README·예제 사진 |
| `README.md` | 실행법·배포 파일표 |

## 사이트 배포 도구

- 개발 작업폴더의 `tools/publish_site.py` 사용.
- `--local site`: 작업폴더 안 `site/`에 위 구조 생성.
- `--repo <bbl-site 경로>`: 해당 저장소의
  `courses/molecular-information-engineering/week04/dna-storage/`만 교체하고,
  3·4주차 자료 링크를 갱신한 뒤 `node tools/build.mjs` 실행.
- 반복 실행해도 자료 링크 중복 없음. git 커밋·푸시는 수행하지 않음.
- 실제 사이트 반영 전 임시 복제본에서 검증. 배포 사본에는
  가상환경·캐시·실습 출력·테스트·내부 작업 파일을 포함하지 않음.
