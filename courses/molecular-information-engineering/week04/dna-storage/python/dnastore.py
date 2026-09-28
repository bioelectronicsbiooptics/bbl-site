"""DNAS-1: byte → XOR → RS → DNA와 실험 read 복호 실습.

RS·채널·복호는 표준 라이브러리만 사용한다. 사진 축소만 Pillow가 필요하다.
원본: ACS Nano DNA Data Ink의 STL_Encode.m / STL_Decode_231213.m.
"""

import argparse
from collections import Counter, namedtuple
import hashlib
import io
import json
from pathlib import Path
import sys
import zlib


BASES = "ATGC"
F_PRIMER = "AGCCTTGTGTCCATCAATCC"
R_PRIMER = "TGCGCTATGGTTTGGCTAAT"
F, R = F_PRIMER, R_PRIMER
ROW_BYTES, IDX_BYTES, NSYM = 17, 2, 8
MSG_BYTES, CW_BYTES, BODY_NT, OLIGO_NT = 19, 27, 108, 148
PAD = 0x1B
PRIMER_MIN = len(F_PRIMER) - 2  # 기본 20 nt 프라이머의 일치 수.
TYPE_CODES = {"file": 0, "text": 1, "image": 2}
TYPE_NAMES = {value: key for key, value in TYPE_CODES.items()}
Oligo = namedtuple("Oligo", "index role seq")


def text_bytes(s):
    """원본 STL 읽기 → 임의 문자열 UTF-8 입력으로 바꾼 단계."""
    return s.encode("utf-8")


def text_info(s):
    """원본 de2bi 입력 설명에 해당: 글자별 코드포인트와 byte."""
    return [{"character": ch, "codepoint": f"U+{ord(ch):04X}",
             "bytes": list(text_bytes(ch)), "ascii": ord(ch) < 128}
            for ch in s]


def image_bytes(path, max_side=64, quality=60, gray=False):
    """원본 STL 읽기 → 사진을 작은 JPEG byte로 바꾼 입력 단계."""
    from PIL import Image
    if max_side < 1 or not 1 <= quality <= 100:
        raise ValueError("max_side ≥ 1, quality = 1..100이어야 합니다.")
    with Image.open(path) as picture:
        picture = picture.convert("L" if gray else "RGB")
        picture.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
        output = io.BytesIO()
        picture.save(output, format="JPEG", quality=quality)
    return output.getvalue()


def crc32(data):
    """원본에는 없는 무결성 검사: 복호 결과를 CRC-32로 확인."""
    return zlib.crc32(bytes(data)) & 0xFFFFFFFF


def bytes_to_dna(data):
    """원본 STL_Encode의 bases='ATGC': byte 내부는 MSB-first."""
    return "".join(BASES[(b >> shift) & 3]
                   for b in data for shift in (6, 4, 2, 0))


def dna_to_bytes(sequence):
    """원본 Binarization: ATGC 외 문자는 A(00)로 취급."""
    if len(sequence) % 4:
        raise ValueError("DNA 본문 길이는 4의 배수여야 합니다.")
    values = {base: index for index, base in enumerate(BASES)}
    output = bytearray()
    for start in range(0, len(sequence), 4):
        value = 0
        for base in sequence[start:start + 4]:
            value = (value << 2) | values.get(base, 0)
        output.append(value)
    return bytes(output)


def _gf_tables():
    """원본 gf(...,8)에 해당: 0x11D로 log/antilog 표 생성."""
    exp, log = [0] * 512, [0] * 256
    value = 1
    for power in range(255):
        exp[power], log[value] = value, power
        value <<= 1
        if value & 256:
            value ^= 0x11D
    for power in range(255, 512):
        exp[power] = exp[power - 255]
    return exp, log


_EXP, _LOG = _gf_tables()


def _mul(a, b):
    """원본 gf 곱셈에 해당: GF(256) 곱셈."""
    return _EXP[_LOG[a] + _LOG[b]] if a and b else 0


def _div(a, b):
    """원본 gf 나눗셈에 해당: GF(256) 나눗셈."""
    if not b:
        raise ZeroDivisionError("GF(256)에서 0으로 나눌 수 없습니다.")
    return _EXP[(_LOG[a] - _LOG[b]) % 255] if a else 0


def _poly_eval_desc(poly, value):
    """원본 rsdec 신드롬 계산: 최고차 계수부터 Horner 계산."""
    result = 0
    for coefficient in poly:
        result = _mul(result, value) ^ coefficient
    return result


