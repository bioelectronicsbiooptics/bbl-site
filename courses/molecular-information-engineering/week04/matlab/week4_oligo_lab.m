%% 4주차 3강 실습 — 영문 → 150 nt 올리고 3가닥
% 가닥 = F(21) + 인덱스(4) + 데이터(88) + RS 검사(16) + rc(R)(21)
% 바꿀 곳은 msg 한 줄 · Ctrl+Enter = 섹션 하나 실행
% 오류정정: inner = 가닥 안 RS(27,23) · outer = 가닥 간 XOR
% RS 부호화(rsenc · rsdec · gf) = Communications Toolbox

%% 1 입력 — 단어만 바꾸는 곳
msg = 'HELLO DNA STORAGE FROM INU';  % ← 영문 (44자 이하)
F = 'TGCGTGTCTATTCGGCTATGG';          % Forward 프라이머 21 nt
R = 'GCTCTGAACGAGGATGAACTG';          % Reverse 프라이머 21 nt
L = 22;                               % 가닥당 데이터 22 byte
assert(numel(msg) <= 2*L, '44자 이하로 입력')
bytes = double(msg);
bytes(end+1:2*L) = 32;                % 44 byte까지 공백(32)
data = reshape(bytes, L, 2)';         % 2줄 × 22 byte
disp(char(data))

%% 2 프라이머 확인 — GC · Tm · 역상보
Tm = @(p) 2*sum(p=='A'|p=='T') + 4*sum(p=='G'|p=='C');
fprintf('F     %s  GC %.1f%%  Tm %d C\n', ...
    F, 100*mean(F=='G'|F=='C'), Tm(F))
fprintf('R     %s  GC %.1f%%  Tm %d C\n', ...
    R, 100*mean(R=='G'|R=='C'), Tm(R))
fprintf('rc(R) %s  ← 올리고 3′ 끝에 붙는 서열\n', rc(R))

%% 3 방법 A — 2줄: F + 인덱스 + 데이터 + rc(R) (ECC 없음)
oligoA = strings(2, 1);
for i = 1:2
    oligoA(i) = [F b2dna([i data(i,:)]) rc(R)];
end
report('A', oligoA)

%% 4 방법 B — 2줄에 RS(27,23) 추가 → 150 nt
n = 27; k = 23;                       % 검사 4 byte = 기호 2개 정정
oligoB = strings(2, 1);
for i = 1:2
    cw = rsenc(gf([i data(i,:)], 8), n, k);
    oligoB(i) = [F b2dna(double(cw.x)) rc(R)];
end
report('B', oligoB)

%% 5 방법 C — 스크램블(XOR 마스크) 후 RS → GC · 반복 개선
rng(4); mask = randi([0 255], 1, L);  % 같은 seed → 같은 마스크
sdata = bitxor(data, mask);           % 줄마다 같은 마스크
oligoC = strings(2, 1);
for i = 1:2
    cw = rsenc(gf([i sdata(i,:)], 8), n, k);
    oligoC(i) = [F b2dna(double(cw.x)) rc(R)];
end
report('C', oligoC)

%% 6 3줄 — 3번째 줄 = 1줄 XOR 2줄
D = [sdata; bitxor(sdata(1,:), sdata(2,:))];   % 3 × 22
oligo = strings(3, 1);
for i = 1:3
    cw = rsenc(gf([i D(i,:)], 8), n, k);
    oligo(i) = [F b2dna(double(cw.x)) rc(R)];
end
report('3줄', oligo)

%% 7 FASTA로 저장
fid = fopen('oligos.fasta', 'w');
for i = 1:3
    fprintf(fid, '>oligo_%d len=%d\n%s\n', ...
        i, strlength(oligo(i)), oligo(i));
end
fclose(fid);
type oligos.fasta

%% 8 치환 오류 3개 주입 → RS 복원
rx = char(oligo(1));
pos = [40 41 90];                     % 기호 2개(byte 5 · 18)에 걸침
c = 'TGCA'; [~, v] = ismember(rx(pos), 'ACGT');
rx(pos) = c(v);                       % 상보 염기로 바꿔 넣기
[idx, d1, nerr] = readOligo(rx, n, k);
fprintf('인덱스 %d · 고친 기호 %d개 · 원래와 같음 %d\n', ...
    idx, nerr, isequal(d1, D(1,:)))

%% 9 2번 가닥 손실 → XOR로 복원
[~, d1] = readOligo(oligo(1), n, k);
[~, d3] = readOligo(oligo(3), n, k);
d2 = bitxor(d1, d3);                  % 2줄 = 1줄 XOR 3줄
fprintf('2줄 복원: %d\n', isequal(d2, D(2,:)))

%% 10 전체 복호 — 스크램블 해제 → 원문
out = bitxor([d1; d2], mask);
txt = strtrim(char(reshape(out', 1, [])));
fprintf('복원 문장: %s\n일치: %d\n', txt, strcmp(txt, msg))

%% 함수
function s = b2dna(b)                 % byte 열 → 염기 (2 bit/nt)
    bits = dec2bin(b, 8)';            % 8 × byte 수
    pairs = reshape(bits(:), 2, [])'; % 2 bit씩
    map = 'ACGT';                 % 00 A · 01 C · 10 G · 11 T
    s = map(bin2dec(pairs)' + 1);
end

function b = dna2b(s)                 % 염기 → byte 열
    [~, v] = ismember(s, 'ACGT');
    bits = dec2bin(v - 1, 2)';
    b = bin2dec(reshape(bits(:), 8, [])')';
end

function r = rc(s)                    % 역상보 (reverse complement)
    c = 'TGCA';
    [~, v] = ismember(s, 'ACGT');
    r = fliplr(c(v));
end

function [idx, d, nerr] = readOligo(s, n, k)
    s = char(s);
    b = dna2b(s(22:end-21));          % 프라이머 21 nt씩 제거
    [m, nerr] = rsdec(gf(b, 8), n, k);
    m = double(m.x);
    idx = m(1); d = m(2:end);
end

function report(tag, olig)            % 길이 · GC% · 최대 반복
    for i = 1:numel(olig)
        s = char(olig(i));
        run = max(diff([0 find(diff(double(s))) numel(s)]));
        fprintf('%s-%d  %3d nt  GC %4.1f%%  최대 반복 %d\n', ...
            tag, i, numel(s), 100*mean(s=='G'|s=='C'), run)
    end
end
