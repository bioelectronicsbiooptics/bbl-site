function reads = dnas_parse_sequences(text)
% 원본 FASTQ import 단계: 서열 공백을 없애고 U를 T로 바꾼다.
lines = regexp(char(text), '\r\n|\r|\n', 'split');
if ~isempty(lines) && isempty(lines{end}), lines(end) = []; end
first = find(~cellfun(@(s) isempty(strtrim(s)), lines), 1);
reads = {};
if isempty(first), return; end
lines = lines(first:end);
head = strtrim(lines{1});
if head(1) == '@'
    assert(mod(numel(lines), 4) == 0, 'FASTQ needs four lines.');
    for k = 1:4:numel(lines)
        assert(startsWith(strtrim(lines{k}), '@'), 'Invalid FASTQ name.');
        assert(startsWith(strtrim(lines{k + 2}), '+'), 'Invalid FASTQ +.');
        reads{end + 1} = normalize(lines{k + 1}); %#ok<AGROW>
    end
elseif head(1) == '>'
    seq = '';
    for k = 2:numel(lines)
        line = strtrim(lines{k});
        if startsWith(line, '>')
            reads{end + 1} = normalize(seq); %#ok<AGROW>
            seq = '';
        else
            seq = [seq line]; %#ok<AGROW>
        end
    end
    reads{end + 1} = normalize(seq);
else
    for k = 1:numel(lines)
        if ~isempty(strtrim(lines{k}))
            reads{end + 1} = normalize(lines{k}); %#ok<AGROW>
        end
    end
end
end

function s = normalize(s)
% 원본 FASTQ import의 문자열 정리 단계에 해당한다.
s = upper(regexprep(s, '\s', ''));
s(s == 'U') = 'T';
end
