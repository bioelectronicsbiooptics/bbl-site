"""Pillow로 만든 64 × 64 px 실습용 그림. 외부 이미지 없이 재생성한다."""

from pathlib import Path

from PIL import Image, ImageDraw


def make_sample(path=None):
    """ACS Nano 입력 준비 대응: STL 대신 작은 JPEG 파일을 만든다."""
    path = Path(path or Path(__file__).with_name("sample_photo.jpg"))
    side = 64
    image = Image.new("RGB", (side, side))
    pixels = image.load()
    for y in range(side):
        for x in range(side):
            pixels[x, y] = (18 + x // 3, 42 + y // 2, 76 + (x + y) // 3)
    draw = ImageDraw.Draw(image)
    # 삼각함수 대신 정수 좌표를 써서 재생성 결과를 단순하게 유지한다.
    left = [(21, 5), (12, 13), (21, 21), (34, 29), (43, 37), (34, 45)]
    right = [(34, 5), (43, 13), (34, 21), (21, 29), (12, 37), (21, 45)]
    for a, b in zip(left, right):
        draw.line((a, b), fill=(185, 211, 232), width=2)
    draw.line(left, fill=(82, 159, 217), width=3)
    draw.line(right, fill=(230, 178, 68), width=3)
    # 3 × 5 bitmap 글꼴: 시스템에 설치된 글꼴에 의존하지 않는다.
    letters = {"I": [7, 2, 2, 2, 7], "N": [5, 7, 7, 5, 5],
               "U": [5, 5, 5, 5, 7]}
    for k, char in enumerate("INU"):
        for y, row in enumerate(letters[char]):
            for x in range(3):
                if row & (1 << (2 - x)):
                    px, py = 21 + 8 * k + 2 * x, 51 + 2 * y
                    draw.rectangle((px, py, px + 1, py + 1),
                                   fill=(246, 248, 251))
    image.save(path, "JPEG", quality=60, optimize=False, progressive=False)
    return path


if __name__ == "__main__":
    print(make_sample())
