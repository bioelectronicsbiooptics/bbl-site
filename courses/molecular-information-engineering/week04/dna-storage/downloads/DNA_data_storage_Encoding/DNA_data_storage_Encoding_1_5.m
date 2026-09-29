%% DNA 저장 실습 — 1~5단계 누적 인코딩
% 1단계부터 5단계까지 같은 스크립트 아래에 순서대로 이어 붙입니다.
% clear는 맨 처음에만 사용합니다. 각 %% 섹션을 위에서 아래로 실행하세요.
% clear는 이전 실행 변수 제거, clc는 명령창을 비워 이번 단계 로그를 보기 쉽게 합니다.
clear; clc;
%% 0. 설정 — 입력 종류와 파일 이름만 바꿔 실행
% 'text'=한글/문자열, 'image'=사진 파일, 'file'=일반 파일
inputMode = 'text';             % 'text' | 'image' | 'file'
textInput = '나노바이오공학전공';         % inputMode='text'일 때 입력 문자열
inputFile = '';                 % 비우면 파일 선택창 (image / file)
% FASTA는 헤더 포함 형식, TXT는 sequence만 있어 붙여넣기·복호 입력이 간단합니다.
outFasta = 'dnas_out.fasta';
outSequencesTxt = 'dnas_sequences.txt'; % plain TXT: one 148 nt sequence per line
F = 'AGCCTTGTGTCCATCAATCC';     % forward primer (20 nt)
R = 'TGCGCTATGGTTTGGCTAAT';     % reverse primer (20 nt)

%% 1. 입력 → byte (Block 1: 이름은 UTF-8, 사진은 raw byte)
switch lower(inputMode)
    case 'text'
        dataBytes = uint8(unicode2native(textInput, 'UTF-8'));
        sourceName = 'text'; ext = 'txt';
    case {'image','file'}
        if isempty(inputFile)
            [fn, fp] = uigetfile('*.*', '인코딩할 파일 선택');
            if isequal(fn, 0), error('파일 선택을 취소했습니다.'); end
            inputFile = fullfile(fp, fn);
        end
        fid = fopen(inputFile, 'rb');
        if fid < 0, error('파일을 열 수 없습니다: %s', inputFile); end
        dataBytes = fread(fid, Inf, '*uint8').'; fclose(fid);
        [~, sourceName, ext0] = fileparts(inputFile);
        ext = lower(strrep(ext0, '.', ''));
        if isempty(ext), ext = 'bin'; end
    otherwise
        error("inputMode는 'text', 'image', 'file' 중 하나여야 합니다.");
end
dataBytes = reshape(uint8(dataBytes), 1, []);
L = numel(dataBytes);
if L == 0, error('입력 byte가 비어 있습니다.'); end
fprintf('입력: %s | %d byte | 확장자 .%s\n', sourceName, L, ext);
nShow = min(32, L);
fprintf('Block 1 HEX (first %d of %d bytes):', nShow, L); fprintf(' %02X', dataBytes(1:nShow));
if L > nShow, fprintf(' ... (%d more bytes)', L - nShow); end
fprintf('\n');

assert(isa(dataBytes, 'uint8') && L > 0);
fprintf('Block 1 PASS | %d bytes\n', L);

%% 2. 17 byte 행 분할 (Block 2: 빈 자리는 PAD=0x1B)
PAD = uint8(27); ROW_BYTES = 17; NSYM = 8;
% 헤더 없는 포맷이므로 사용자가 decoder에 L과 D를 알려 줍니다.
% 데이터 행 D는 짝수로 올림: 앞 절반과 뒤 절반을 XOR합니다.
% data row는 최소 2개·짝수여야 XOR 쌍을 만들 수 있습니다.
D = max(2, 2 * ceil(ceil(L / ROW_BYTES) / 2));
H = D / 2; N = D + H;
if N > 65535, error('고정 index 한계(65535 strand)를 넘었습니다.'); end
rows = repmat(PAD, N, ROW_BYTES);
for row = 1:D
    first = (row - 1) * ROW_BYTES + 1;
    last = min(row * ROW_BYTES, L);
    if first <= last
        rows(row, 1:last-first+1) = dataBytes(first:last);
    end
