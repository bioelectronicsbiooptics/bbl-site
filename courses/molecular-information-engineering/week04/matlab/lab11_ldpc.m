%% Lab 11 — LDPC bit-flipping (툴박스 불필요)
H = [1 1 0 1 0 0;                 % 검사식 3개, bit 6개
     0 1 1 0 1 0;
     1 0 1 0 0 1];
c = [0 0 1 0 1 1];                % codeword (H*c' = 0)
r = c;  r(3) = ~r(3);             % 3번 bit 오류
for it = 1:5
    s = mod(H*r', 2);             % 깨진 검사식 = 1
    if ~any(s), break, end
    cnt = s' * H;                 % bit 마다 깨진 검사식 수
    [~, b] = max(cnt);
    fprintf('반복 %d: 깨진 식 %s, bit %d 뒤집기\n', ...
            it, num2str(s','%d'), b);
    r(b) = ~r(b);
end
fprintf('복원 %s, 정답과 같음 %d\n', num2str(r,'%d'), isequal(r,c));

%% (Communications Toolbox) 긴 LDPC + soft 정보(LLR)
H2  = dvbsLDPCPCM('1/2');        % 32400 x 64800 희소 행렬
enc = ldpcEncoderConfig(H2);
dec = ldpcDecoderConfig(H2);
msg = randi([0 1], enc.NumInformationBits, 1);
cw  = ldpcEncode(msg, enc);
sg  = 0.8;                        % 잡음 크기
y   = (1 - 2*cw) + sg*randn(size(cw));   % 0 → +1, 1 → -1
llr = 2*y / sg^2;                 % 양수면 0 쪽
nerr = sum((llr < 0) ~= cw);     % hard 판정 오류
fprintf('복호 전 bit 오류 %d / %d\n', nerr, numel(cw));
out = ldpcDecode(llr, dec, 50);
fprintf('LDPC 후 bit 오류 %d\n', sum(out ~= msg));
