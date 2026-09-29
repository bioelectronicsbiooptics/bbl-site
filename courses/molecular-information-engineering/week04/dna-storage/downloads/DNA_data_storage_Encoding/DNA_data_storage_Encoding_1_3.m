%% DNA data storage Encoding — 누적 실습 checkpoint 1-3
% 이 파일은 앞 단계 코드를 누적한 실행본입니다. 각 파일을 별도로 실행해 현재 단계까지 확인하세요.
% 이후 파일은 앞 단계에 해당하는 모든 코드와 검증을 포함합니다.
clear; clc;
%% 0. 설정 — 여기만 바꿔 실행
inputMode = 'text';             % 'text' | 'image' | 'file'
textInput = '송영준 DNA';         % inputMode='text'일 때 입력 문자열
inputFile = '';                 % 비우면 파일 선택창 (image / file)
outFasta = 'dnas_out.fasta';
outSequencesTxt = 'dnas_sequences.txt'; % plain TXT: one 148 nt sequence per line
F = 'AGCCTTGTGTCCATCAATCC';     % forward primer (20 nt)
R = 'TGCGCTATGGTTTGGCTAAT';     % reverse primer (20 nt)

%% 1. 입력을 byte로 읽기
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
fprintf('Block 1 HEX bytes:'); fprintf(' %02X', dataBytes); fprintf('\n');

%% 2. 데이터를 17 byte씩 자르고 마지막 행을 PAD(0x1B)로 채우기
PAD = uint8(27); ROW_BYTES = 17; NSYM = 8;
% 헤더 없는 포맷이므로 사용자가 decoder에 L과 D를 알려 줍니다.
% 데이터 행 D는 짝수로 올림: 앞 절반과 뒤 절반을 XOR합니다.
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

%% 3. 바깥 XOR 행을 덧붙이기: XOR(data row j, data row j+H)
% XOR 행의 고정 위치는 D+j (j=1..H)입니다.
for j = 1:H
    rows(D + j, :) = bitxor(rows(j, :), rows(j + H, :));
end
assert(isequal(rows(D+1:end, :), bitxor(rows(1:H, :), rows(H+1:D, :))), 'Block 3 XOR 검증 실패');
fprintf('Block 3 PASS | XOR parity rows = %d\n', H);

