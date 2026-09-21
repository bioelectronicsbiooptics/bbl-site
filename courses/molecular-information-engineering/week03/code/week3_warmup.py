# Python 준비 · 실습 1 (Google Colab)
# 분자정보공학 3-2강 인코딩 실습 · 슬라이드 8, 9의 코드

# ---- 슬라이드 8 · Colab 환경 설정 ----
print("Hello, DNA")

x = 65
print(chr(x), ord("A"), format(x, "08b"))

for c in "DNA":
    print(c, ord(c), format(ord(c), "08b"))

# ---- 슬라이드 9 · Python 실습 1 ----
name = "SONG"
for c in name:
    print(c, ord(c), format(ord(c), "08b"))

bits = ""
for c in name:
    bits = bits + format(ord(c), "08b")
print(bits, len(bits))

# 같은 일을 한 줄로 (내포 표기)
bits = "".join(format(ord(c), "08b") for c in name)
