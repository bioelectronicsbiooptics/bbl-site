%% Lab 4b — 같은 일을 Communications Toolbox 로
[H, G, n, k] = hammgen(3);        % Hamming(7,4) 의 H, G
disp(H); disp(G);                 % [검사 | message] 순서
msg  = [1 0 1 1];
code = encode(msg, n, k, 'hamming/binary');
recd = code;  recd(5) = ~recd(5); % 1 bit 오류
[dec, err] = decode(recd, n, k, 'hamming/binary');
fprintf('code=%s 복원=%s 정정=%d\n', ...
        num2str(code,'%d'), num2str(dec,'%d'), err);

trt = syndtable(H);               % 신드롬 → 오류 패턴 표
s   = rem(recd*H', 2);            % 신드롬
e   = trt(1 + bit2int(s', 3), :); % 표에서 찾기
fprintf('s=%s → e=%s\n', num2str(s,'%d'), num2str(e,'%d'));
