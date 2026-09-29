%% DNA 저장 디코더 — 헤더 없음 · index 고정 · Global/Local RS · XOR
% dna_encode.m 출력 FASTA 또는 시퀀싱 FASTQ를 입력합니다.
% 인코더 실행창의 L, D 값을 아래에 그대로 입력해야 원본 파일 길이를 정확히 복원합니다.
clear; clc;

%% 0. 설정 — 인코더 출력값 입력
% 결과 파일은 현재 폴더(MATLAB Drive의 이 스크립트 폴더)에 저장됩니다.
inFile = 'dnas_sequences.txt'; % 인코더 TXT (한 줄에 서열 하나) / FASTA / FASTQ
L = 13;                        % 인코더가 출력한 원본 byte 길이
D = 2;                         % 인코더가 출력한 짝수 data row 수
ext = 'txt';                   % 결과 파일 확장자: txt, jpg, png, ...
outFile = ['decoded.' ext];
F = 'AGCCTTGTGTCCATCAATCC';
R = 'TGCGCTATGGTTTGGCTAAT';
H = D / 2; N = D + H; BASES = 'ATGC';
assert(D >= 2 && mod(D, 2) == 0 && N <= 65535, 'D는 양의 짝수여야 합니다.');
assert(L >= 0 && L <= 17 * D, 'L은 0..17*D 범위여야 합니다.');

%% 1. FASTA / FASTQ / plain sequence 읽기
seqs = read_sequences(inFile);
if isempty(seqs), error('입력 파일에서 서열을 찾을 수 없습니다.'); end
fprintf('읽은 sequence/read: %d\n', numel(seqs));

%% 2. 방향 정리 → primer 확인 → 고정 index로 묶기
groups = repmat({char(zeros(0, 108))}, 1, N);
nRev = 0; nNoP = 0; nBad = 0; nIdx = 0;
for k = 1:numel(seqs)
    s = upper(regexprep(seqs{k}, '\s', '')); s(s == 'U') = 'T';
    if numel(s) < 148 || sum(s(1:20) == F) < 18
        s = reverse_complement(s);
        if numel(s) < 148 || sum(s(1:20) == F) < 18
            nNoP = nNoP + 1; continue;
        end
        nRev = nRev + 1;
    end
    if numel(s) < 148 || sum(s(129:148) == R) < 18
        nBad = nBad + 1; continue;
    end
    body = s(21:128);                         % 108 nt = 27 byte RS codeword
    ib = dna_to_bytes(body(69:76));           % RS message byte 18–19: fixed index
    index = double(ib(1))*256 + double(ib(2));
    if index < 1 || index > N
        nIdx = nIdx + 1; continue;
    end
    groups{index}(end + 1, :) = body;
end

%% 3. 묶음별 consensus → Global RS → read별 Local RS
rows = zeros(N, 17, 'uint8');
have = false(1, N); how = repmat({'missing'}, 1, N);
for index = 1:N
    G = groups{index};
    if isempty(G), continue; end
    counts = zeros(4, 108);
    for q = 1:4, counts(q, :) = sum(G == BASES(q), 1); end
    [~, best] = max(counts, [], 1);              % 동률은 ATGC 순서
    [msg, ok] = rs_decode(dna_to_bytes(BASES(best)));
    if ok && message_index(msg) == index
        rows(index, :) = msg(1:17); have(index) = true; how{index} = 'global';
        continue;
    end
    localRows = zeros(0, 17, 'uint8');
    for q = 1:size(G, 1)
        [msg, ok] = rs_decode(dna_to_bytes(G(q, :)));
        if ok && message_index(msg) == index
            localRows(end + 1, :) = msg(1:17); %#ok<AGROW>
        end
    end
    if ~isempty(localRows)
        rows(index, :) = uint8(mode(double(localRows), 1));
        have(index) = true; how{index} = 'local';
    end
end

%% 4. 바깥 XOR로 (j, j+H, D+j) 중 하나만 빠진 행 복원
nXor = 0;
for j = 1:H
    triple = [j, j + H, D + j];
    missing = triple(~have(triple));
    if numel(missing) == 1
        known = triple(have(triple));
        rows(missing, :) = bitxor(rows(known(1), :), rows(known(2), :));
        have(missing) = true; how{missing} = 'xor'; nXor = nXor + 1;
    end
end

