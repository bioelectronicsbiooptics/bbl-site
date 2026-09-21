# 3주차 실습 코드 — 내 이름을 DNA로 (3-2강)

| 파일 | 내용 | 실행 |
|---|---|---|
| `week3_warmup.py` · `week3_warmup.m` | 준비 · 실습 1 (문자 ↔ 숫자 ↔ 8 bit) | Google Colab · MATLAB Online |
| `week3_dna.py` · `week3_dna.m` | 이름 → 비트 → DNA(2 bit/nt) · GC% · maxrun · 디코딩 · FASTA · 확장 ① 1 bit/nt | 위에서 아래로 한 번에 |
| `week3_korean.py` · `week3_korean.m` | 확장 ② 한글 이름 (UTF-8 3 byte) | 한 번에 (인코딩 → 디코딩) |

- 코드는 3-2강 슬라이드 8–11 · 16–19 · 21–22와 같음
- 확인: Python 3 · MATLAB R2026b에서 전부 실행, "SONG" → CCATCATTCATGCACT, "송영준" → 36 nt → 복원
- 결과 파일 `my_name.fasta`는 실행한 폴더에 생성
