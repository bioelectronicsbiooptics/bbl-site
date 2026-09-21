%% Lab 8 — BSC 용량 C = 1 - H(p) (툴박스 불필요)
Hb = @(p) -p.*log2(p) - (1-p).*log2(1-p);
p  = [0.001 0.01 0.05 0.1 0.2];
C  = 1 - Hb(p);
disp([p; Hb(p); C]')              % 열: p, H(p), C
pp = linspace(0.001, 0.5, 200);
plot(pp, 1 - Hb(pp), 'LineWidth', 2);  grid on
xlabel('p');  ylabel('C (bit / 사용)');
yline(4/7, '--', 'Hamming R = 4/7');
