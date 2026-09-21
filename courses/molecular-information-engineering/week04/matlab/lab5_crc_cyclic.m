%% Lab 5 — 다항식 나눗셈(CRC)과 순환 부호
g = [1 0 1 1];                    % g(x) = x^3 + x + 1
m = [1 1 0 1];                    % message
w = [m 0 0 0];                    % m(x) * x^3
for i = 1:numel(m)                % mod 2 긴 나눗셈
    if w(i), w(i:i+3) = xor(w(i:i+3), g); end
end
c = [m w(5:7)];                   % message + 나머지
fprintf('나머지=%s  codeword=%s\n', ...
        num2str(w(5:7),'%d'), num2str(c,'%d'));
for s = 1:3                       % 돌려도 codeword 인가?
    cs = circshift(c, s);  t = cs;
    for i = 1:4
        if t(i), t(i:i+3) = xor(t(i:i+3), g); end
    end
    fprintf('shift %d: %s  나머지=%s\n', s, ...
            num2str(cs,'%d'), num2str(t(5:7),'%d'));
end
%% (Communications Toolbox) 가능한 generator polynomial
% 계수는 낮은 차수부터: [1 1 0 1] = 1 + x + x^3
disp(cyclpoly(7, 4, 'all'))
