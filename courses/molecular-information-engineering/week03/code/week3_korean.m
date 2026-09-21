% 확장 ② 한글 이름 (UTF-8 3 byte) — %% 1–5 뒤에 실행
% 분자정보공학 3-2강 인코딩 실습 · 슬라이드 18, 19, 22의 코드

%% ---- 슬라이드 18 · MATLAB 인코딩 ①②③ ----
%% 1: 이름 → 비트
name = 'SONG';                       % ← 자기 이름
bits = reshape(dec2bin(double(name), 8)', 1, []);
disp(bits); disp(length(bits))

%% 2: 비트 → DNA (2 bits/nt)
map = 'ACGT';                        % 00→A 01→C 10→G 11→T
pairs = reshape(bits, 2, [])';       % 16×2 문자 행렬
idx = bin2dec(pairs);                % 0..3
dna = map(idx + 1)                   % 1부터 세므로 +1

%% 3: GC% · 최대 호모폴리머
gc = sum(dna == 'G' | dna == 'C') / length(dna) * 100;
runs = diff([0, find(diff(double(dna)) ~= 0), length(dna)]);
maxrun = max(runs);
fprintf('GC=%.1f%%  maxrun=%d\n', gc, maxrun)

%% ---- 슬라이드 19 · MATLAB 디코딩 ④ · FASTA ⑤ ----
%% 4: DNA → 비트 → 이름 (디코딩)
[~, idx2] = ismember(dna, map);      % A→1 C→2 G→3 T→4
bits2 = reshape(dec2bin(idx2 - 1, 2)', 1, []);
text = char(bin2dec(reshape(bits2, 8, [])'))';
disp(text); disp(strcmp(text, name))

%% 5: FASTA 출력 · 파일 저장
fid = fopen('my_name.fasta', 'w');
fprintf(fid, '>%s_2bit len=%d GC=%.1f%% maxrun=%d\n%s\n', ...
        name, length(dna), gc, maxrun, dna);
fclose(fid);
type my_name.fasta                   % 파일 내용 확인
% MATLAB Drive에서 my_name.fasta 다운로드

%% ---- 슬라이드 22 · 확장 ② 한글 UTF-8 ----
name = '송영준';
raw = unicode2native(name, 'UTF-8');   % 1×9 uint8
bits = reshape(dec2bin(raw, 8)', 1, []);
pairs = reshape(bits, 2, [])';
dna = map(bin2dec(pairs) + 1);
disp([numel(raw) length(dna)])     % 9 36

% 디코딩
[~, idx2] = ismember(dna, map);      % 새 dna로 %% 4 다시
bits2 = reshape(dec2bin(idx2 - 1, 2)', 1, []);
b2 = uint8(bin2dec(reshape(bits2, 8, [])'))';
disp(native2unicode(b2, 'UTF-8'))
