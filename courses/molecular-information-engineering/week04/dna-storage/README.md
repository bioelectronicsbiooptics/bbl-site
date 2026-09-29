# MATLAB DNA 저장 실습 — 1~5단계와 Decoding.m

1. DNA_data_storage_Encoding_1.m: byte 입력 / HEX 확인
2. DNA_data_storage_Encoding_1_2.m: 17 byte 행 분할
3. DNA_data_storage_Encoding_1_3.m: outer XOR
4. DNA_data_storage_Encoding_1_4.m: 고정 index / inner RS(27,19)
5. DNA_data_storage_Encoding_1_5.m: primer / 148 nt / FASTA와 TXT 저장

각 파일은 그 단계까지 누적한 실행본입니다. 웹 강의록의 1~5번 코드 블록은 중복 없이 같은 스크립트 맨 아래에 이어 붙입니다.
https://bbl.stdbioelec.com/courses/molecular-information-engineering/week04/dna-storage/guide.html

사진은 inputMode='image', inputFile='dna_helix_demo.jpg'로 바꿉니다.
복호화는 Decoding.m 하나를 사용합니다. 인코더의 sequence TXT 또는 FASTA와 같은 폴더에 두고 파일 내부의 inFile/L/D/ext를 바꾼 뒤 Run합니다.
함수와 설명 주석은 파일 안에 포함되어 있습니다. original_bytes.mat가 있으면 원본 byte 비교 결과도 표시합니다.

헤더/CRC 없음. L/D/ext는 인코더 출력에서 기록하세요. 헤더 포함 DNAS-1 웹 도구의 파일과는 호환되지 않습니다.
