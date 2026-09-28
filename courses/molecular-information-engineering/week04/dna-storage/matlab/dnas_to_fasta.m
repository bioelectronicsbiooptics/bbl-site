function text = dnas_to_fasta(oligos)
% 원본 DNA_library 저장 단계: 마지막 줄에도 LF를 넣는다.
parts = cell(1, numel(oligos));
for k = 1:numel(oligos)
    o = oligos(k);
    parts{k} = sprintf('>dnas_%04d idx=%d role=%s len=%d\n%s\n', ...
        o.index, o.index, o.role, numel(o.seq), o.seq);
end
text = [parts{:}];
end
