function value = dnas_crc32(bytes)
% 파일 무결성 검사: IEEE CRC-32를 사용한다.
persistent table
if isempty(table)
    table = zeros(1, 256, 'uint32');
    for n = 0:255
        x = uint32(n);
        for j = 1:8
            if bitand(x, uint32(1))
                x = bitxor(bitshift(x, -1), uint32(hex2dec('EDB88320')));
            else
                x = bitshift(x, -1);
            end
        end
        table(n + 1) = x;
    end
end
x = uint32(hex2dec('FFFFFFFF'));
for b = reshape(uint8(bytes), 1, [])
    j = double(bitand(bitxor(x, uint32(b)), uint32(255))) + 1;
    x = bitxor(bitshift(x, -8), table(j));
end
value = double(bitxor(x, uint32(hex2dec('FFFFFFFF'))));
end
