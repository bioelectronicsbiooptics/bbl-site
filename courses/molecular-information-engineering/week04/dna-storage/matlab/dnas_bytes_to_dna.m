function seq = dnas_bytes_to_dna(bytes)
% 원본 bin_payload → DNA: byte 안에서는 MSB부터 2 bit씩 읽는다.
bases = 'ATGC';
b = double(reshape(bytes, 1, []));
v = zeros(4, numel(b));
for k = 1:4
    v(k,:) = mod(floor(b / 2^(8 - 2*k)), 4);
end
seq = bases(reshape(v, 1, []) + 1);
end