def _poly_eval_asc(poly, value):
    """원본 rsdec 오류 위치 계산: 상수항부터 저장한 다항식."""
    return _poly_eval_desc(reversed(poly), value)


def _generator(nsym):
    """원본 rsenc 생성 다항식: (x+α¹)…(x+αⁿˢʸᵐ)."""
    polynomial = [1]
    for power in range(1, nsym + 1):
        following = [0] * (len(polynomial) + 1)
        for index, coefficient in enumerate(polynomial):
            following[index] ^= coefficient
            following[index + 1] ^= _mul(coefficient, _EXP[power])
        polynomial = following
    return polynomial


def _check_rs_size(length, nsym, decoding=False):
    """원본 rsenc/rsdec 입력 검사에 해당: GF(256) 길이 한도."""
    if not isinstance(nsym, int) or not 1 <= nsym <= 254:
        raise ValueError("nsym은 1..254 정수여야 합니다.")
    if length > 255 or (decoding and length < nsym):
        raise ValueError("RS 부호어 길이는 nsym..255여야 합니다.")


def rs_encode(msg, nsym=NSYM):
    """원본 rsenc: bit 대신 byte 심볼, 패리티를 뒤에 붙임."""
    message = bytes(msg)
    _check_rs_size(len(message) + nsym, nsym)
    generator = _generator(nsym)
    remainder = list(message) + [0] * nsym
    for index in range(len(message)):
        coefficient = remainder[index]
        if coefficient:
            for offset in range(1, len(generator)):
                remainder[index + offset] ^= _mul(
                    coefficient, generator[offset])
    return message + bytes(remainder[-nsym:])


def _syndromes(codeword, nsym):
    """원본 RSdecoding의 신드롬: r(α¹), …, r(αⁿˢʸᵐ)."""
    return [_poly_eval_desc(codeword, _EXP[power])
            for power in range(1, nsym + 1)]


def _error_locator(syndromes):
    """원본 rsdec 내부에 해당: Berlekamp–Massey 위치 다항식."""
    size = len(syndromes)
    locator, previous = [1] + [0] * size, [1] + [0] * size
    degree, shift, old_discrepancy = 0, 1, 1
    for step in range(size):
        discrepancy = syndromes[step]
        for offset in range(1, degree + 1):
            discrepancy ^= _mul(locator[offset], syndromes[step - offset])
        if not discrepancy:
            shift += 1
            continue
        saved = locator[:]
        scale = _div(discrepancy, old_discrepancy)
        for offset in range(size + 1 - shift):
            locator[offset + shift] ^= _mul(scale, previous[offset])
        if 2 * degree <= step:
            degree = step + 1 - degree
            previous, old_discrepancy, shift = saved, discrepancy, 1
        else:
            shift += 1
    return locator[:degree + 1]


def rs_decode(cw, nsym=NSYM):
    """원본 RSdecoding: BM → Chien → Forney, 실패는 None."""
    codeword = list(bytes(cw))
    if not isinstance(nsym, int) or not 1 <= nsym <= 254:
        return None
    if len(codeword) < nsym or len(codeword) > 255:
        return None
    syndromes = _syndromes(codeword, nsym)
    if not any(syndromes):
        return bytes(codeword[:-nsym]), 0
    locator = _error_locator(syndromes)
    degree = len(locator) - 1
    if degree == 0 or degree > nsym // 2:
        return None

    # Chien: 앞 byte가 최고차 계수이므로 위치 지수는 n-1-p.
    roots = []
    for position in range(len(codeword)):
        root = _EXP[-(len(codeword) - 1 - position) % 255]
        if _poly_eval_asc(locator, root) == 0:
            roots.append((position, root))
    if len(roots) != degree:
        return None

    # Ω(z) = S(z)Λ(z) mod z^nsym, fcr=1이므로 크기는 Ω/Λ'.
    evaluator = [0] * nsym
    for i, coefficient in enumerate(locator):
        for j in range(nsym - i):
            evaluator[i + j] ^= _mul(coefficient, syndromes[j])
    derivative = [locator[i] if i % 2 else 0
                  for i in range(1, len(locator))]
    for position, root in roots:
        denominator = _poly_eval_asc(derivative, root)
        if not denominator:
            return None
        codeword[position] ^= _div(
            _poly_eval_asc(evaluator, root), denominator)
    if any(_syndromes(codeword, nsym)):
        return None
    return bytes(codeword[:-nsym]), degree


