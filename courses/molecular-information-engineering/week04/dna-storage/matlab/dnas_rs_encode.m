function codeword = dnas_rs_encode(message, nsym)
% 원본 nrsin/rsenc 단계: byte를 GF(256) 심볼로 넣는다.
if nargin < 2
    nsym = 8;
end
message = double(message(:).');
if ~isscalar(nsym) || nsym < 1 || nsym > 254 || fix(nsym) ~= nsym
    error('DNAS:RS', 'nsym은 1..254 정수여야 합니다.');
end
if numel(message) + nsym > 255 || any(~isfinite(message)) || ...
        any(message < 0 | message > 255 | fix(message) ~= message)
    error('DNAS:RS', '총 255 심볼 이하의 byte를 입력하세요.');
end
[powers, logs] = dnas_gf();
generator = 1;
for root = 1:nsym
    shifted = [0 multiply(generator, powers(root + 1), powers, logs)];
    generator = bitxor([generator 0], shifted);
end
work = [message zeros(1, nsym)];
for index = 1:numel(message)
    coefficient = work(index);
    if coefficient ~= 0
        span = index + (1:nsym);
        product = multiply(generator(2:end), coefficient, powers, logs);
        work(span) = bitxor(work(span), product);
    end
end
codeword = uint8([message work(numel(message) + 1:end)]);
end

function product = multiply(values, value, powers, logs)
% 원본 gf 곱셈: log/antilog로 툴박스 없이 계산한다.
product = zeros(size(values));
nonzero = values ~= 0 & value ~= 0;
if any(nonzero)
    exponents = logs(values(nonzero) + 1) + logs(value + 1);
    product(nonzero) = powers(exponents + 1);
end
end
