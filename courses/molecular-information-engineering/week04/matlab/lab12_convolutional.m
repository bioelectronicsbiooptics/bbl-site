%% Lab 12 — convolutional 부호 (7,5) 와 Viterbi
u = [1 0 1 1 0 0];                % message 1011 + 꼬리 00
s = [0 0];                        % 상태 = 직전 두 bit
c = [];
for t = 1:numel(u)
    o1 = mod(u(t) + s(1) + s(2), 2);   % 생성기 7 = 111
    o2 = mod(u(t) + s(2), 2);          % 생성기 5 = 101
    c  = [c o1 o2];
    s  = [u(t) s(1)];             % 기억을 한 칸 민다
end
fprintf('손 부호기: %s\n', num2str(c, '%d'));

%% (Communications Toolbox) 같은 부호와 Viterbi 복호
tr = poly2trellis(3, [7 5]);      % 기억 3칸, 생성기 7, 5
c2 = convenc(u, tr);
fprintf('convenc 와 같은가: %d\n', isequal(c, c2));
r  = c2;  r([2 9]) = ~r([2 9]);   % bit 2개 오류
d  = vitdec(r, tr, 5, 'term', 'hard');
fprintf('받은 %s\n', num2str(r, '%d'));
fprintf('복호 %s\n', num2str(d(1:4), '%d'));
