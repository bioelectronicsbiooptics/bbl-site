%% Lab 2 — 패리티와 2D 패리티 (툴박스 불필요)
u = [1 0 1 1];
c = [u mod(sum(u),2)];                 % 짝수 패리티 → 10111
r1 = c; r1(3) = ~r1(3);                % 1 bit 오류
r2 = c; r2([1 2]) = ~r2([1 2]);        % 2 bit 오류
fprintf('c=%s  검사(오류없음)=%d\n', num2str(c,'%d'), mod(sum(c),2));
fprintf('1 bit 오류: 검사=%d (검출)\n', mod(sum(r1),2));
fprintf('2 bit 오류: 검사=%d (놓침!)\n', mod(sum(r2),2));

U = [0 1; 1 0];                        % 2x2 message
B = [U mod(sum(U,2),2)];               % 행 패리티
B = [B; mod(sum(B,1),2)];              % 열 패리티 → 3x3
R = B; R(2,1) = ~R(2,1);               % (2,1) 한 칸 오류
row = find(mod(sum(R,2),2));  col = find(mod(sum(R,1),2));
fprintf('오류 좌표 = (%d,%d)\n', row, col);
R(row,col) = ~R(row,col);  disp(isequal(R,B))   % 1 이면 정정 성공
