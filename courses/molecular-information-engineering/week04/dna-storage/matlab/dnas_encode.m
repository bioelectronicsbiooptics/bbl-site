function oligos = dnas_encode(bytes, type, ext, whiten, F, R)
% 원본 STL_Encode: column_data → XOR → nrsin → DNA_library.
c = dnas_constants();
if nargin < 2, type = 'file'; end
if nargin < 3, ext = 'bin'; end
if nargin < 4, whiten = false; end
if nargin < 5, F = c.F; end
if nargin < 6, R = c.R; end
if ischar(type) || isstring(type)
    type = find(strcmp(char(type), {'file', 'text', 'image'})) - 1;
end
assert(isscalar(type) && any(type == 0:2), 'Unknown input type.');
F = upper(char(F)); R = upper(char(R));
assert(~isempty(F) && all(ismember(F, c.BASES)), 'Invalid F primer.');
assert(~isempty(R) && all(ismember(R, c.BASES)), 'Invalid R primer.');
column_data = reshape(uint8(bytes), 1, []);
L = numel(column_data);
D = max(2, 2*ceil((1 + ceil(L/17)) / 2));
H = D/2; N = D + H;
assert(N <= 65535, 'DNAS-1 supports at most 65535 strands.');
ext = lower(char(ext));
ext = ext(1:min(4, numel(ext)));
assert(all(double(ext) <= 127), 'Extension must be ASCII.');
ext(end + 1:4) = ' ';
header = uint8([1 type be(L, 4) be(dnas_crc32(bytes), 4) ...
    be(D, 2) logical(whiten) double(ext)]);
rows = repmat(c.PAD, N, 17);
rows(1,:) = header;
for row = 2:D
    start = (row - 2)*17 + 1;
    count = min(17, max(0, L - start + 1));
    rows(row, 1:count) = column_data(start:start + count - 1);
    if whiten, rows(row,:) = dnas_whiten(rows(row,:), row); end
end
% 원본 xor_A · xor_B · xor_data: 앞/뒤 절반 행을 byte별 XOR한다.
xor_A = rows(1:H,:); xor_B = rows(H + 1:D,:);
xor_data = bitxor(xor_A, xor_B);
rows(D + 1:N,:) = xor_data;
oligos = repmat(struct('index', 0, 'role', '', 'seq', ''), 1, N);
for index = 1:N
    nrsin = [rows(index,:) uint8(be(index, 2))];
    bin_payload = dnas_rs_encode(nrsin);
    DNA_library = [F dnas_bytes_to_dna(bin_payload) R];
    role = 'data';
    if index == 1, role = 'header'; end
    if index > D, role = 'xor'; end
    oligos(index) = struct('index', index, 'role', role, ...
        'seq', DNA_library);
end
end

function bytes = be(value, count)
% 원본 index 및 KIS metadata를 고정 big-endian byte로 만든다.
bytes = mod(floor(double(value) ./ 256.^(count - 1:-1:0)), 256);
end