def whitening_mask(row_number):
    """원본에는 없는 선택 기능: 행 번호로 재현 가능한 마스크."""
    state, mask = row_number, bytearray()
    for _ in range(ROW_BYTES):
        state = (1664525 * state + 1013904223) & 0xFFFFFFFF
        mask.append(state >> 24)
    return bytes(mask)


def xor_bytes(left, right):
    """원본 xor(xor_A,xor_B): 같은 길이의 byte를 XOR."""
    if len(left) != len(right):
        raise ValueError("XOR 입력 길이가 같아야 합니다.")
    return bytes(a ^ b for a, b in zip(left, right))


def _extension(ext):
    """원본 genkey 메타데이터에 해당: 확장자를 ASCII 4자로 저장."""
    extension = str(ext).lower()[:4]
    try:
        encoded = extension.encode("ascii")
    except UnicodeEncodeError as error:
        raise ValueError("ext는 ASCII 확장자여야 합니다.") from error
    return encoded.ljust(4, b" ")


def split_rows(data, dtype="file", ext="bin", whiten=False):
    """원본 cCal/column_data와 KIS: 헤더 + 17 byte 행 나누기."""
    data = bytes(data)
    type_code = TYPE_CODES.get(dtype, dtype)
    if type_code not in TYPE_NAMES:
        raise ValueError("dtype은 file, text, image 또는 0, 1, 2입니다.")
    count = 1 + (len(data) + ROW_BYTES - 1) // ROW_BYTES
    count += count % 2
    if count * 3 // 2 > 65535:
        raise ValueError("DNAS-1 최대 가닥 수 65,535를 넘었습니다.")
    header = (bytes((1, type_code)) + len(data).to_bytes(4, "big")
              + crc32(data).to_bytes(4, "big")
              + count.to_bytes(2, "big") + bytes((int(bool(whiten)),))
              + _extension(ext))
    rows = [header]
    for start in range(0, len(data), ROW_BYTES):
        rows.append(data[start:start + ROW_BYTES].ljust(ROW_BYTES,
                                                     bytes((PAD,))))
    while len(rows) < count:
        rows.append(bytes((PAD,)) * ROW_BYTES)
    if whiten:
        rows[1:] = [xor_bytes(row, whitening_mask(number))
                    for number, row in enumerate(rows[1:], 2)]
    return rows


def _primers(f, r):
    """원본 primerSelect/F_primers/R_primers: 사용자 프라이머 검사."""
    f, r = str(f).upper(), str(r).upper()
    if not f or not r or any(base not in BASES for base in f + r):
        raise ValueError("프라이머는 비어 있지 않은 ATGC 서열입니다.")
    return f, r


def encode(data, dtype="file", ext="bin", whiten=False, f=F, r=R):
    """원본 STL_Encode: 행 → xor_data → nrsin → DNA_library."""
    f, r = _primers(f, r)
    rows = split_rows(data, dtype, ext, whiten)
    count, half = len(rows), len(rows) // 2
    xor_data = [xor_bytes(rows[j], rows[j + half]) for j in range(half)]
    oligos = []
    for index, row in enumerate(rows + xor_data, 1):
        role = "header" if index == 1 else "data" if index <= count else "xor"
        nrsin = row + index.to_bytes(IDX_BYTES, "big")
        sequence = f + bytes_to_dna(rs_encode(nrsin)) + r
        oligos.append(Oligo(index, role, sequence))
    return oligos


def to_fasta(oligos):
    """원본 DNA_library 출력: 줄바꿈까지 고정한 FASTA."""
    return "".join(f">dnas_{index:04d} idx={index} role={role} "
                   f"len={len(seq)}\n{seq}\n" for index, role, seq in oligos)


def _clean_sequence(sequence):
    """원본 FASTQ 읽기: 공백 제거·대문자화·U→T."""
    return "".join(sequence.split()).upper().replace("U", "T")


