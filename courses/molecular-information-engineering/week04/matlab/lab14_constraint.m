%% Lab 14 — homopolymer 제약의 용량 (툴박스 불필요)
for r = 1:5                       % 같은 염기 최대 r 개 연속
    T = zeros(r);                 % 상태 = 지금 run 길이
    T(:, 1) = 3;                  % 다른 염기 3개 → run 1
    for k = 1:r-1
        T(k, k+1) = 1;            % 같은 염기 → run + 1
    end
    lam = max(abs(eig(T)));       % 가짓수가 늘어나는 비율
    fprintf('run <= %d : %.3f bit/nt\n', r, log2(lam));
end

%% 무작위 150 nt 가 제약을 통과할 확률
N = 1e4;  ok = 0;
for i = 1:N
    s = randi(4, 1, 150);         % 1 A, 2 T, 3 G, 4 C
    runs = diff([0 find(diff(s) ~= 0) 150]);
    gc = mean(s >= 3);
    ok = ok + (max(runs) <= 3 && gc >= 0.4 && gc <= 0.6);
end
fprintf('run<=3, GC 40-60%% 통과율 %.1f%%\n', 100*ok/N);
