% 이름 → DNA 인코딩 ①②③ · 디코딩 ④ · FASTA ⑤ · 확장 ① 1 bit/nt
% 분자정보공학 3-2강 인코딩 실습 · 슬라이드 18, 19, 21의 코드

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

%% ---- 슬라이드 21 · 확장 ① 1 bit/nt ----
dna1 = blanks(length(bits));
for i = 1:length(bits)
    if bits(i) == '0'
        if mod(i,2)==1, dna1(i)='A'; else, dna1(i)='C'; end
    else
        if mod(i,2)==1, dna1(i)='G'; else, dna1(i)='T'; end
    end
end
disp(dna1)
