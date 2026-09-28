function reads = dnas_simulate(seqs, opts)
% 원본 FASTQ read를 대신하는 재현 가능한 오류 채널이다.
if nargin < 2, opts = struct(); end
if isstruct(seqs), seqs = {seqs.seq}; end
if isstring(seqs), seqs = cellstr(seqs); end
if ischar(seqs), seqs = cellstr(seqs); end
seed = option('seed', 1);
coverage = option('coverage', 10);
p_drop = option('p_drop', 0);
p_sub = option('p_sub', 0);
p_ins = option('p_ins', 0);
p_del = option('p_del', 0);
p_rc = option('p_rc', 0.5);
drop = option('drop', []);
shuffle = option('shuffle', true);
assert(coverage >= 1 && coverage == floor(coverage));
p = [p_drop p_sub p_ins p_del p_rc];
assert(all(p >= 0 & p <= 1) && p_sub + p_ins + p_del <= 1);
x = mod(fix(double(seed)), 2^32);
bases = 'ATGC';
reads = cell(1, numel(seqs)*(2*coverage - 1));
count = 0;
for index = 1:numel(seqs)
    u = next();
    if ismember(index, drop) || u < p_drop, continue; end
    copies = 1 + floor(next() * (2*coverage - 1));
    seq = char(seqs{index});
    for copy = 1:copies
        read = repmat('A', 1, 2*numel(seq));
        len = 0;
        for b = seq
            u = next();
            if u < p_del
                continue;
            elseif u < p_del + p_ins
                read(len + 1:len + 2) = [b bases(floor(next()*4) + 1)];
                len = len + 2;
            elseif u < p_del + p_ins + p_sub
                others = bases(bases ~= b);
                len = len + 1;
                read(len) = others(floor(next()*3) + 1);
            else
                len = len + 1;
                read(len) = b;
            end
        end
        read = read(1:len);
        if next() < p_rc, read = dnas_reverse_complement(read); end
        count = count + 1;
        reads{count} = read;
    end
end
reads = reads(1:count);
if shuffle
    for k = count:-1:2
        j = floor(next()*k) + 1;
        temp = reads{k}; reads{k} = reads{j}; reads{j} = temp;
    end
end

    function value = option(key, fallback)
        % 원본 채널 입력 설정에 대응하는 수업용 매개변수이다.
        value = fallback;
        if isfield(opts, key), value = opts.(key); end
    end

    function u = next()
        % 원본 실험 read 대신 공통 LCG 난수를 순서대로 뽑는다.
        x = mod(1664525*x + 1013904223, 2^32);
        u = x / 2^32;
    end
end