def read_sequences(text):
    """원본 Textscan: FASTQ/FASTA/한 줄 한 read 자동 판별."""
    lines = str(text).splitlines()
    while lines and not lines[0].strip():
        lines.pop(0)
    if not lines:
        return []
    first = lines[0].lstrip()
    if first.startswith("@"):
        if len(lines) % 4:
            raise ValueError("FASTQ는 read마다 4줄이어야 합니다.")
        sequences = []
        for start in range(0, len(lines), 4):
            if not lines[start].lstrip().startswith("@"):
                raise ValueError("FASTQ 이름 줄은 @로 시작해야 합니다.")
            if not lines[start + 2].lstrip().startswith("+"):
                raise ValueError("FASTQ 세 번째 줄은 +로 시작해야 합니다.")
            sequences.append(_clean_sequence(lines[start + 1]))
        return sequences
    if first.startswith(">"):
        sequences, parts = [], []
        seen_header = False
        for line in lines:
            if line.lstrip().startswith(">"):
                if seen_header:
                    sequences.append(_clean_sequence("".join(parts)))
                parts, seen_header = [], True
            else:
                parts.append(line)
        if seen_header:
            sequences.append(_clean_sequence("".join(parts)))
        return sequences
    return [_clean_sequence(line) for line in lines if line.strip()]


def reverse_complement(sequence):
    """원본 ReverseEvert: 역상보 read의 방향을 되돌림."""
    return sequence.translate(str.maketrans("ATGC", "TACG"))[::-1]


class LCG:
    """원본 실험 read 대신 사용하는 재현 가능한 교육용 채널 난수."""

    def __init__(self, seed):
        """원본 채널의 교육용 확장: seed를 32 bit 상태로 저장."""
        self.state = int(seed) & 0xFFFFFFFF

    def next(self):
        """원본 채널의 교육용 확장: SPEC의 LCG 한 번 진행."""
        self.state = (1664525 * self.state + 1013904223) & 0xFFFFFFFF
        return self.state / 4294967296


def simulate(oligo_seqs, seed=1, coverage=10, p_drop=0, p_sub=0,
             p_ins=0, p_del=0, p_rc=0.5, drop=(), shuffle=True):
    """원본 시퀀싱 입력의 교육용 모사: 소실·치환·삽입·결실."""
    if not isinstance(coverage, int) or coverage < 1:
        raise ValueError("coverage는 1 이상의 정수여야 합니다.")
    if any(not 0 <= p <= 1 for p in (p_drop, p_sub, p_ins, p_del, p_rc)):
        raise ValueError("각 확률은 0..1이어야 합니다.")
    if p_sub + p_ins + p_del > 1:
        raise ValueError("p_sub + p_ins + p_del은 1 이하여야 합니다.")
    rng, reads, dropped = LCG(seed), [], set(drop)
    for index, oligo in enumerate(oligo_seqs, 1):
        sequence = oligo.seq if isinstance(oligo, Oligo) else str(oligo)
        u = rng.next()
        if index in dropped or u < p_drop:
            continue
        copies = 1 + int(rng.next() * (2 * coverage - 1))
        for _ in range(copies):
            read = []
            for base in sequence:
                u = rng.next()
                if u < p_del:
                    continue
                if u < p_del + p_ins:
                    read.extend((base, BASES[int(rng.next() * 4)]))
                elif u < p_del + p_ins + p_sub:
                    others = BASES.replace(base, "")
                    read.append(others[int(rng.next() * 3)])
                else:
                    read.append(base)
            sequence_read = "".join(read)
            if rng.next() < p_rc:
                sequence_read = reverse_complement(sequence_read)
            reads.append(sequence_read)
    if shuffle:
        for k in range(len(reads) - 1, 0, -1):
            j = int(rng.next() * (k + 1))
            reads[k], reads[j] = reads[j], reads[k]
    return reads


def to_fastq(reads):
    """원본 FASTQ 입력에 대응하는 read·고정 품질 문자열 출력."""
    return "".join(f"@read_{i}\n{seq}\n+\n{'I' * len(seq)}\n"
                   for i, seq in enumerate(reads, 1))


def _matches(left, right):
    """원본 PrimerSort: 동일 위치에 일치하는 염기 수."""
    return sum(a == b for a, b in zip(left, right))


def _consensus(bodies):
    """원본 Binarization/Consensus2: ATGC 순서로 동률 해결."""
    result = []
    for column in zip(*bodies):
        counts = Counter(column)
        result.append(max(BASES, key=lambda base: counts[base]))
    return "".join(result)


def _byte_consensus(rows):
    """원본 Local RS의 최빈값: 동률이면 작은 byte 선택."""
    output = bytearray()
    for column in zip(*rows):
        counts = Counter(column)
        output.append(min(counts, key=lambda value: (-counts[value], value)))
    return bytes(output)


