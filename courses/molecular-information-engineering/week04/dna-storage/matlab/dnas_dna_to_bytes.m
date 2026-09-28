function bytes = dnas_dna_to_bytes(seq)
% 원본 Binarization: 모르는 염기(N 등)는 A(00)로 읽는다.
seq = char(seq);
assert(mod(numel(seq), 4) == 0, 'DNA length must divide by 4.');
v = zeros(size(seq));
v(seq == 'T') = 1;
v(seq == 'G') = 2;
v(seq == 'C') = 3;
v = reshape(v, 4, []);
bytes = uint8([64 16 4 1] * v);
end
