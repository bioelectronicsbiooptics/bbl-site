function row = dnas_whiten(row, index)
% 원본의 반복 무늬를 비교하는 선택 확장: 같은 XOR로 해제한다.
x = double(index);
mask = zeros(1, numel(row), 'uint8');
for k = 1:numel(row)
    x = mod(1664525*x + 1013904223, 2^32);
    mask(k) = uint8(floor(x / 2^24));
end
row = bitxor(uint8(row), mask);
end
