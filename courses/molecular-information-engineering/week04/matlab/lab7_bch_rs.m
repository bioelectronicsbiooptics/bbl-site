%% Lab 7 — BCH 와 Reed-Solomon (Communications Toolbox)
g = bchgenpoly(15, 7);            % BCH(15,7), t = 2
disp(double(g.x))                 % g(x) 계수, 높은 차수부터
msg  = gf([1 0 1 1 0 0 1]);
code = bchenc(msg, 15, 7);
rx   = code;
rx([3 11]) = rx([3 11]) + 1;      % bit 2개 오류
[dec, nerr] = bchdec(rx, 15, 7);
fprintf('BCH: 정정 %d개, 일치 %d\n', nerr, isequal(dec, msg));

m = 3;  n = 7;  k = 3;            % RS(7,3) over GF(8)
disp(rsgenpoly(n, k))             % generator polynomial
msg  = gf([1 5 3], m);            % 기호 3개 (0~7)
code = rsenc(msg, n, k);
rx   = code;                      % 기호 2개 오류
rx(2) = rx(2) + gf(6, m);
rx(6) = rx(6) + gf(1, m);
[dec, nerr] = rsdec(rx, n, k);
fprintf('RS : code=%s 정정 %d개 복원=%s\n', ...
    num2str(code.x), nerr, num2str(dec.x));
