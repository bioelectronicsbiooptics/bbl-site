%% Lab 4 — Hamming(7,4): c = uG, s = Hr' (툴박스 불필요)
G = [1 0 0 0 1 1 0; 0 1 0 0 1 0 1;
     0 0 1 0 0 1 1; 0 0 0 1 1 1 1];
H = [1 1 0 1 1 0 0; 1 0 1 1 0 1 0; 0 1 1 1 0 0 1];
u = [1 0 1 1];
c = mod(u*G, 2);                  % codeword 1011010
r = c;  r(5) = ~r(5);             % 5번 bit 오류
s = mod(H*r', 2)';                % syndrome
pos = find(all(H' == s, 2));      % s 와 같은 H 의 열
fprintf('c=%s s=%s → %d번 정정\n', ...
        num2str(c,'%d'), num2str(s,'%d'), pos);
r(pos) = ~r(pos);
fprintf('복원 u = %s\n', num2str(r(1:4),'%d'));

r2 = c;  r2([2 5]) = ~r2([2 5]);  % 2 bit 오류
s2 = mod(H*r2', 2)';
p2 = find(all(H' == s2, 2));
r2(p2) = ~r2(p2);                 % 엉뚱한 칸을 고친다
fprintf('2 bit 오류: s=%s → %d번 → u=%s (틀림)\n', ...
        num2str(s2,'%d'), p2, num2str(r2(1:4),'%d'));
