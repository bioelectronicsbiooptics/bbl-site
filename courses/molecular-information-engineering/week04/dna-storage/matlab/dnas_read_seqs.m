function reads = dnas_read_seqs(file)
% 원본 FASTQ import 단계: FASTA · FASTQ · 한 줄 서열을 읽는다.
reads = dnas_parse_sequences(fileread(file));
end
