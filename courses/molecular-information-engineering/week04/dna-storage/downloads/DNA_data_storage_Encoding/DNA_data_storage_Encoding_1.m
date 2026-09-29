%% DNA data storage Encoding — 누적 실습 checkpoint 1
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

