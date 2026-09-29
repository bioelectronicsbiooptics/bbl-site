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
| `dnas_encode` | DNAS-1 헤더·행 분할·XOR·RS·프라이머 조립 |
| `dna_encode_noheader.m` | 추가 실습: 17 byte 분할 → XOR → 고정 index → RS → 148 nt FASTA |
| `dna_decode_noheader.m` | 추가 실습: FASTA/FASTQ → Global/Local RS → XOR → 원본 파일 |
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
| `demo_*.m`, `run_all.m`, `test_vectors.m` | DNAS-1 섹션 실습·통합 실행·검산 |
| `dna_encode_noheader.m`, `dna_decode_noheader.m` | 헤더 없는 누적 copy/paste 추가 실습 |
| `README.md` | MATLAB·MATLAB Online 실행법 |
| `../samples/` | 예제 JPEG·생성 코드 |
| `../index.html`, `../guide.html` | 오프라인 웹 실습·설명서 |


## 13. 헤더 없는 고정 index 실습

이 변형은 앞의 DNAS-1 예제(헤더 포함)를 유지하면서 행 분할→XOR→RS→index→primer 순서를 눈으로 확인하기 위한 추가 실습입니다. 파일 metadata 헤더와 CRC는 생략합니다. 원본 `L`(byte 길이), `D`(짝수 data row 수), 파일 확장자는 실행 결과에서 따로 기록해 복호 설정에 넣습니다.

MATLAB Editor에서 `dna_encode_noheader.m` 전체를 열고 **Run**을 누르세요. `%%` 구간이 입력 byte → 17 byte 행 → XOR → RS와 index → primer와 FASTA 순서로 한 스크립트에 누적돼 있습니다. 이름은 `textInput`에 입력하고, 사진·파일은 `inputMode = 'image'` 또는 `'file'`로 바꾼 뒤 `inputFile`에 파일 이름을 쓰거나 선택창을 사용합니다. 예제 그림은 `../samples/dna_helix_demo.jpg`입니다.

```matlab
% 인코더가 출력한 값을 복사해 디코더 설정에 넣기
% 디코더 파일에서 inFile='dnas_out.fasta', L=13, D=2, ext='txt'
run('dna_decode_noheader.m')
```

부호화 순서는 `입력 byte → D개의 17 byte 행 → H=D/2 XOR 행 → [17 byte 행 + big-endian 2 byte 고정 index] → RS(27,19) → 108 nt → F(20 nt) + 본문 + R(20 nt) = 148 nt`입니다. index 2 byte는 RS의 19 byte 메시지 안에 들어가며, 이렇게 해야 RS가 index도 함께 보호하면서 본문을 108 nt로 유지합니다. 무오류 read를 파일별로 묶고, consensus와 Global RS, 개별 read Local RS를 차례로 시도한 후 `(j,j+H,D+j)` 중 하나만 없으면 XOR로 보완합니다.

**중요:** 헤더·CRC가 없으므로 `L`, `D`, `ext`가 FASTA 안에서 자동 복구되지 않습니다. FASTQ channel에서 index 자체가 손상되면 올바른 그룹으로 분류되지 않을 수 있습니다. 이 연습은 strand 소실과 RS byte 오류 복원을 보여줍니다.
