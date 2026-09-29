%% DNA data storage Encoding — 누적 실습 checkpoint 1-6
% 이 파일은 앞 단계 코드를 누적한 실행본입니다. 각 파일을 별도로 실행해 현재 단계까지 확인하세요.
% 이후 파일은 앞 단계에 해당하는 모든 코드와 검증을 포함합니다.
% clear는 이전 실행 변수 제거, clc는 명령창을 비워 이번 단계 로그를 보기 쉽게 합니다.
clear; clc;
%% 0. 설정 — 입력 종류와 파일 이름만 바꿔 실행
% 'text'=한글/문자열, 'image'=사진 파일, 'file'=일반 파일
inputMode = 'text';             % 'text' | 'image' | 'file'
textInput = '송영준 DNA';         % inputMode='text'일 때 입력 문자열
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

%% 3. 바깥 XOR 행 추가 (Block 3: 같은 위치 byte끼리 XOR)
% XOR 행의 고정 위치는 D+j (j=1..H)입니다.
for j = 1:H
    rows(D + j, :) = bitxor(rows(j, :), rows(j + H, :));
end
assert(isequal(rows(D+1:end, :), bitxor(rows(1:H, :), rows(H+1:D, :))), 'Block 3 XOR 검증 실패');
fprintf('Block 3 PASS | XOR parity rows = %d\n', H);

%% 4. 고정 index 추가 (Block 4: 순번을 big-endian 2 byte로 표현)
% index 1..N을 2 byte big-endian으로 표현합니다.
indexBytesByRow = zeros(N, 2, 'uint8');
messageByRow = zeros(N, 19, 'uint8');
for index = 1:N
    % 높은 byte 먼저 저장: index 3은 [0, 3], decoder가 2 byte를 다시 읽습니다.
    indexBytesByRow(index, :) = uint8([floor(index / 256), mod(index, 256)]);
    messageByRow(index, :) = [rows(index, :) indexBytesByRow(index, :)];
end
assert(isequal(messageByRow(:, 18:19), indexBytesByRow), 'Block 4 index 검증 실패');
fprintf('Block 4 PASS | %d fixed indices attached; message width = %d bytes.\n', N, size(messageByRow, 2));

%% 5. inner RS(27,19) (Block 5: 19 byte message에 8 parity byte 추가)
% 8 parity byte를 덧붙여 codeword 27 byte = 108 nt가 됩니다.
F = upper(char(F)); R = upper(char(R));
if numel(F) ~= 20 || numel(R) ~= 20 || ...
        any(~ismember(F, 'ATGC')) || any(~ismember(R, 'ATGC'))
    error('F와 R은 각각 A/T/G/C로 된 20 nt primer여야 합니다.');
end
codewords = zeros(N, 27, 'uint8');
for index = 1:N
    codewords(index, :) = rs_encode_27_19(messageByRow(index, :), NSYM);
end
assert(size(codewords, 2) == 27, 'Block 5 RS 길이 검증 실패');
fprintf('Block 5 PASS | inner RS codewords = %d × 27 bytes (%d nt body each).\n', N, size(codewords, 2) * 4);

%% 6. DNA 본문과 primer 조립 (Block 6: 108 + 20 + 20 = 148 nt)
seqs = cell(1, N);
for index = 1:N
    bodyDNA = bytes_to_dna(codewords(index, :));
    % Primer는 RS payload 바깥에 두어 본문은 항상 108 nt로 유지합니다.
    seqs{index} = [F bodyDNA R];
    if numel(seqs{index}) ~= 148
        error('내부 길이 오류: index %d의 길이는 %d nt입니다.', index, numel(seqs{index}));
    end
end
fprintf('Block 6 PASS | primers + DNA body: %d strands, strand length %d nt.\n', N, numel(seqs{1}));

%% 7. FASTA와 평문 TXT 출력 (TXT는 한 줄에 148 nt 서열 하나)
fid = fopen(outFasta, 'wt');
if fid < 0, error('출력 파일을 만들 수 없습니다: %s', outFasta); end
for index = 1:N
    fprintf(fid, '>strand_%05d|role=%s|index=%d\n%s\n', index, ...
        ternary(index <= D, 'data', 'xor'), index, seqs{index});
end
fclose(fid);
fid = fopen(outSequencesTxt, 'wt');
if fid < 0, error('출력 파일을 만들 수 없습니다: %s', outSequencesTxt); end
for index = 1:N, fprintf(fid, '%s\n', seqs{index}); end
fclose(fid);
fprintf('저장: %s (FASTA) + %s (sequence TXT)\n', outFasta, outSequencesTxt);
fprintf('디코더 설정값: L=%d, D=%d, ext=''%s''\n', L, D, ext);

%% 로컬 함수 — 이 파일 끝에 포함되어 별도 함수 파일이나 Toolbox가 필요 없습니다.
function codeword = rs_encode_27_19(message, nsym)
% RS 생성다항식을 나눗셈으로 구성합니다. GF(256), primitive polynomial 0x11D, roots alpha^1..alpha^8.
message = double(reshape(uint8(message), 1, []));
if numel(message) ~= 19 || nsym ~= 8
    error('RS(27,19)는 19 message byte와 8 parity byte를 요구합니다.');
end
[powers, logs] = gf_tables();
generator = 1;
for root = 1:nsym
    shifted = [0 gf_multiply(generator, powers(root + 1), powers, logs)];
    generator = bitxor([generator 0], shifted);
end
work = [message zeros(1, nsym)];
for k = 1:numel(message)
    coefficient = work(k);
    if coefficient ~= 0
        idx = k + (1:nsym);
        product = gf_multiply(generator(2:end), coefficient, powers, logs);
        work(idx) = bitxor(work(idx), product);
    end
end
codeword = uint8([message work(numel(message) + 1:end)]);
end

function product = gf_multiply(values, value, powers, logs)
product = zeros(size(values));
nonzero = values ~= 0 & value ~= 0;
if any(nonzero)
    exponents = logs(values(nonzero) + 1) + logs(value + 1);
    product(nonzero) = powers(exponents + 1);
end
end

function [powers, logs] = gf_tables()
persistent p l
if isempty(p)
    p = zeros(1, 512); l = zeros(1, 256); x = 1;
    for k = 0:254
        p(k + 1) = x; l(x + 1) = k;
        x = x * 2;
        if x >= 256, x = bitxor(x, 285); end
    end
    for k = 255:511, p(k + 1) = p(k - 254); end
end
powers = p; logs = l;
end

function dna = bytes_to_dna(bytes)
% byte의 상위 bit부터 2개씩 읽습니다: 00=A, 01=T, 10=G, 11=C. byte당 4 nt입니다.
bases = 'ATGC'; b = double(reshape(uint8(bytes), 1, []));
v = zeros(4, numel(b));
for k = 1:4
    v(k, :) = mod(floor(b / 2^(8 - 2*k)), 4);
end
dna = bases(reshape(v, 1, []) + 1);
end

function out = ternary(test, yes, no)
if test, out = yes; else, out = no; end
end
