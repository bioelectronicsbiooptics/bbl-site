function [data, hdr, rep] = dnas_decode(reads, F, R)
% 원본 STL_Decode: 방향 → PrimerSort → RS → XORrun → 파일.
c = dnas_constants();
if nargin < 2, F = c.F; end
if nargin < 3, R = c.R; end
F = upper(char(F)); R = upper(char(R));
assert(~isempty(F) && all(ismember(F, c.BASES)), 'Invalid F primer.');
assert(~isempty(R) && all(ismember(R, c.BASES)), 'Invalid R primer.');
if isstruct(reads), reads = {reads.seq}; end
if isstring(reads), reads = cellstr(reads); end
if ischar(reads), reads = dnas_parse_sequences(reads); end
rep = struct('reads', numel(reads), 'reversed', 0, 'no_primer', 0, ...
    'bad_length', 0, 'invalid_index', 0, 'groups', 0, 'expected', 0, ...
    'global', 0, 'local', 0, 'xor', 0, 'missing', [], ...
    'crc_ok', false, 'type', -1, 'ext', '', 'length', 0, ...
    'sha256', dnas_sha256(uint8([])), 'status', {{}});
groups = cell(1, 65535);
L = numel(F) + 108 + numel(R);
for k = 1:numel(reads)
    seq = upper(regexprep(char(reads{k}), '\s', ''));
    seq(seq == 'U') = 'T';
    if ~front_match(seq, F)
        seq = dnas_reverse_complement(seq);
        if ~front_match(seq, F)
            rep.no_primer = rep.no_primer + 1;
            continue;
        end
        rep.reversed = rep.reversed + 1;
    end
    startR = numel(F) + 109;
    if numel(seq) < L || ...
            sum(seq(startR:L) == R) < numel(R) - 2
        rep.bad_length = rep.bad_length + 1;
        continue;
    end
    body = seq(numel(F) + (1:108));
    indexBytes = dnas_dna_to_bytes(body(69:76));
    index = double(indexBytes(1))*256 + double(indexBytes(2));
    if index < 1 || index > 65535
        rep.invalid_index = rep.invalid_index + 1;
        continue;
    end
    groups{index}(end + 1,:) = body;
end
indices = find(~cellfun('isempty', groups));
rep.groups = numel(indices);
rows = zeros(65535, 17, 'uint8');
present = false(1, 65535);
status = repmat({'missing'}, 1, 65535);
for index = indices
    bodies = groups{index};
    consensus = make_consensus(bodies);
    [msg, ~, ok] = dnas_rs_decode(dnas_dna_to_bytes(consensus));
    if ok && message_index(msg) == index
        rows(index,:) = msg(1:17);
        present(index) = true;
        status{index} = 'global';
        rep.global = rep.global + 1;
        continue;
    end
    % 원본 Local RS: consensus 실패 묶음의 read를 하나씩 복호한다.
    candidates = zeros(0, 17, 'uint8');
    for read = 1:size(bodies, 1)
        cw = dnas_dna_to_bytes(bodies(read,:));
        [msg, ~, ok] = dnas_rs_decode(cw);
        if ok && message_index(msg) == index
            candidates(end + 1,:) = msg(1:17); %#ok<AGROW>
        end
    end
    if ~isempty(candidates)
        rows(index,:) = mode(candidates, 1);
        present(index) = true;
        status{index} = 'local';
        rep.local = rep.local + 1;
    end
end
hdr = [];
if present(1), hdr = read_header(rows(1,:)); end
if ~isempty(hdr)
    D = hdr.D;
else
    maxIndex = find(present, 1, 'last');
    if isempty(maxIndex), maxIndex = 0; end
    D = 2*ceil(maxIndex / 3);
end
% 원본 XORrun: 각 (A,B,P)에서 정확히 한 행만 없을 때 복원한다.
[rows, present, status, count] = xor_rows(rows, present, status, D);
rep.xor = count;
if isempty(hdr) && present(1)
    hdr = read_header(rows(1,:));
    if ~isempty(hdr)
        D = hdr.D;
        [rows, present, status, count] = ...
            xor_rows(rows, present, status, D);
        rep.xor = rep.xor + count;
    end
end
N = 3*D/2;
rep.expected = N;
rep.missing = find(~present(1:N));
rep.status = status(1:N);
data = uint8([]);
if isempty(hdr), return; end
payload = rows(2:D,:);
if bitand(hdr.flags, 1)
    for row = 2:D
        payload(row - 1,:) = dnas_whiten(payload(row - 1,:), row);
    end
end
data = reshape(payload', 1, []);
data = data(1:hdr.length);
rep.crc_ok = dnas_crc32(data) == hdr.crc32;
rep.type = hdr.type; rep.ext = hdr.ext; rep.length = hdr.length;
rep.sha256 = dnas_sha256(data);
end

function yes = front_match(seq, primer)
% 원본 ReverseEvert · PrimerSort의 위치별 primer 일치 개수이다.
n = min(numel(seq), numel(primer));
yes = sum(seq(1:n) == primer(1:n)) >= numel(primer) - 2;
end

function seq = make_consensus(bodies)
% 원본 Consensus2: 동률은 ATGC 순서, 모르는 염기는 투표 제외.
bases = 'ATGC';
counts = zeros(4, 108);
for k = 1:4, counts(k,:) = sum(bodies == bases(k), 1); end
[~, best] = max(counts, [], 1);
seq = bases(best);
end

function index = message_index(msg)
% 원본 iSCAN의 index: 데이터 뒤 2 byte를 big-endian으로 읽는다.
index = double(msg(18))*256 + double(msg(19));
end

function hdr = read_header(bytes)
% 원본 KIS 역할: 첫 행에서 길이 · CRC · 배치를 읽는다.
b = double(bytes);
D = b(11)*256 + b(12);
L = b(3:6) * [2^24; 2^16; 2^8; 1];
hdr = [];
if b(1) ~= 1 || ~ismember(b(2), 0:2) || D < 2 || ...
        mod(D, 2) || 3*D/2 > 65535 || L > (D - 1)*17 || ...
        any(b(14:17) > 127)
    return;
end
hdr = struct('version', b(1), 'type', b(2), 'length', L, ...
    'crc32', b(7:10)*[2^24; 2^16; 2^8; 1], 'D', D, ...
    'flags', b(13), 'ext', regexprep(char(b(14:17)), ' +$', ''));
end

function [rows, present, status, count] = ...
        xor_rows(rows, present, status, D)
% 원본 XORrun2: xor_A ⊕ xor_B = xor_data 관계를 역으로 사용한다.
H = D/2;
count = 0;
for j = 1:H
    triple = [j j + H D + j];
    missing = triple(~present(triple));
    if numel(missing) ~= 1, continue; end
    have = triple(present(triple));
    rows(missing,:) = bitxor(rows(have(1),:), rows(have(2),:));
    present(missing) = true;
    status{missing} = 'xor';
    count = count + 1;
end
end
