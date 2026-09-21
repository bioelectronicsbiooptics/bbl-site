%% Lab 10 — LT(fountain) 부호: droplet 몇 개면 되나? (툴박스 불필요)
% 값 대신 "그 조각을 알아냈는가"만 추적해 필요한 droplet 수를 센다
for K = [20 100]                  % 원본 조각 수
    c = 0.1;  delta = 0.5;        % robust soliton 모수
    d = 2:K;
    rho = [1/K, 1./(d.*(d-1))];   % ideal soliton
    R = c*log(K/delta)*sqrt(K);  s = floor(K/R);
    tau = zeros(1, K);
    tau(1:s-1) = R./((1:s-1)*K);
    tau(s) = R*log(R/delta)/K;
    cdf = cumsum((rho+tau) / sum(rho+tau));
    need = zeros(1, 30);
    for trial = 1:30
        known = false(1, K);  eqs = {};
        while ~all(known)
            deg = find(rand <= cdf, 1);
            eqs{end+1} = randperm(K, deg);   % droplet 하나
            changed = true;                  % peeling 복호
            while changed
                changed = false;
                for e = 1:numel(eqs)
                    u = eqs{e}(~known(eqs{e}));
                    if numel(u) == 1
                        known(u) = true;  changed = true;
                    end
                end
            end
        end
        need(trial) = numel(eqs);
    end
    fprintf('K=%3d: 평균 %.1f개 필요 (여분 %.0f%%)\n', ...
            K, mean(need), 100*(mean(need)/K - 1));
end
