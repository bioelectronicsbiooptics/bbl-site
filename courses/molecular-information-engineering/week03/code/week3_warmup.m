% MATLAB 준비 · 실습 1 (MATLAB Online)
% 분자정보공학 3-2강 인코딩 실습 · 슬라이드 10, 11의 코드

%% ---- 슬라이드 10 · MATLAB Online 환경 설정 ----
disp('Hello, DNA')

x = 65;
disp([char(x) ' ' num2str(double('A')) ' ' dec2bin(x, 8)])

for c = 'DNA'
    fprintf('%s %d %s\n', c, double(c), dec2bin(double(c), 8));
end

%% ---- 슬라이드 11 · MATLAB 실습 1 ----
name = 'SONG';
for c = name
    fprintf('%s %d %s\n', c, double(c), dec2bin(double(c), 8));
end

bits = '';
for c = name
    bits = [bits dec2bin(double(c), 8)];
end
disp(bits); disp(length(bits))

% 같은 일을 한 줄로 (행렬 → 전치 → 한 줄)
bits = reshape(dec2bin(double(name), 8)', 1, []);
