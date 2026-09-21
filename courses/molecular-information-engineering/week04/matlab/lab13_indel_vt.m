%% Lab 13 — 자리가 밀리는 오류와 VT 부호 (툴박스 불필요)
a = 'ACGTACGTAC';
b = a;  b(4) = [];                % 4번 염기 삭제
b(end+1) = 'A';                   % 길이만 맞춰 비교
fprintf('Hamming %d칸 vs edit distance %d\n', ...
        sum(a ~= b), editdist(a, b));

%% VT0(6): sum(i * x_i) mod 7 == 0 인 단어들
n = 6;
X = dec2bin(0:2^n-1) - '0';
C = X(mod(X*(1:n)', n+1) == 0, :);
fprintf('VT0(%d) codeword %d개\n', n, size(C, 1));
ok = 0;  tot = 0;
for i = 1:size(C, 1)
    for p = 1:n                   % 모든 자리를 하나씩 삭제
        y = C(i,:);  y(p) = [];
        ok = ok + isequal(vtdecode(y, n), C(i,:));
        tot = tot + 1;
    end
end
fprintf('단일 삭제 복원 %d / %d\n', ok, tot);

function d = editdist(a, b)       % Levenshtein 거리 (DP 표)
D = zeros(numel(a)+1, numel(b)+1);
D(:,1) = 0:numel(a);  D(1,:) = 0:numel(b);
for i = 2:numel(a)+1
    for j = 2:numel(b)+1
        D(i,j) = min([D(i-1,j)+1, D(i,j-1)+1, ...
                      D(i-1,j-1) + (a(i-1) ~= b(j-1))]);
    end
end
d = D(end, end);
end

function x = vtdecode(y, n)       % VT0(n) 단일 삭제 복호
w = sum(y);                       % 남은 1의 수
D = mod(-sum((1:n-1) .* y), n+1); % 모자란 checksum
if D <= w                         % 지워진 것은 0
    r = [cumsum(y, 'reverse') 0]; % 그 자리 오른쪽 1의 수
    p = find(r == D, 1);  ins = 0;
else                              % 지워진 것은 1
    l = [0 cumsum(1 - y)];        % 그 자리 왼쪽 0의 수
    p = find(l == D - w - 1, 1);  ins = 1;
end
x = [y(1:p-1) ins y(p:end)];
end
