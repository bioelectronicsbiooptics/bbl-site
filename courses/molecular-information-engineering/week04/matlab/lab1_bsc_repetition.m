%% Lab 1 — BSC 채널과 3회 반복 부호 (툴박스 불필요)
p = 0.01;  N = 1e6;              % 오류 확률, 보낼 bit 수
u = randi([0 1], 1, N);          % message
c = repmat(u, 3, 1);             % codeword: 각 bit 를 3번 (3 x N)
e = rand(3, N) < p;              % BSC: 확률 p 로 뒤집힘
r = xor(c, e);                   % received word
u_hat = sum(r, 1) >= 2;          % 다수결 복호
fprintf('부호 없이  : 오류율 %.5f\n', mean(rand(1,N) < p));
fprintf('3회 반복   : 오류율 %.6f\n', mean(u_hat ~= u));
fprintf('이론 3p^2-2p^3 = %.6f\n', 3*p^2 - 2*p^3);
