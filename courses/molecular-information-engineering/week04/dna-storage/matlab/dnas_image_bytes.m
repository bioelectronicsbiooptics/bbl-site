function [bytes, image] = dnas_image_bytes(file, maxSide, quality, gray)
% 원본 column_data 입력 단계: 정수 간격 축소 후 JPEG byte로 읽는다.
if nargin < 2, maxSide = 64; end
if nargin < 3, quality = 60; end
if nargin < 4, gray = false; end
assert(maxSide >= 1 && maxSide == floor(maxSide));
assert(quality >= 0 && quality <= 100);
[image, map] = imread(file);
if ~isempty(map)
    idx = double(image) + 1;
    if isfloat(image), idx = double(image); end
    rgb = reshape(map(idx(:), :), [size(image) 3]);
    image = uint8(round(255 * rgb));
end
step = max(1, ceil(max(size(image, 1), size(image, 2)) / maxSide));
image = image(1:step:end, 1:step:end, :);
if size(image, 3) > 3, image = image(:,:,1:3); end
if gray && size(image, 3) == 3
    image = uint8(0.299*double(image(:,:,1)) + ...
        0.587*double(image(:,:,2)) + 0.114*double(image(:,:,3)));
end
folder = fileparts(mfilename('fullpath'));
file = [tempname(folder) '.jpg'];
clean = onCleanup(@() delete(file));
imwrite(image, file, 'jpg', 'Quality', quality);
fid = fopen(file, 'rb');
assert(fid >= 0, 'Cannot open JPEG.');
bytes = fread(fid, Inf, '*uint8')';
fclose(fid);
end
