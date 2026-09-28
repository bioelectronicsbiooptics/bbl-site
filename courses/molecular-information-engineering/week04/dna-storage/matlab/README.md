# MATLAB DNAS-1 실습

- 기본 MATLAB만으로 인코딩·채널·복호 실행.
- Communications Toolbox 없이 직접 구현한 GF(256)·RS 사용.
- MATLAB Online: 프로젝트의 `matlab/`, `samples/`를 함께 업로드.
  `matlab/`을 현재 폴더로 지정.
- 각 스크립트의 `%%` 섹션을 Ctrl+Enter로 순서대로 실행.

## 사이트·코드 주소

- [웹 실습](https://bbl.stdbioelec.com/courses/molecular-information-engineering/week04/dna-storage/index.html)
- [설명서](https://bbl.stdbioelec.com/courses/molecular-information-engineering/week04/dna-storage/guide.html)
- [MATLAB 코드 폴더](https://github.com/bioelectronicsbiooptics/bbl-site/tree/main/courses/molecular-information-engineering/week04/dna-storage/matlab)
- [같은 실습의 Colab 노트북](https://colab.research.google.com/github/bioelectronicsbiooptics/bbl-site/blob/main/courses/molecular-information-engineering/week04/dna-storage/python/dna_storage_lab.ipynb)
- 로컬 배포 사본의 `index.html`, `guide.html`은 `matlab/`의 상위 폴더에 위치.
- [MATLAB 실습 ZIP 내려받기](https://bbl.stdbioelec.com/courses/molecular-information-engineering/week04/dna-storage/downloads/dna-storage-matlab.zip).
  압축 해제 후 `dna-storage-matlab/matlab/`을 현재 폴더로 지정하고
  `run_all` 실행. 같은 상위 폴더의 `samples/sample_photo.jpg`를 유지.

```matlab
demo_name       % 이름 → UTF-8 → 행 → XOR → RS → DNA
demo_photo      % 예제 사진 → JPEG byte → DNA
demo_decode     % 채널 → Global RS → Local RS → XOR → CRC
run_all        % 전체 실습
test_vectors   % 기본 검산
```

## 주요 함수

| 함수 | 역할 |
|---|---|
| `dnas_text_bytes` | 한글·영문을 UTF-8 byte로 변환 |
| `dnas_image_bytes` | 정수 간격 축소·선택 흑백·JPEG 저장 |
| `dnas_encode` | 헤더·행 분할·XOR·RS·프라이머 조립 |
| `dnas_write_fasta` | 표준 DNAS-1 FASTA 저장 |
| `dnas_read_seqs` | FASTA·FASTQ·한 줄 서열 입력 |
| `dnas_simulate` | 고정 seed LCG 채널 |
| `dnas_decode` | 복원 byte·헤더·보고서 반환 |
| `dnas_rs_encode`, `dnas_rs_decode` | 직접 구현한 byte 심볼 RS |
| `dnas_crc32` | IEEE CRC-32 |

## 최소 예제

```matlab
bytes = dnas_text_bytes('송영준');
oligos = dnas_encode(bytes, 'text', 'txt', false);
dnas_write_fasta('name.fasta', oligos);
opts = struct('seed', 7, 'coverage', 10, 'p_sub', 0.01);
reads = dnas_simulate({oligos.seq}, opts);
[data, hdr, rep] = dnas_decode(reads);
disp(native2unicode(data, 'UTF-8'))
disp(rep)
```

- 사진 JPEG 인코더는 언어마다 다를 수 있음.
  같은 JPEG byte를 입력하면 세 언어의 FASTA는 일치.
- 기본 프라이머 길이 20 nt, 본문 108 nt, 전체 148 nt.
- 길이가 25 nt면 23개, 15 nt면 13개 이상 일치해야 통과.
- 원본 변수 대응: `column_data`=입력 byte,
  `xor_A`·`xor_B`=앞·뒤 절반 행, `xor_data`=XOR 행,
  `nrsin`=행+index, `bin_payload`=RS 메시지,
  `DNA_library`=가닥 목록, `F_primers`·`R_primers`=프라이머.
- index 치환과 같은 XOR 묶음의 2개 소실은 복원을 막을 수 있음.
  `rep.crc_ok`, `rep.missing`을 함께 확인.
- 개발 작업폴더에서 `bash tests/cross_check.sh`로 세 언어 교차 검증.
  배포 사본에는 테스트·검증 로그를 포함하지 않음.

## 배포 파일

| 경로 | 내용 |
|---|---|
| `dnas_*.m` | 툴박스 없는 DNAS-1 함수 |
| `demo_*.m`, `run_all.m`, `test_vectors.m` | 섹션 실습·통합 실행·검산 |
| `README.md` | MATLAB·MATLAB Online 실행법 |
| `../samples/` | 예제 JPEG·생성 코드 |
| `../index.html`, `../guide.html` | 오프라인 웹 실습·설명서 |
