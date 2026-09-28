function dnas_write_fasta(file, oligos)
% 원본 DNA_library 저장 단계: FASTA를 파일로 기록한다.
fid = fopen(file, 'wb');
assert(fid >= 0, 'Cannot write FASTA.');
clean = onCleanup(@() fclose(fid));
fwrite(fid, dnas_to_fasta(oligos), 'char');
end
