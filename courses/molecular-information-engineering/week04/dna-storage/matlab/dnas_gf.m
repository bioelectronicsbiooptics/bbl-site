function [expTable, logTable] = dnas_gf()
% 원본 rsenc/gf 부분: GF(256) 표를 직접 만든다.
% alpha=2, primitive=0x11D. 지수/로그의 값에 1을 더해 첨자 사용.
persistent powers logs
if isempty(powers)
    powers = zeros(1, 512);
    logs = -ones(1, 256);
    value = 1;
    for power = 0:254
        powers(power + 1) = value;
        logs(value + 1) = power;
        value = value * 2;
        if value >= 256
            value = bitxor(value, hex2dec('11D'));
        end
    end
    for power = 255:511
        powers(power + 1) = powers(mod(power, 255) + 1);
    end
end
expTable = powers;
logTable = logs;
end
