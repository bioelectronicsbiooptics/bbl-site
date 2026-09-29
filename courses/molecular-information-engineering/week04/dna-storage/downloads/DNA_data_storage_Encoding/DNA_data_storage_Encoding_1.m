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
