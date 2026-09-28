# Python · DNAS-1 실습

- 이름·사진·일반 파일을 같은 byte 기반 포맷으로 저장.
- 텍스트·파일·RS·채널·복호: Python 표준 라이브러리만 사용.
- 사진 축소: Pillow 필요. `python -m pip install Pillow`.
- 출력 byte는 UTF-8 또는 JPEG의 실제 파일 byte. RS 심볼 1개 = 1 byte.

## 사이트·코드 주소

- [웹 실습](https://bbl.stdbioelec.com/courses/molecular-information-engineering/week04/dna-storage/index.html)
- [설명서](https://bbl.stdbioelec.com/courses/molecular-information-engineering/week04/dna-storage/guide.html)
- [Python 코드 폴더](https://github.com/bioelectronicsbiooptics/bbl-site/tree/main/courses/molecular-information-engineering/week04/dna-storage/python)
- [Colab에서 바로 열기](https://colab.research.google.com/github/bioelectronicsbiooptics/bbl-site/blob/main/courses/molecular-information-engineering/week04/dna-storage/python/dna_storage_lab.ipynb)

## Google Colab

1. 위 Colab 주소에서 열거나 `dna_storage_lab.ipynb` 업로드.
2. 첫 준비 셀 실행. 아래 주소에서 `dnastore.py` 자동 다운로드.
   - <https://bbl.stdbioelec.com/courses/molecular-information-engineering/week04/dna-storage/python/dnastore.py>
3. 사이트 배포 전에는 `dnastore.py`를 Colab 파일 창에 업로드.
   - 또는 새 코드 셀 첫 줄에 `%%writefile dnastore.py` 입력 후 소스 붙여넣기.
4. 이름 → UTF-8 → 헤더·행 → XOR → RS → DNA → FASTA 순서로 실행.
5. 사진 셀에서 업로드. 취소 시 예제 JPEG 사용. 로컬은 `../samples/` 사용.
6. 채널 → 단계별 복호 → 복원 사진 확인. 결과는 `lab_output/`에 저장.

- 노트북에는 실제 실행 결과 포함. Colab 업로드 창은 로컬 실행에서 생략.
- 사진 업로드·사이트 자동 다운로드는 Colab에서 네트워크 연결 필요.
- JPEG 인코더가 다르면 축소 사진 byte도 달라질 수 있음.
- 사이트가 아직 배포되지 않았다면 예제 JPEG도 Colab의 `samples/`에 업로드.

## 명령줄

Python ZIP 압축 해제 후 `dna-storage-python/python/`에서 실행.
저장소·사이트 루트에서 시작했다면 먼저 `cd python` 실행:

```bash
python3 dnastore.py encode --text SONG
python3 dnastore.py encode --text SONG > name.fasta
python3 dnastore.py encode --text SONG -o name.fasta
```

- `-o` 생략: FASTA는 표준 출력, JSON 요약은 표준 오류로 출력.
- `-o name.fasta` 지정: FASTA는 해당 파일, JSON 요약은 표준 출력으로 출력.

배포 사본 또는 개발 작업폴더의 루트에서 실행:

```bash
python python/dnastore.py encode --text 송영준 -o name.fasta
python python/dnastore.py encode --image samples/sample_photo.jpg -o photo.fasta
python python/dnastore.py encode --file samples/sample_photo.jpg -o file.fasta
python python/dnastore.py simulate name.fasta -o reads.fastq \
  --seed 7 --coverage 10 --p-sub 0.01 --drop 3
python python/dnastore.py decode reads.fastq -o restored.txt
```

- `--image`: 긴 변 64 px·품질 60의 JPEG로 변환 후 저장.
- `--file`: 원래 파일 byte를 그대로 저장.
- `encode --whiten`: 헤더 외 데이터 행에 whitening 적용.
- `simulate --p-drop`, `--p-sub`, `--p-ins`, `--p-del`, `--p-rc`: 채널 확률.
- `decode`: 부분 복원 파일도 출력. 성공 여부는 보고의 `crc_ok`로 확인.
- `python python/dnastore.py --help`: 전체 인수 확인.

## 함수로 사용

```python
import sys
sys.path.insert(0, "python")
import dnastore as ds

original = ds.text_bytes("송영준")
oligos = ds.encode(original, dtype="text", ext="txt")
reads = ds.simulate([item.seq for item in oligos], seed=7, coverage=10)
data, header, report = ds.decode(reads)
print(data.decode("utf-8"), report["crc_ok"])
```

- `encode`: `(index, role, seq)` 가닥 목록.
- `decode`: `(data, header, report)` 반환.
- `rs_decode`: `(message, corrected_byte_count)` 또는 실패 시 `None`.
- 동일 XOR 묶음에서 두 가닥이 없으면 해당 행 복원 실패 가능.
- index는 RS 전에 읽으므로 index 치환이 있는 read는 다른 묶음으로 갈 수 있음.
- 프라이머 길이에서 2를 뺀 수 이상 일치해야 통과.

## 로컬 노트북 실행

```bash
python -m pip install Pillow jupyter nbconvert ipykernel
jupyter nbconvert --execute --to notebook --inplace \
  --ExecutePreprocessor.timeout=120 python/dna_storage_lab.ipynb
```

- Jupyter에서 직접 열어 각 셀을 순서대로 실행해도 동일.
- 검증 환경에서는 프로젝트 안 `.venv-notebook/`을 사용.
- 설치용 가상환경은 배포에 필요하지 않음.

## 파일

| 파일 | 용도 |
|---|---|
| `dnastore.py` | 공개 API·표준 라이브러리 RS·CLI |
| `dna_storage_lab.ipynb` | Colab·로컬 실습, 실행 출력 포함 |
| `README.md` | Python 실행법 |
| `lab_output/` | 노트북 실행으로 생성하는 FASTA·FASTQ·복원 JPEG |
| `../samples/sample_photo.jpg` | 코드로 만든 64 × 64 px 예제 |
| `../samples/make_sample.py` | 예제 JPEG 재생성 소스 |
| `../index.html`, `../guide.html` | 배포된 웹 실습·설명서 |

- MATLAB Online: `../matlab/README.md`의 실행법 참고.
- 웹: 배포 사본의 `../index.html`을 브라우저에서 열어 같은 포맷 실습.
- 개발 작업폴더에만 `tests/cross_check.sh`와 검증 로그가 있음.
