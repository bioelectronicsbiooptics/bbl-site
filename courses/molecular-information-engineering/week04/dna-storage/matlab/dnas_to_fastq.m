function text = dnas_to_fastq(reads)
% 원본 FASTQ 불러오기와 짝을 이루는 모의 read 저장 단계이다.
parts = cell(1, numel(reads));
for k = 1:numel(reads)
    s = char(reads{k});
    parts{k} = sprintf('@read_%d\n%s\n+\n%s\n', ...
        k, s, repmat('I', 1, numel(s)));
end
text = [parts{:}];
end
