function results = test_vectors()
% 원본 rsenc · rsdec 대조 및 DNAS-1 직접 구현의 독립 검산이다.
%% 상수 · CRC · SONG
assert(dnas_crc32(uint8('123456789')) == hex2dec('CBF43926'));
song = dnas_rs_encode(uint8('SONG'), 4);
assert(isequal(song, uint8([83 79 78 71 226 229 64 153])));
rng(7, 'twister');
results = struct('rs_corrected', 0, 'rs_rejected', 0, ...
    'rs_beyond_restored', 0, 'rs_miscorrected', 0, ...
    'roundtrip', 0, 'single_dropout', 0, 'toolbox_compared', 0);

%% RS: 메시지 1000개 × 오류 0..8개
for trial = 1:1000
    msg = uint8(randi([0 255], 1, 19));
    cw = dnas_rs_encode(msg);
    for errors = 0:8
        rx = cw;
        where = randperm(27, errors);
        rx(where) = bitxor(rx(where), ...
            uint8(randi([1 255], 1, errors)));
        [got, fixed, ok] = dnas_rs_decode(rx);
        if errors <= 4
            assert(ok && isequal(got, msg) && fixed == errors);
            results.rs_corrected = results.rs_corrected + 1;
        elseif ~ok
            results.rs_rejected = results.rs_rejected + 1;
        elseif isequal(got, msg)
            results.rs_beyond_restored = results.rs_beyond_restored + 1;
        else
            results.rs_miscorrected = results.rs_miscorrected + 1;
        end
    end
end

%% Byte 왕복: UTF-8 · 경계 길이 · 무작위 파일
inputs = {dnas_text_bytes('SONG'), dnas_text_bytes('송영준'), ...
    dnas_text_bytes('Hello, DNA! 안녕'), zeros(1, 0, 'uint8')};
for len = [1 16 17 18 34 35 250 1024 5000]
    inputs{end + 1} = uint8(randi([0 255], 1, len)); %#ok<AGROW>
end
folder = fileparts(mfilename('fullpath'));
photo = fullfile(folder, '..', 'samples', 'sample_photo.jpg');
if isfile(photo)
    fid = fopen(photo, 'rb');
    inputs{end + 1} = fread(fid, Inf, '*uint8')';
    fclose(fid);
end
for k = 1:numel(inputs)
    for whiten = [false true]
        oligos = dnas_encode(inputs{k}, 'file', 'bin', whiten);
        [data, ~, rep] = dnas_decode({oligos.seq});
        assert(rep.crc_ok && isequal(data, inputs{k}));
        results.roundtrip = results.roundtrip + 1;
    end
end

%% 모든 단일 가닥 소실: 헤더도 XOR로 복구
msg = uint8(0:59);
oligos = dnas_encode(msg);
for lost = 1:numel(oligos)
    keep = setdiff(1:numel(oligos), lost);
    [data, ~, rep] = dnas_decode({oligos(keep).seq});
    assert(rep.crc_ok && isequal(data, msg));
    assert(rep.xor == 1);
    results.single_dropout = results.single_dropout + 1;
end

%% 같은 XOR 묶음의 두 행은 복구 불가능
D = 2*numel(oligos)/3; H = D/2;
keep = setdiff(1:numel(oligos), [2 2 + H]);
[~, ~, rep] = dnas_decode({oligos(keep).seq});
assert(~rep.crc_ok && all(ismember([2 2 + H], rep.missing)));

%% Toolbox는 구현에 필요 없고, 설치된 경우 대조만 수행
if exist('rsenc', 'file') && exist('gf', 'file')
    try
        ref = rsenc(gf(double(msg(1:19)), 8), 27, 19);
        assert(isequal(uint8(ref.x), dnas_rs_encode(msg(1:19))));
        results.toolbox_compared = 1;
    catch problem
        if ~contains(lower(problem.message), 'license')
            rethrow(problem);
        end
    end
end
fprintf('RS 0..4: %d/5000, 5..8 rejected %d, restored %d, wrong %d\n', ...
    results.rs_corrected, results.rs_rejected, ...
    results.rs_beyond_restored, results.rs_miscorrected);
fprintf('Roundtrip %d, single dropout %d, toolbox compare %d\n', ...
    results.roundtrip, results.single_dropout, results.toolbox_compared);
end
