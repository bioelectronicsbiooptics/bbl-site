function bytes = dnas_text_bytes(s)
% 원본 column_data 입력 단계: 문자열을 UTF-8 byte로 바꾼다.
bytes = reshape(uint8(unicode2native(char(s), 'UTF-8')), 1, []);
end