def parse_header(row):
    """원본 KeyFind/KIS: 1번 행에서 DNAS-1 메타데이터 읽기."""
    if len(row) != ROW_BYTES or row[0] != 1 or row[1] not in TYPE_NAMES:
        raise ValueError("DNAS-1 version=1 헤더를 찾지 못했습니다.")
    count = int.from_bytes(row[10:12], "big")
    length = int.from_bytes(row[2:6], "big")
    if count < 2 or count % 2 or count * 3 // 2 > 65535:
        raise ValueError("헤더의 데이터 행 수 D가 잘못되었습니다.")
    if length > (count - 1) * ROW_BYTES:
        raise ValueError("헤더 파일 길이가 행 용량보다 큽니다.")
    if any(value > 127 for value in row[13:17]):
        raise ValueError("헤더 확장자는 ASCII여야 합니다.")
    return {"version": row[0], "type": row[1], "length": length,
            "crc32": int.from_bytes(row[6:10], "big"), "D": count,
            "flags": row[12],
            "ext": row[13:17].decode("ascii").rstrip(" ")}


def _restore_xor(rows, statuses, count):
    """원본 XORrun2: 세 행 중 하나만 없을 때 두 행으로 복원."""
    half = count // 2
    for j in range(1, half + 1):
        triplet = (j, j + half, count + j)
        missing = [index for index in triplet if index not in rows]
        if len(missing) == 1:
            available = [index for index in triplet if index in rows]
            rows[missing[0]] = xor_bytes(rows[available[0]], rows[available[1]])
            statuses[missing[0]] = "xor"


