%% Lab 9 — XOR 패리티로 사라진 가닥 되살리기 (툴박스 불필요)
A = double('SONG');  B = double('KIM!');
C = bitxor(A, B);                 % 패리티 가닥 C = A xor B
fprintf('C = %s (hex)\n', strjoin(string(dec2hex(C,2)), ' '));
B2 = bitxor(A, C);                % B 가 사라짐 → A xor C
fprintf('복원된 B = %s\n', char(B2));

%% 가닥 4개 + 패리티 1개 (RAID 5 와 같은 원리)
D = randi([0 255], 4, 8);         % 가닥 4개 x 8 byte
P = bitxor(bitxor(D(1,:), D(2,:)), bitxor(D(3,:), D(4,:)));
lost = 3;                         % 3번 가닥이 안 읽혔다
R = P;
for i = setdiff(1:4, lost)
    R = bitxor(R, D(i,:));        % 남은 것을 모두 XOR
end
fprintf('%d번 가닥 복원: %d\n', lost, isequal(R, D(lost,:)));
