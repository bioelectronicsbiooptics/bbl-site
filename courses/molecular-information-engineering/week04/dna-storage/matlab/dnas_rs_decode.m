function [message, corrected, ok] = dnas_rs_decode(codeword, nsym)
% 원본 RSdecoding: BM -> Chien -> Forney로 byte 오류를 정정한다.
if nargin < 2
    nsym = 8;
end
message = uint8([]);
corrected = -1;
ok = false;
word = double(codeword(:).');
if ~isscalar(nsym) || nsym < 1 || nsym > 254 || fix(nsym) ~= nsym
    return
end
if numel(word) < nsym || numel(word) > 255 || ...
        any(~isfinite(word)) || ...
        any(word < 0 | word > 255 | fix(word) ~= word)
    return
end
[powers, logs] = dnas_gf();
syndrome = syndromes(word, nsym, powers, logs);
if ~any(syndrome)
    message = uint8(word(1:end - nsym));
    corrected = 0;
    ok = true;
    return
end
[locator, degree] = berlekamp(syndrome, powers, logs);
if degree < 1 || degree > floor(nsym / 2)
    return
end

% Chien: 짧아진 부호어 안에서만 근을 찾는다.
positions = [];
roots = [];
for position = 1:numel(word)
    exponent = numel(word) - position;
    root = powers(mod(-exponent, 255) + 1);
    if evaluate(fliplr(locator), root, powers, logs) == 0
        positions(end + 1) = position; %#ok<AGROW>
        roots(end + 1) = root; %#ok<AGROW>
    end
end
if numel(positions) ~= degree
    return
end

% Omega = (S1 + S2*z + ...) * Lambda mod z^nsym.
omega = zeros(1, nsym);
for left = 1:numel(locator)
    for right = 1:nsym - left + 1
        product = multiply(locator(left), syndrome(right), powers, logs);
        omega(left + right - 1) = bitxor(omega(left + right - 1), product);
    end
end
derivative = zeros(1, degree);
derivative(1:2:end) = locator(2:2:end);
for index = 1:degree
    root = roots(index);
    denominator = evaluate(fliplr(derivative), root, powers, logs);
    if denominator == 0
        return
    end
    numerator = evaluate(fliplr(omega), root, powers, logs);
    magnitude = divide(numerator, denominator, powers, logs);
    position = positions(index);
    word(position) = bitxor(word(position), magnitude);
end
if any(syndromes(word, nsym, powers, logs))
    return
end
message = uint8(word(1:end - nsym));
corrected = degree;
ok = true;
end

function syndrome = syndromes(word, nsym, powers, logs)
% 원본 RSdecoding: 최고 차수부터 신드롬 S1..Snsym 계산.
syndrome = zeros(1, nsym);
for root = 1:nsym
    syndrome(root) = evaluate(word, powers(root + 1), powers, logs);
end
end

function [locator, degree] = berlekamp(syndrome, powers, logs)
% 원본 RSdecoding: Berlekamp-Massey 오류 위치 다항식.
count = numel(syndrome);
locator = [1 zeros(1, count)];
previous = locator;
degree = 0;
distance = 1;
last = 1;
for step = 0:count - 1
    discrepancy = syndrome(step + 1);
    for index = 1:degree
        product = multiply(locator(index + 1), ...
            syndrome(step + 1 - index), powers, logs);
        discrepancy = bitxor(discrepancy, product);
    end
    if discrepancy == 0
        distance = distance + 1;
        continue
    end
    saved = locator;
    scale = divide(discrepancy, last, powers, logs);
    for index = 1:count + 1 - distance
        product = multiply(scale, previous(index), powers, logs);
        target = index + distance;
        locator(target) = bitxor(locator(target), product);
    end
    if 2 * degree <= step
        degree = step + 1 - degree;
        previous = saved;
        last = discrepancy;
        distance = 1;
    else
        distance = distance + 1;
    end
end
locator = locator(1:degree + 1);
end

function value = evaluate(polynomial, point, powers, logs)
% 원본 RSdecoding: 최고 차수부터 Horner 다항식 계산.
value = 0;
for coefficient = polynomial
    value = bitxor(multiply(value, point, powers, logs), coefficient);
end
end

function product = multiply(left, right, powers, logs)
% 원본 gf 곱셈: byte 심볼의 체 연산.
if left == 0 || right == 0
    product = 0;
else
    product = powers(logs(left + 1) + logs(right + 1) + 1);
end
end

function quotient = divide(numerator, denominator, powers, logs)
% 원본 gf 나눗셈: 로그 차를 255로 나눈 나머지 사용.
if numerator == 0
    quotient = 0;
else
    exponent = mod(logs(numerator + 1) - logs(denominator + 1), 255);
    quotient = powers(exponent + 1);
end
end