def decode(reads, f=F, r=R):
    """원본 STL_Decode: 방향 → 묶음 → Global/Local RS → XOR."""
    f, r = _primers(f, r)
    reads = read_sequences(reads) if isinstance(reads, str) else list(reads)
    total_length = len(f) + BODY_NT + len(r)
    groups, rows, statuses = {}, {}, {}
    report = {"reads": len(reads), "reversed": 0, "no_primer": 0,
              "bad_length": 0, "invalid_index": 0, "groups": 0,
              "expected": 0, "global": 0, "local": 0, "xor": 0,
              "missing": [], "crc_ok": False, "type": -1,
              "ext": "", "length": 0, "sha256": "", "status": []}
    for raw in reads:
        sequence = _clean_sequence(raw)
        if _matches(sequence[:len(f)], f) < len(f) - 2:
            sequence = reverse_complement(sequence)
            if _matches(sequence[:len(f)], f) < len(f) - 2:
                report["no_primer"] += 1
                continue
            report["reversed"] += 1
        reverse_start = len(f) + BODY_NT
        if (len(sequence) < total_length
                or _matches(sequence[reverse_start:total_length], r)
                < len(r) - 2):
            report["bad_length"] += 1
            continue
        body = sequence[len(f):reverse_start]
        index = int.from_bytes(dna_to_bytes(body[68:76]), "big")
        if not 1 <= index <= 65535:
            report["invalid_index"] += 1
            continue
        groups.setdefault(index, []).append(body)
    report["groups"] = len(groups)
    for index in sorted(groups):
        bodies = groups[index]
        corrected = rs_decode(dna_to_bytes(_consensus(bodies)))
        if corrected is not None and int.from_bytes(corrected[0][17:19], "big") == index:
            rows[index], statuses[index] = corrected[0][:17], "global"
            continue
        local_rows = []
        for body in bodies:
            corrected = rs_decode(dna_to_bytes(body))
            if corrected is not None and int.from_bytes(corrected[0][17:19], "big") == index:
                local_rows.append(corrected[0][:17])
        if local_rows:
            rows[index], statuses[index] = _byte_consensus(local_rows), "local"

    header = None
    if 1 in rows:
        try:
            header = parse_header(rows[1])
        except ValueError:
            pass
    count = header["D"] if header else 2 * ((max(rows, default=0) + 2) // 3)
    if count:
        _restore_xor(rows, statuses, count)
    if header is None and 1 in rows:
        try:
            header = parse_header(rows[1])
            count = header["D"]
            _restore_xor(rows, statuses, count)
        except ValueError:
            pass
    expected = count * 3 // 2
    report["expected"] = expected
    report["missing"] = [index for index in range(1, expected + 1)
                         if index not in rows]
    report["status"] = [statuses.get(index, "missing")
                        for index in range(1, expected + 1)]
    for method in ("global", "local", "xor"):
        report[method] = sum(value == method for value in statuses.values())
    if header is None:
        report["sha256"] = hashlib.sha256(b"").hexdigest()
        return b"", None, report

    data_rows = []
    for index in range(2, count + 1):
        row = rows.get(index, bytes(ROW_BYTES))
        if header["flags"] & 1:
            row = xor_bytes(row, whitening_mask(index))
        data_rows.append(row)
    data = b"".join(data_rows)[:header["length"]]
    report.update({"crc_ok": crc32(data) == header["crc32"],
                   "type": header["type"], "ext": header["ext"],
                   "length": header["length"],
                   "sha256": hashlib.sha256(data).hexdigest()})
    return data, header, report


def _parser():
    """원본 스크립트 실행 인수에 해당: 수업용 세 CLI 명령."""
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    encoder = commands.add_parser("encode", help="이름·사진·파일 → FASTA")
    source = encoder.add_mutually_exclusive_group(required=True)
    source.add_argument("--text")
    source.add_argument("--image")
    source.add_argument("--file")
    encoder.add_argument("-o", "--output", help="FASTA 파일 (생략하면 표준 출력)")
    encoder.add_argument("--whiten", action="store_true")
    encoder.add_argument("--max-side", type=int, default=64)
    encoder.add_argument("--quality", type=int, default=60)
    encoder.add_argument("--gray", action="store_true")
    encoder.add_argument("--ext")
    channel = commands.add_parser("simulate", help="FASTA → 모의 FASTQ")
    channel.add_argument("input")
    channel.add_argument("-o", "--output", required=True)
    channel.add_argument("--seed", type=int, default=1)
    channel.add_argument("--coverage", type=int, default=10)
    for name, default in (("drop", 0), ("sub", 0), ("ins", 0),
                          ("del", 0), ("rc", 0.5)):
        channel.add_argument(f"--p-{name}", type=float, default=default)
    channel.add_argument("--drop", nargs="*", type=int, default=[])
    channel.add_argument("--no-shuffle", action="store_true")
    decoder = commands.add_parser("decode", help="FASTQ/FASTA → 복원 파일")
    decoder.add_argument("input")
    decoder.add_argument("-o", "--output", required=True)
    decoder.add_argument("--report", help="JSON 보고서를 저장할 경로")
    for command in (encoder, decoder):
        command.add_argument("--f-primer", default=F)
        command.add_argument("--r-primer", default=R)
    return parser


def main(argv=None):
    """원본 STL_Encode/STL_Decode 실행 흐름을 CLI로 연결."""
    args = _parser().parse_args(argv)
    if args.command == "encode":
        if args.text is not None:
            data, dtype, ext = text_bytes(args.text), "text", "txt"
        elif args.image:
            data = image_bytes(args.image, args.max_side, args.quality, args.gray)
            dtype, ext = "image", "jpg"
        else:
            data = Path(args.file).read_bytes()
            dtype, ext = "file", Path(args.file).suffix[1:].lower()[:4] or "bin"
        oligos = encode(data, dtype, args.ext or ext, args.whiten,
                        args.f_primer, args.r_primer)
        if args.output is None:
            sys.stdout.write(to_fasta(oligos))
        else:
            Path(args.output).write_text(to_fasta(oligos), encoding="utf-8", newline="\n")
        print(json.dumps({"bytes": len(data), "oligos": len(oligos),
                          "crc32": f"{crc32(data):08X}",
                          "sha256": hashlib.sha256(data).hexdigest()},
                         ensure_ascii=False, indent=2),
              file=sys.stderr if args.output is None else sys.stdout)
        return 0
    reads = read_sequences(Path(args.input).read_text(encoding="utf-8"))
    if args.command == "simulate":
        reads = simulate(reads, args.seed, args.coverage, args.p_drop, args.p_sub,
                         args.p_ins, args.p_del, args.p_rc, args.drop,
                         not args.no_shuffle)
        Path(args.output).write_text(to_fastq(reads), encoding="utf-8", newline="\n")
        print(json.dumps({"reads": len(reads)}, indent=2))
        return 0
    data, header, report = decode(reads, args.f_primer, args.r_primer)
    Path(args.output).write_bytes(data)
    report_json = json.dumps({"header": header, "report": report},
                             ensure_ascii=False, indent=2)
    print(report_json)
    if args.report:
        Path(args.report).write_text(report_json + "\n", encoding="utf-8")
    return 0 if report["crc_ok"] else 2


if __name__ == "__main__":
    sys.exit(main())
