%% DNAS-1 채널 · 복호 실습 — Ctrl+Enter로 섹션별 실행
% 원본 STL_Decode 순서: 방향 · PrimerSort · RS · XOR · 파일.
folder = fileparts(mfilename('fullpath'));
addpath(folder);
outFolder = fullfile(folder, 'output');
if ~isfolder(outFolder), mkdir(outFolder); end

%% 1 파일 대신 문장을 부호화
column_data = dnas_text_bytes('Hello, DNA! 안녕 · 송영준');
oligos = dnas_encode(column_data, 'text', 'txt');
DNA_library = {oligos.seq};

%% 2 채널 — 1번 헤더 가닥을 강제로 소실
opts = struct('seed', 7, 'coverage', 10, 'p_drop', 0, ...
    'p_sub', 0.01, 'p_ins', 0.002, 'p_del', 0.002, ...
    'p_rc', 0.5, 'drop', 1, 'shuffle', true);
reads = dnas_simulate(DNA_library, opts);
fprintf('원래 %d가닥 → 채널 read %d개\n', ...
    numel(oligos), numel(reads));
fastqFile = fullfile(outFolder, 'reads.fastq');
fid = fopen(fastqFile, 'wb');
fwrite(fid, dnas_to_fastq(reads), 'char'); fclose(fid);

%% 3 FASTQ 불러오기 · 단계별 복호 보고
reads = dnas_read_seqs(fastqFile);
[data, hdr, rep] = dnas_decode(reads);
disp(rep);
fprintf('복원: %s\n', native2unicode(data, 'UTF-8'));
fprintf('CRC 일치: %d · XOR 복원: %d행\n', rep.crc_ok, rep.xor);

%% 4 같은 XOR 묶음에서 2가닥 소실 — 한계 확인
D = 2*numel(oligos)/3; H = D/2;
keep = setdiff(1:numel(oligos), [2 2 + H]);
[partial, partialHeader, partialReport] = ...
    dnas_decode(DNA_library(keep));
fprintf('2가닥 소실: CRC 일치 %d · 없는 행 ', partialReport.crc_ok);
fprintf('%d ', partialReport.missing); fprintf('\n');
% 부분 복원 byte도 반환한다. 빈 행을 숨겨 성공으로 보고하지 않는다.
