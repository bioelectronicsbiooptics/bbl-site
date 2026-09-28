function c = dnas_constants()
% 원본 primerSelect · cCal의 상수를 DNAS-1 형식으로 모은다.
c.BASES = 'ATGC';
c.F = 'AGCCTTGTGTCCATCAATCC';
c.R = 'TGCGCTATGGTTTGGCTAAT';
c.ROW_BYTES = 17;
c.NSYM = 8;
c.BODY_NT = 108;
c.PAD = uint8(27);
end
