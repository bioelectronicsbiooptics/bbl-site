%% Lab 6 — GF(8) 을 직접 만든다 (툴박스 불필요)
prim = 11;                        % x^3+x+1 = 1011(2)
a = 1;  tab = zeros(1,7);
for i = 0:6
    tab(i+1) = a;                 % alpha^i
    a = bitshift(a, 1);           % x 를 곱한다
    if a >= 8                     % x^3 이 생기면
        a = bitxor(a, prim);      % x^3 = x + 1 로 바꾼다
    end
end
for i = 0:6
    fprintf('alpha^%d = %s\n', i, dec2bin(tab(i+1),3));
end
e = mod(4+5, 7);                  % alpha^4*alpha^5
fprintf('a^4*a^5 = a^%d = %s\n', e, dec2bin(tab(e+1),3));
%% (Communications Toolbox) 같은 계산
al = gf(2, 3);                    % alpha in GF(2^3)
p  = al^4 * al^5;  s = al^4 + al^5;
fprintf('gf: product=%d sum=%d\n', p.x, s.x);
