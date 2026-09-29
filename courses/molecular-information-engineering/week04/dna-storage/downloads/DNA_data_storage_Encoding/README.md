# DNA_data_storage_Encoding 누적 MATLAB 실습

MATLAB Online에서 이 폴더를 MATLAB Drive로 올린 뒤 `DNA_data_storage_Encoding_1.m`부터 번호 순서대로 엽니다. MATLAB 파일명에는 하이픈을 쓰면 뺄셈으로 해석되므로 단계 구분자는 밑줄을 씁니다. 각 파일은 앞 단계 코드를 누적한 독립 실행본이며, 실행 결과에 `PASS` 검증 로그가 나오는지 확인하고 다음 단계로 이동합니다. 최종 파일은 `DNA_data_storage_Encoding_1_6.m`입니다. 각 파일에 그 단계까지 필요한 코드를 모두 넣었으며, 별도 helper/function `.m` 파일은 필요 없습니다. RS 인코더의 로컬 function은 1-5·1-6 파일 끝에, 모든 디코더 helper function은 디코더 파일 끝에 함께 들어 있습니다.

1. `Encoding_1.m`: text/file/image byte 입력 → `FF FF` 형식 HEX 보기
2. `Encoding_1_2.m`: 17 byte 행 분할 및 PAD `0x1B` 확인
3. `Encoding_1_3.m`: 바깥 XOR parity 행 추가
4. `Encoding_1_4.m`: 각 행에 2 byte 고정 index 붙이기
5. `Encoding_1_5.m`: inner RS(27,19)로 8 parity byte 생성
6. `Encoding_1_6.m`: 108 nt 본문 + 20 nt primer 양쪽 → 148 nt, FASTA 및 한 줄당 서열 하나인 `dnas_sequences.txt` 출력
7. `DNA_data_storage_Decoding_1.m`: `dnas_sequences.txt`를 읽어 `decoded.txt` 또는 설정 확장자의 복원 파일을 같은 현재 폴더에 저장

명령창 실행 예: `run('DNA_data_storage_Encoding_1_2.m')`. 위 명령을 1 → 1_2 → 1_3 → 1_4 → 1_5 → 1_6 순서로 실행합니다. 각 실행 로그에 `Block n PASS`가 표시되면 다음 파일로 이동하세요.

각 파일 맨 위 설정에서 `inputMode`, `textInput`/`inputFile`, primer, output names를 지정하세요. `inputMode='text'`는 UTF-8로, `image`/`file`은 `fopen(...,'rb')`와 `fread(...,'*uint8')`로 원본 byte 그대로 입력합니다. 디코더에는 인코더가 출력한 `L`, `D`, 확장자 값을 복사합니다. FASTA를 쓰려면 decoder `inFile`을 `dnas_out.fasta`로 바꿔도 됩니다. 이미지 예제 `dna_helix_demo.jpg`가 함께 있습니다.


## 학생 FASTA 파일과 복호 설정 코드

웹의 `upload.html` 폼에서 학생 이름·학번과 FASTA/TXT, `L`, `D`, 확장자를 선택하면 MATLAB 설정 줄을 복사할 수 있습니다. 폼은 브라우저 안에서만 파일 형식을 확인하며 파일·개인정보를 서버나 NAS로 보내지 않습니다. 선택한 FASTA는 학생이 MATLAB Drive에 직접 올린 뒤 설정 네 줄을 `DNA_data_storage_Decoding_1.m`의 맨 위에 반영합니다.
