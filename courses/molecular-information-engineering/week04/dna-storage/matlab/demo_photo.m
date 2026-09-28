%% DNAS-1 사진 실습 — Ctrl+Enter로 섹션별 실행
% 원본 STL_Encode의 column_data에 축소 JPEG byte를 넣는다.
folder = fileparts(mfilename('fullpath'));
addpath(folder);
outFolder = fullfile(folder, 'output');
if ~isfolder(outFolder), mkdir(outFolder); end

%% 1 사진 입력 · 정수 간격 축소
photoFile = fullfile(folder, '..', 'samples', 'sample_photo.jpg');
maxSide = 64; quality = 60; gray = false;
[column_data, smallPhoto] = ...
    dnas_image_bytes(photoFile, maxSide, quality, gray);
fprintf('축소 사진 %d × %d · JPEG %d byte\n', ...
    size(smallPhoto, 2), size(smallPhoto, 1), numel(column_data));
figure('Name', 'DNAS-1 입력 사진');
image(smallPhoto); axis image off;
if gray, colormap(gray_map()); end

%% 2 헤더 · XOR · RS · DNA
whiten = true;                      % false와 비교하기
oligos = dnas_encode(column_data, 'image', 'jpg', whiten);
DNA_library = {oligos.seq};          % 원본 DNA_library: 사진 풀
fprintf('가닥 %d개 · 총 %d nt\n', ...
    numel(oligos), sum(cellfun(@numel, DNA_library)));
dnas_write_fasta(fullfile(outFolder, 'photo.fasta'), oligos);

%% 3 파일 byte 복원 · CRC 검사
[data, hdr, rep] = dnas_decode(DNA_library);
assert(rep.crc_ok && isequal(data, column_data));
restoredFile = fullfile(outFolder, 'restored_photo.jpg');
fid = fopen(restoredFile, 'wb');
fwrite(fid, data, 'uint8'); fclose(fid);
fprintf('CRC 일치 %d · SHA-256 %s\n', rep.crc_ok, rep.sha256);

%% 4 복원 사진 표시
figure('Name', 'DNAS-1 복원 사진');
image(imread(restoredFile)); axis image off;
if gray, colormap(gray_map()); end

function map = gray_map()
% 원본 사진 표시 대응: 툴박스 없이 회색 colormap을 만든다.
map = repmat((0:255)' / 255, 1, 3);
end