end
assert(isequal(reshape(rows(1:D, :)', 1, []), [dataBytes repmat(PAD, 1, 17*D-L)]), 'Block 2 분할 검증 실패');
fprintf('Block 2 PASS | %d data rows × 17 byte (D=%d, H=%d, N=%d)\n', D, D, H, N);

disp('첫 데이터 행 (HEX)'); fprintf('%02X ',rows(1,:)); fprintf('\n');

%% 3. 바깥 XOR 행 추가 (Block 3: 같은 위치 byte끼리 XOR)
% XOR 행의 고정 위치는 D+j (j=1..H)입니다.
for j = 1:H
    rows(D + j, :) = bitxor(rows(j, :), rows(j + H, :));
end
assert(isequal(rows(D+1:end, :), bitxor(rows(1:H, :), rows(H+1:D, :))), 'Block 3 XOR 검증 실패');
fprintf('Block 3 PASS | XOR parity rows = %d\n', H);

disp('첫 XOR 행 (HEX)'); fprintf('%02X ',rows(D+1,:)); fprintf('\n');

%% 4. 고정 index → inner RS(27,19)
% index 1..N을 2 byte big-endian으로 표현합니다.
indexBytesByRow = zeros(N, 2, 'uint8');
messageByRow = zeros(N, 19, 'uint8');
for index = 1:N
    % 높은 byte 먼저 저장: index 3은 [0, 3], decoder가 2 byte를 다시 읽습니다.
    indexBytesByRow(index, :) = uint8([floor(index / 256), mod(index, 256)]);
    messageByRow(index, :) = [rows(index, :) indexBytesByRow(index, :)];
end
assert(isequal(messageByRow(:, 18:19), indexBytesByRow), 'Block 4 index 검증 실패');
fprintf('index 부착: %d rows × 19 bytes\n', N);

% GF(256) 표: primitive polynomial 0x11D, alpha=2.
% 로그 표에서 지수를 더하면 GF 곱셈이 됩니다. 0은 별도로 처리합니다.
powers = zeros(1,512); logs = zeros(1,256); x = 1;
for k = 0:254
    powers(k+1) = x; logs(x+1) = k;
    x = x*2;
    if x >= 256, x = bitxor(x,285); end
end
for k = 255:511, powers(k+1) = powers(k-254); end
% 생성다항식 g(x) = product(x + alpha^r), r=1..8.
generator = 1;
for r = 1:8
    product = zeros(size(generator)); nz = generator ~= 0;
    product(nz) = powers(logs(generator(nz)+1) + logs(powers(r+1)+1) + 1);
    generator = bitxor([generator 0], [0 product]);
end
% 각 19 byte message 뒤에 나눗셈 나머지 8 byte를 붙입니다.
codewords = zeros(N,27,'uint8');
for index = 1:N
    message = double(messageByRow(index,:));
    work = [message zeros(1,8)];
    for k = 1:19
        coefficient = work(k);
        if coefficient ~= 0
            g = generator(2:end); product = zeros(1,8); nz = g ~= 0;
            product(nz) = powers(logs(g(nz)+1)+logs(coefficient+1)+1);
            work(k+(1:8)) = bitxor(work(k+(1:8)),product);
        end
    end
    codewords(index,:) = uint8([message work(20:27)]);
end
% 첫 codeword의 syndrome 8개가 모두 0인지 확인합니다.
syndrome = zeros(1,8);
for r = 1:8
    y = 0;
    for c = double(codewords(1,:))
        if y ~= 0, y = powers(logs(y+1)+r+1); end
        y = bitxor(y,c);
    end
    syndrome(r) = y;
end
assert(isequal(codewords(:,1:19), messageByRow) && ~any(syndrome));
fprintf('Block 4 PASS | %d codewords × 27 bytes, first syndrome = ',N);
fprintf('%d ',syndrome); fprintf('\n');
disp('첫 codeword (HEX)'); fprintf('%02X ',codewords(1,:)); fprintf('\n');

%% 5. byte → DNA → primer → FASTA / sequence TXT 저장
% F와 R은 1단계 설정에서 이미 선언한 프라이머를 그대로 사용합니다.
% F = 'AGCCTTGTGTCCATCAATCC';  % 1단계에서 선언한 forward primer (20 nt)
% R = 'TGCGCTATGGTTTGGCTAAT';  % 1단계에서 선언한 reverse primer (20 nt)
% 위 두 줄은 설명용 주석입니다. 1~4단계를 실행했다면 다시 선언할 필요가 없습니다.
% 아래 [F bodyDNA R]은 F를 108 nt 본문 앞에, R을 뒤에 붙입니다.
% 여기서 R은 가닥 끝에 넣을 서열로 정해져 있어 다시 역상보 변환하지 않습니다.
% 전체 길이: F 20 nt + 본문 108 nt + R 20 nt = 148 nt.
% 00=A, 01=T, 10=G, 11=C. 한 byte를 높은 bit부터 4 nt로 읽습니다.
assert(numel(F)==20 && numel(R)==20 && all(ismember([F R],'ATGC')));
BASES = 'ATGC'; seqs = cell(1,N);
for index = 1:N
    bytes = double(codewords(index,:)); v = zeros(4,27);
    for k = 1:4, v(k,:) = mod(floor(bytes/2^(8-2*k)),4); end
    bodyDNA = BASES(reshape(v,1,[])+1);
    seqs{index} = [F bodyDNA R];
end
assert(all(cellfun(@numel,seqs)==148));
fid = fopen(outFasta,'wt');
if fid < 0, error('FASTA 출력 파일을 열 수 없습니다.'); end
for index = 1:N
    % 복호 정보는 FASTA 이름 줄에 자동 기록합니다. DNA 서열에는 넣지 않습니다.
    if index == 1
        fprintf(fid,'>strand_%05d L=%d D=%d ext=%s\n%s\n',index,L,D,ext,seqs{index});
    else
        fprintf(fid,'>strand_%05d\n%s\n',index,seqs{index});
    end
end
fclose(fid);
fid = fopen(outSequencesTxt,'wt');
if fid < 0, error('TXT 출력 파일을 열 수 없습니다.'); end
for index = 1:N, fprintf(fid,'%s\n',seqs{index}); end
fclose(fid);
fprintf('Block 5 PASS | %d strands × 148 nt\n',N);
fprintf('첫 sequence: %s\n',seqs{1});
fprintf('저장: %s / %s\n',outFasta,outSequencesTxt);
fprintf('디코더 설정: L=%d; D=%d; ext=''%s'';\n',L,D,ext);
% 정확한 byte 비교용 원본을 보관합니다. DNA에 헤더를 넣는 것은 아닙니다.
save('original_bytes.mat','dataBytes','L','D','ext');
