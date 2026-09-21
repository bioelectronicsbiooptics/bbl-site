# 확장 ② 한글 이름 (UTF-8 3 byte) — 셀 ①–⑤ 뒤에 실행
# 분자정보공학 3-2강 인코딩 실습 · 슬라이드 16, 17, 22의 코드

# ---- 슬라이드 16 · Python 인코딩 ①②③ ----
# 셀 1: 이름 → 비트
name = "SONG"                      # ← 자기 이름
bits = "".join(format(ord(c), "08b") for c in name)
print(bits, len(bits))

# 셀 2: 비트 → DNA (2 bits/nt)
m = {"00": "A", "01": "C", "10": "G", "11": "T"}
dna = "".join(m[bits[i:i+2]] for i in range(0, len(bits), 2))
print(dna, len(dna))

# 셀 3: GC% · 최대 호모폴리머
gc = (dna.count("G") + dna.count("C")) / len(dna) * 100
run, maxrun = 1, 1
for i in range(1, len(dna)):
    run = run + 1 if dna[i] == dna[i-1] else 1
    maxrun = max(maxrun, run)
print(f"GC={gc:.1f}%  maxrun={maxrun}")

# ---- 슬라이드 17 · Python 디코딩 ④ · FASTA ⑤ ----
# 셀 4: DNA → 비트 → 이름 (디코딩)
inv = {v: k for k, v in m.items()}     # 역표 A→00 …
bits2 = "".join(inv[b] for b in dna)
text = "".join(chr(int(bits2[i:i+8], 2))
               for i in range(0, len(bits2), 8))
print(text, text == name)

# 셀 5: FASTA 형식으로 출력 · 파일 저장
fasta = f">{name}_2bit len={len(dna)} GC={gc:.1f}% maxrun={maxrun}\n{dna}\n"
print(fasta)
with open("my_name.fasta", "w") as f:
    f.write(fasta)
# Colab 왼쪽 폴더 아이콘 → my_name.fasta 다운로드

# ---- 슬라이드 22 · 확장 ② 한글 UTF-8 ----
name = "송영준"
raw = name.encode("utf-8")            # b'\xec\x86\xa1...' 9 byte
bits = "".join(format(b, "08b") for b in raw)
dna = "".join(m[bits[i:i+2]] for i in range(0, len(bits), 2))
print(len(raw), len(dna))            # 9 36

# 디코딩: 비트 → 바이트 → 문자열
bits2 = "".join(inv[b] for b in dna)  # 새 dna로 셀 ④ 다시
b2 = bytes(int(bits2[i:i+8], 2) for i in range(0, len(bits2), 8))
print(b2.decode("utf-8"))
