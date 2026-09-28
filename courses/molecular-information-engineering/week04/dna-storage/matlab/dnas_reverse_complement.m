function seq = dnas_reverse_complement(seq)
% 원본 ReverseEvert: read 방향을 5-prime → 3-prime로 맞춘다.
seq = fliplr(char(seq));
old = seq;
seq(old == 'A') = 'T';
seq(old == 'T') = 'A';
seq(old == 'G') = 'C';
seq(old == 'C') = 'G';
end
