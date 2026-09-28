%% DNAS-1 이름 실습 — Ctrl+Enter로 섹션별 실행
% 이름(UTF-8 byte)을 DNA 가닥으로 부호화한다.
folder = fileparts(mfilename('fullpath'));
addpath(folder);
outFolder = fullfile(folder, 'output');
if ~isfolder(outFolder), mkdir(outFolder); end

%% 1 이름 → UTF-8 byte
name = '송영준';                      % 자기 이름으로 바꾸기
column_data = dnas_text_bytes(name);  % 원본 column_data: 입력 byte 열
fprintf('이름: %s · UTF-8 %d byte\n', name, numel(column_data));
fprintf('ASCII만 사용: %d\n', all(double(name) < 128));
k = 1;
while k <= numel(name)
    cp = double(name(k)); count = 1;
    if cp >= 55296 && cp <= 56319 && k < numel(name)
        low = double(name(k + 1));
        if low >= 56320 && low <= 57343
            cp = 65536 + (cp - 55296)*1024 + low - 56320;
            count = 2;              % UTF-16 surrogate 쌍 = 한 코드포인트
        end
    end
    letter = name(k:k + count - 1);
    fprintf('%s  U+%04X  ', letter, cp);
    fprintf('%02X ', dnas_text_bytes(letter));
    fprintf('\n');
    k = k + count;
end

%% 2 헤더 · 행 나누기 · XOR
c = dnas_constants();
F_primers = c.F; R_primers = c.R;    % 원본 primerSelect의 프라이머
oligos = dnas_encode(column_data, 'text', 'txt', false, ...
    F_primers, R_primers);
N = numel(oligos); D = 2*N/3; H = D/2;
rows = zeros(N, 17, 'uint8');
for k = 1:N
    codeword = dnas_dna_to_bytes(oligos(k).seq(21:128));
    rows(k,:) = codeword(1:17);
end
xor_A = rows(1:H,:);                % 원본 xor_A: 앞 절반 행
xor_B = rows(H + 1:D,:);            % 원본 xor_B: 뒤 절반 행
xor_data = bitxor(xor_A, xor_B);     % 원본 xor_data: XOR 보호 행
assert(isequal(xor_data, rows(D + 1:N,:)));
disp(rows);

%% 3 RS(27,19) — 심볼 하나 = byte 하나
index = 1;
nrsin = [rows(index,:) uint8([0 index])]; % 원본 nrsin: 행 + index
codeword = dnas_rs_encode(nrsin);
bin_payload = dec2bin(codeword, 8);       % 원본 bin_payload 대응 bit
fprintf('메시지 19 byte + RS 패리티 8 byte\n');
disp(double(codeword));
disp(bin_payload);

%% 4 DNA · FASTA
DNA_library = {oligos.seq};          % 원본 DNA_library: 완성 가닥
fprintf('가닥 %d개 · 가닥당 %d nt\n', N, numel(DNA_library{1}));
disp(dnas_to_fasta(oligos));
dnas_write_fasta(fullfile(outFolder, 'name.fasta'), oligos);

%% 5 오류 없는 복호
[data, hdr, rep] = dnas_decode(DNA_library);
fprintf('복원: %s · CRC 일치: %d\n', ...
    native2unicode(data, 'UTF-8'), rep.crc_ok);
assert(isequal(data, column_data));
