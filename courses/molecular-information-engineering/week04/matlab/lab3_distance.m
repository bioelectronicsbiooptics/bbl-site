%% Lab 3 — Hamming distance 와 최소거리 (툴박스 불필요)
x = [1 0 1 1 0 1 0];  y = [1 0 0 1 1 1 0];
d = sum(x ~= y);                     % 다른 자리 수
fprintf('d(x,y) = %d,  wt(x xor y) = %d\n', d, sum(xor(x,y)));

C = [0 0 0; 0 1 1; 1 1 0; 1 0 1];    % codeword 를 행으로
dmin = inf;
for i = 1:size(C,1)-1
    for j = i+1:size(C,1)
        dmin = min(dmin, sum(C(i,:) ~= C(j,:)));
    end
end
t = floor((dmin-1)/2);               % 정정 개수
fprintf('d_min = %d → 검출 %d개, 정정 %d개\n', dmin, dmin-1, t);
