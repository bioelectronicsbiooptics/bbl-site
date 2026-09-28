%% DNAS-1 전체 실습 실행
% 원본 Encoding · Decoding 예제를 한 번에 실행한다.
folder = fileparts(mfilename('fullpath'));
addpath(folder);

%% 이름: UTF-8 · XOR · RS · DNA
demo_name;

%% 사진: JPEG · 부호화 · 복원
demo_photo;

%% 채널: 오류 · 소실 · 단계별 복호
demo_decode;

%% 직접 구현 검산
results = test_vectors();
disp(results);