%% 5. 원래 데이터 행 연결 → 입력 byte 길이 L만큼 파일로 복원
missingData = find(~have(1:D));
if ~isempty(missingData)
    warning('복원되지 않은 data row가 있습니다: %s. 해당 영역은 0 byte로 기록됩니다.', ...
        mat2str(missingData));
end
allData = reshape(rows(1:D, :)', 1, []);
data = allData(1:L);
fid = fopen(outFile, 'wb');
if fid < 0, error('출력 파일을 만들 수 없습니다: %s', outFile); end
fwrite(fid, data, 'uint8'); fclose(fid);

%% 6. 검증 보고: 서열 수 · 방향 · primer · RS · XOR · 파일 byte
fprintf('read %d | reverse %d | no_primer %d | bad_length %d | bad_index %d\n', ...
    numel(seqs), nRev, nNoP, nBad, nIdx);
fprintf('strand %d | Global RS %d | Local RS %d | XOR 복원 %d\n', N, ...
    sum(strcmp(how, 'global')), sum(strcmp(how, 'local')), nXor);
if isempty(missingData), fprintf('데이터 행 전부 확보\n');
else, fprintf('누락 data row: %s\n', mat2str(missingData)); end
fprintf('복원 파일: %s (%d byte)\n', outFile, numel(data));
if strcmpi(ext, 'txt')
    fprintf('UTF-8 text: %s\n', native2unicode(data, 'UTF-8'));
elseif ismember(lower(ext), {'jpg','jpeg','png','tif','tiff','bmp'})
    try, figure('Name', outFile); image(imread(outFile)); axis image off;
    catch err, warning('이미지 표시 실패: %s', err.message); end
end

%% 로컬 함수 — FASTA/FASTQ와 RS 복호를 이 파일 하나에서 처리
function seqs = read_sequences(filename)
% FASTA, 4-line FASTQ, plain TXT를 판별해 각 read를 한 줄 문자열로 반환합니다.
t = strrep(fileread(filename), sprintf('\r'), '');
lines = strsplit(t, sprintf('\n')); lines = cellfun(@strtrim, lines, 'UniformOutput', false);
lines = lines(~cellfun(@isempty, lines)); seqs = {};
if isempty(lines), return; end
if lines{1}(1) == '>'                         % FASTA: wrapped sequence 지원
    current = '';
    for k = 1:numel(lines)
        if lines{k}(1) == '>'
            if ~isempty(current), seqs{end + 1} = current; end %#ok<AGROW>
            current = '';
        else
            current = [current lines{k}]; %#ok<AGROW>
        end
    end
    if ~isempty(current), seqs{end + 1} = current; end
elseif lines{1}(1) == '@'                     % FASTQ: wrapped sequence/quality 지원
    k = 1;
    while k <= numel(lines)
        if lines{k}(1) ~= '@', error('FASTQ %d번째 줄이 @ header가 아닙니다.', k); end
        k = k + 1; sequence = '';
        while k <= numel(lines) && lines{k}(1) ~= '+'
            sequence = [sequence lines{k}]; %#ok<AGROW>
            k = k + 1;
        end
        if k > numel(lines), error('FASTQ에서 + 구분자를 찾을 수 없습니다.'); end
        k = k + 1; qualityLength = 0;
        while k <= numel(lines) && qualityLength < numel(sequence)
            qualityLength = qualityLength + numel(lines{k}); k = k + 1;
        end
        if qualityLength ~= numel(sequence), error('FASTQ sequence/quality 길이가 다릅니다.'); end
        seqs{end + 1} = sequence; %#ok<AGROW>
    end
else
    seqs = lines;                               % 한 줄당 sequence 하나
end
end

function s = reverse_complement(s)
% 염기 A↔T, C↔G 치환 후 뒤집어 역상보 서열을 만듭니다.
s = upper(s); s(s == 'A') = 't'; s(s == 'T') = 'a';
s(s == 'G') = 'c'; s(s == 'C') = 'g'; s = upper(fliplr(s));
end

function b = dna_to_bytes(s)
% ATGC를 00/01/10/11로 되돌리고 4 nt마다 1 byte로 묶습니다.
v = zeros(1, numel(s)); v(s == 'T') = 1; v(s == 'G') = 2; v(s == 'C') = 3;
v = reshape(v, 4, []); b = uint8([64 16 4 1] * v);
end

function index = message_index(msg)
% RS가 복구한 message의 마지막 두 byte(big-endian)를 strand index로 읽습니다.
index = double(msg(18)) * 256 + double(msg(19));
end

function [msg, ok] = rs_decode(codeword)
% RS(27,19), GF(256)/0x11D, roots alpha^1..alpha^8; BM + Chien + Forney.
nsym = 8; msg = uint8([]); ok = false;
r = double(reshape(uint8(codeword), 1, [])); n = numel(r);
if n ~= 27, return; end
S = syndromes(r, nsym);
if ~any(S), msg = uint8(r(1:n - nsym)); ok = true; return; end
C = [1 zeros(1, nsym)]; Bp = C; degree = 0; shift = 1; lastDiscrepancy = 1;
for step = 0:nsym - 1
    discrepancy = S(step + 1);
    for i = 1:degree
        discrepancy = bitxor(discrepancy, gf_mul(C(i + 1), S(step - i + 1)));
    end
    if discrepancy == 0, shift = shift + 1; continue; end
    oldC = C; scale = gf_div(discrepancy, lastDiscrepancy);
    for i = 0:nsym - shift
        C(i + shift + 1) = bitxor(C(i + shift + 1), gf_mul(scale, Bp(i + 1)));
    end
    if 2 * degree <= step
        degree = step + 1 - degree; Bp = oldC;
        lastDiscrepancy = discrepancy; shift = 1;
    else
        shift = shift + 1;
    end
end
locator = C(1:degree + 1);
if degree == 0 || degree > nsym / 2, return; end
[E, ~] = gf_table(); positions = []; roots = [];
for p = 1:n
    x = E(mod(-(n - p), 255) + 1);
    if poly_eval_ascending(locator, x) == 0
        positions(end + 1) = p; roots(end + 1) = x; %#ok<AGROW>
    end
end
if numel(positions) ~= degree, return; end
omega = zeros(1, nsym);
for i = 0:degree
    for j = 0:nsym - i - 1
        omega(i + j + 1) = bitxor(omega(i + j + 1), gf_mul(locator(i + 1), S(j + 1)));
    end
end
derivative = zeros(1, degree);
for i = 1:degree
    if mod(i, 2), derivative(i) = locator(i + 1); end
end
for k = 1:numel(positions)
    denominator = poly_eval_ascending(derivative, roots(k));
    if denominator == 0, return; end
    magnitude = gf_div(poly_eval_ascending(omega, roots(k)), denominator);
    r(positions(k)) = bitxor(r(positions(k)), magnitude);
end
if any(syndromes(r, nsym)), return; end
msg = uint8(r(1:n - nsym)); ok = true;
end

function S = syndromes(r, nsym)
% 수신 codeword를 생성다항식의 근에 대입해 RS syndrome을 계산합니다.
[E, ~] = gf_table(); S = zeros(1, nsym);
for j = 1:nsym
    y = 0; x = E(j + 1);
    for c = r, y = bitxor(gf_mul(y, x), c); end
    S(j) = y;
end
end

function y = poly_eval_ascending(p, x)
% 오름차순 계수 다항식을 GF(256) Horner 방식으로 평가합니다.
y = 0;
for i = numel(p):-1:1, y = bitxor(gf_mul(y, x), p(i)); end
end

function c = gf_mul(a, b)
% GF(256) 곱셈: log/antilog 표로 계산합니다.
if a == 0 || b == 0, c = 0; return; end
[E, Lg] = gf_table(); c = E(Lg(a + 1) + Lg(b + 1) + 1);
end

function c = gf_div(a, b)
% GF(256) 나눗셈: 지수 차이를 255로 순환시킵니다.
if b == 0, error('GF(256): zero divisor'); end
if a == 0, c = 0; return; end
[E, Lg] = gf_table(); c = E(mod(Lg(a + 1) - Lg(b + 1), 255) + 1);
end

function [E, Lg] = gf_table()
% primitive polynomial 0x11D를 이용해 GF(256) lookup table을 한 번 생성합니다.
persistent e l
if isempty(e)
    e = zeros(1, 512); l = zeros(1, 256); x = 1;
    for p = 0:254
        e(p + 1) = x; l(x + 1) = p;
        x = x * 2; if x >= 256, x = bitxor(x, 285); end
    end
    for p = 255:511, e(p + 1) = e(p - 254); end
end
E = e; Lg = l;
end
