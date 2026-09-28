/* DNAS-1: DNA 저장 실습용 byte 기반 구현. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DNAS = root.DNAStore = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const BASES = 'ATGC';
  const F_PRIMER = 'AGCCTTGTGTCCATCAATCC';
  const R_PRIMER = 'TGCGCTATGGTTTGGCTAAT';
  const ROW_BYTES = 17, IDX_BYTES = 2, NSYM = 8;
  const MSG_BYTES = 19, CW_BYTES = 27, BODY_NT = 108;
  const OLIGO_NT = 148, PAD = 0x1B;
  const PRIMER_MIN = F_PRIMER.length - 2; // 기본 20 nt 프라이머의 일치 수.
  const TYPES = {file: 0, text: 1, image: 2};

  // 입력 단계: 모든 입력을 byte 배열로 통일한다.
  function bytes(value) {
    if (value instanceof Uint8Array) return value;
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    return Uint8Array.from(value || []);
  }

  // 입력 단계: 이름 문자열 → UTF-8 byte.
  function textBytes(s) { return new TextEncoder().encode(String(s)); }

  // 원본 대응: 입력 문자와 bin_payload 사이의 관계를 확인한다.
  function describeText(s) {
    return Array.from(s, ch => ({character: ch,
      codepoint: 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'),
      bytes: Array.from(textBytes(ch)), ascii: ch.codePointAt(0) < 128}));
  }

  // 입력 단계: 사진 축소 → JPEG byte.
  async function imageBytes(file, opts = {}) {
    if (typeof document === 'undefined') {
      throw new Error('imageBytes는 canvas가 있는 브라우저에서 실행합니다.');
    }
    const maxSide = opts.maxSide ?? opts.max_side ?? 64;
    const quality = opts.quality ?? 60;
    if (!(maxSide > 0) || quality < 1 || quality > 100) {
      throw new Error('사진 크기와 품질 범위를 확인하세요.');
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    try {
      await new Promise((resolve, reject) => {
        img.onload = resolve; img.onerror = reject; img.src = url;
      });
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      if (opts.gray) {
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < pixels.data.length; i += 4) {
          const g = Math.round(0.299 * pixels.data[i] +
            0.587 * pixels.data[i + 1] + 0.114 * pixels.data[i + 2]);
          pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = g;
        }
        ctx.putImageData(pixels, 0, 0);
      }
      const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, 'image/jpeg', quality / 100));
      if (!blob) throw new Error('JPEG 변환에 실패했습니다.');
      return new Uint8Array(await blob.arrayBuffer());
    } finally { URL.revokeObjectURL(url); }
  }

  // 원본 대응: Binarization의 역방향. 매핑은 ATGC, 순서는 MSB-first.
  function bytesToDNA(value) {
    let dna = '';
    for (const b of bytes(value)) {
      dna += BASES[b >>> 6] + BASES[(b >>> 4) & 3] +
        BASES[(b >>> 2) & 3] + BASES[b & 3];
    }
    return dna;
  }

  // 원본 대응: Binarization.m, 알려지지 않은 염기는 A로 처리한다.
  function dnaToBytes(dna) {
    if (dna.length % 4) throw new Error('DNA 본문 길이는 4의 배수여야 합니다.');
    const result = new Uint8Array(dna.length / 4);
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < 4; j++) {
        const value = BASES.indexOf(dna[i * 4 + j]);
        result[i] = (result[i] << 2) | Math.max(0, value);
      }
    }
    return result;
  }

  // 원본 대응: ReverseEvert, 역방향 read를 정방향으로 바꾼다.
  function reverseComplement(seq) {
    const complement = {A: 'T', T: 'A', G: 'C', C: 'G', N: 'N'};
    return Array.from(seq).reverse().map(b => complement[b] || b).join('');
  }

  // 원본 대응: RSenc/RSdecoding의 GF(256) 표를 직접 만든다.
  function makeField() {
    const exp = new Uint8Array(510), log = new Uint16Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      exp[i] = x; log[x] = i; x <<= 1;
      if (x & 256) x ^= 0x11D;
    }
    for (let i = 255; i < 510; i++) exp[i] = exp[i - 255];
    return {exp, log};
  }
  const GF = makeField();

  // 원본 대응: GF 심볼 곱셈, RS의 byte 연산이다.
  function gfMul(a, b) { return a && b ? GF.exp[GF.log[a] + GF.log[b]] : 0; }

  // 원본 대응: RS 오류 크기 계산에 쓰는 GF 나눗셈이다.
  function gfDiv(a, b) {
    if (!b) throw new Error('GF에서 0으로 나눌 수 없습니다.');
    return a ? GF.exp[(GF.log[a] - GF.log[b] + 255) % 255] : 0;
  }

  // 원본 대응: RS 생성다항식 곱셈(높은 차수 계수가 먼저).
  function polyMul(a, b) {
    const out = new Uint8Array(a.length + b.length - 1);
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b.length; j++) out[i + j] ^= gfMul(a[i], b[j]);
    }
    return out;
  }

  // 원본 대응: RS 신드롬, 높은 차수부터 Horner 계산한다.
  function polyEval(poly, x) {
    let value = 0;
    for (const coefficient of poly) value = gfMul(value, x) ^ coefficient;
    return value;
  }

  // 원본 대응: 오류 위치 다항식은 상수항부터 저장한다.
  function evalAscending(poly, x) {
    let value = 0;
    for (let i = poly.length - 1; i >= 0; i--) value = gfMul(value, x) ^ poly[i];
    return value;
  }

  // 원본 대응: MATLAB rsenc 대신 fcr=1 계통 RS를 직접 부호화한다.
  function rsEncode(message, nsym = NSYM) {
    const msg = bytes(message);
    if (!Number.isInteger(nsym) || nsym < 1 || nsym > 254 || msg.length + nsym > 255) {
      throw new Error('RS 부호어는 255 byte 이하, 패리티는 양의 정수입니다.');
    }
    let generator = new Uint8Array([1]);
    for (let i = 1; i <= nsym; i++) generator = polyMul(generator, [1, GF.exp[i]]);
    const remainder = new Uint8Array(msg.length + nsym);
    remainder.set(msg);
    for (let i = 0; i < msg.length; i++) {
      const coefficient = remainder[i];
      if (coefficient) {
        for (let j = 1; j < generator.length; j++) {
          remainder[i + j] ^= gfMul(generator[j], coefficient);
        }
      }
    }
    remainder.set(msg);
    return remainder;
  }

  // 원본 대응: RSdecoding의 신드롬 S1..S8이다.
  function syndromes(cw, nsym) {
    return Array.from({length: nsym}, (_, i) => polyEval(cw, GF.exp[i + 1]));
  }

  // 원본 대응: RSdecoding의 오류 위치 계산, Berlekamp–Massey.
  function errorLocator(syndrome) {
    let locator = [1], previous = [1];
    let degree = 0, shift = 1, lastDiscrepancy = 1;
    for (let n = 0; n < syndrome.length; n++) {
      let discrepancy = syndrome[n];
      for (let i = 1; i <= degree; i++) {
        discrepancy ^= gfMul(locator[i] || 0, syndrome[n - i]);
      }
      if (!discrepancy) { shift++; continue; }
      const saved = locator.slice(), factor = gfDiv(discrepancy, lastDiscrepancy);
      while (locator.length < previous.length + shift) locator.push(0);
      for (let i = 0; i < previous.length; i++) {
        locator[i + shift] ^= gfMul(factor, previous[i]);
      }
      if (2 * degree <= n) {
        degree = n + 1 - degree; previous = saved;
        lastDiscrepancy = discrepancy; shift = 1;
      } else shift++;
    }
    return {locator: locator.slice(0, degree + 1), degree};
  }

  // 원본 대응: Global/Local RS. BM → Chien → Forney, 실패는 null.
  function rsDecode(codeword, nsym = NSYM) {
    const cw = bytes(codeword).slice();
    if (!Number.isInteger(nsym) || nsym < 1 || nsym > 254 || cw.length < nsym || cw.length > 255) {
      return null;
    }
    const syndrome = syndromes(cw, nsym);
    if (!syndrome.some(Boolean)) return {message: cw.slice(0, -nsym), corrected: 0};
    const {locator, degree} = errorLocator(syndrome);
    if (!degree || degree > Math.floor(nsym / 2)) return null;
    const positions = [];
    // Chien: 부호어 밖의 근까지 검사해 잘못된 위치를 거절한다.
    for (let power = 0; power < 255; power++) {
      const inverse = GF.exp[(255 - power) % 255];
      if (evalAscending(locator, inverse) === 0) {
        const position = cw.length - 1 - power;
        if (position < 0) return null;
        positions.push({position, inverse});
      }
    }
    if (positions.length !== degree) return null;
    const evaluator = new Uint8Array(nsym);
    for (let i = 0; i < syndrome.length; i++) {
      for (let j = 0; j < locator.length && i + j < nsym; j++) {
        evaluator[i + j] ^= gfMul(syndrome[i], locator[j]);
      }
    }
    const derivative = locator.slice(1).map((v, i) => i % 2 === 0 ? v : 0);
    for (const {position, inverse} of positions) {
      const denominator = evalAscending(derivative, inverse);
      if (!denominator) return null;
      // fcr=1이므로 Ω(z)/Λ′(z)가 바로 오류 byte 값이다.
      cw[position] ^= gfDiv(evalAscending(evaluator, inverse), denominator);
    }
    if (syndromes(cw, nsym).some(Boolean)) return null;
    return {message: cw.slice(0, -nsym), corrected: positions.length};
  }

  // 무결성 검산: IEEE CRC-32.
  function crc32(value) {
    let crc = 0xFFFFFFFF;
    for (const b of bytes(value)) {
      crc ^= b;
      for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  // 원본 대응: 채널 난수 및 선택 whitening의 재현 가능한 LCG.
  function makeRng(seed) {
    let state = Number(seed) >>> 0;
    return function next() {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  // 원본 대응: null 패턴 이후 선택 whitening(행 번호는 1부터).
  function whitenRow(row, rowNumber) {
    const next = makeRng(rowNumber);
    return Uint8Array.from(row, b => b ^ Math.floor(next() * 256));
  }

  // 원본 대응: xor(xor_A, xor_B), 행 byte별 XOR.
  function xorRows(a, b) { return Uint8Array.from(a, (value, i) => value ^ b[i]); }

  // 원본 대응: KIS 역할의 헤더 행(1번 행)을 만든다.
  function makeHeader(data, dtype, ext, D, whiten) {
    const header = new Uint8Array(ROW_BYTES), view = new DataView(header.buffer);
    header[0] = 1; header[1] = dtype;
    view.setUint32(2, data.length); view.setUint32(6, crc32(data));
    view.setUint16(10, D); header[12] = whiten ? 1 : 0;
    header.fill(32, 13);
    for (let i = 0; i < ext.length; i++) header[13 + i] = ext.charCodeAt(i);
    return header;
  }

  // 원본 대응: column_data → xor_data → nrsin → bin_payload → DNA_library.
  function encode(value, opts = {}) {
    const data = bytes(value);
    const typeValue = opts.dtype ?? opts.type ?? 'file';
    const dtype = typeof typeValue === 'number' ? typeValue : TYPES[typeValue];
    if (![0, 1, 2].includes(dtype)) throw new Error('type은 file, text, image입니다.');
    const ext = String(opts.ext ?? 'bin').toLowerCase().slice(0, 4);
    if (!/^[\x20-\x7E]{0,4}$/.test(ext)) throw new Error('확장자는 ASCII 4자 이내입니다.');
    const F = String(opts.f ?? opts.F ?? F_PRIMER).toUpperCase();
    const R = String(opts.r ?? opts.R ?? R_PRIMER).toUpperCase();
    if (!/^[ATGC]+$/.test(F) || !/^[ATGC]+$/.test(R)) throw new Error('프라이머는 ATGC로 입력하세요.');
    const whiten = Boolean(opts.whiten);
    let D = 1 + Math.ceil(data.length / ROW_BYTES);
    if (D % 2) D++;
    if (D * 1.5 > 65535 || data.length > 0xFFFFFFFF) throw new Error('가닥 수가 uint16 범위를 넘습니다.');
    const rows = [makeHeader(data, dtype, ext, D, whiten)];
    for (let i = 1; i < D; i++) {
      let row = new Uint8Array(ROW_BYTES).fill(PAD);
      row.set(data.slice((i - 1) * ROW_BYTES, i * ROW_BYTES));
      if (whiten) row = whitenRow(row, i + 1);
      rows.push(row);
    }
    const H = D / 2;
    for (let j = 0; j < H; j++) rows.push(xorRows(rows[j], rows[j + H]));
    return rows.map((row, i) => {
      const index = i + 1, message = new Uint8Array(MSG_BYTES);
      message.set(row); message[17] = index >>> 8; message[18] = index & 255;
      const codeword = rsEncode(message);
      const role = index === 1 ? 'header' : index <= D ? 'data' : 'xor';
      return {index, role, seq: F + bytesToDNA(codeword) + R, row, message, codeword};
    });
  }

  // 원본 대응: DNA_library 출력, FASTA 마지막 줄도 개행한다.
  function toFasta(oligos) {
    return oligos.map(o => `>dnas_${String(o.index).padStart(4, '0')} ` +
      `idx=${o.index} role=${o.role} len=${o.seq.length}\n${o.seq}\n`).join('');
  }

  // 원본 대응: FASTQ 읽기와 PrimerSort 전처리.
  function readSequences(text) {
    const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
    if (lines[lines.length - 1] === '') lines.pop();
    while (lines.length && !lines[0].trim()) lines.shift();
    if (!lines.length) return [];
    const reads = [];
    const normalize = seq => seq.replace(/\s/g, '').toUpperCase().replace(/U/g, 'T');
    if (lines[0].trimStart().startsWith('@')) {
      if (lines.length % 4) throw new Error('FASTQ는 read마다 4줄이어야 합니다.');
      for (let i = 0; i < lines.length; i += 4) {
        if (!lines[i].trimStart().startsWith('@')) {
          throw new Error('FASTQ 이름 줄은 @로 시작해야 합니다.');
        }
        if (!lines[i + 2].trimStart().startsWith('+')) {
          throw new Error('FASTQ 세 번째 줄은 +로 시작해야 합니다.');
        }
        reads.push(normalize(lines[i + 1]));
      }
    } else if (lines[0].trimStart().startsWith('>')) {
      let sequence = '', seenHeader = false;
      for (const line of lines) {
        if (line.trimStart().startsWith('>')) {
          if (seenHeader) reads.push(normalize(sequence));
          sequence = ''; seenHeader = true;
        } else sequence += line;
      }
      if (seenHeader) reads.push(normalize(sequence));
    } else {
      for (const line of lines) if (line.trim()) reads.push(normalize(line));
    }
    return reads;
  }

  // 원본 대응: 실험 read 대신 치환·삽입·결실·소실 채널을 만든다.
  function simulate(sequences, opts = {}) {
    const seed = opts.seed ?? 1, coverage = opts.coverage ?? 10;
    const pDrop = opts.p_drop ?? 0, pSub = opts.p_sub ?? 0;
    const pIns = opts.p_ins ?? 0, pDel = opts.p_del ?? 0, pRC = opts.p_rc ?? 0.5;
    if (!Number.isInteger(coverage) || coverage < 1) throw new Error('coverage는 1 이상 정수입니다.');
    if ([pDrop, pSub, pIns, pDel, pRC].some(p => !Number.isFinite(p) || p < 0 || p > 1) ||
        pSub + pIns + pDel > 1) throw new Error('확률 범위를 확인하세요.');
    const next = makeRng(seed), dropped = new Set(opts.drop || []), reads = [];
    sequences.forEach((oligo, offset) => {
      const seq = typeof oligo === 'string' ? oligo : oligo.seq;
      const u = next();
      if (dropped.has(offset + 1) || u < pDrop) return;
      const copies = 1 + Math.floor(next() * (2 * coverage - 1));
      for (let copy = 0; copy < copies; copy++) {
        let read = '';
        for (const b of seq) {
          const uBase = next();
          if (uBase < pDel) continue;
          if (uBase < pDel + pIns) read += b + BASES[Math.floor(next() * 4)];
          else if (uBase < pDel + pIns + pSub) {
            const others = BASES.replace(b, '');
            read += others[Math.floor(next() * 3)];
          } else read += b;
        }
        if (next() < pRC) read = reverseComplement(read);
        reads.push(read);
      }
    });
    if (opts.shuffle !== false) {
      for (let k = reads.length - 1; k > 0; k--) {
        const j = Math.floor(next() * (k + 1));
        [reads[k], reads[j]] = [reads[j], reads[k]];
      }
    }
    return reads;
  }

  // 원본 대응: 모의 read를 FASTQ로 내보내는 수업용 출력.
  function toFastq(reads) {
    return reads.map((seq, i) => `@read_${i + 1}\n${seq}\n+\n${'I'.repeat(seq.length)}\n`).join('');
  }

  // 원본 대응: PrimerSort의 같은 위치 프라이머 일치 수.
  function matches(a, b) {
    let count = 0;
    for (let i = 0; i < b.length; i++) if (a[i] === b[i]) count++;
    return count;
  }

  // 원본 대응: Consensus2, 동률은 원본 매핑표 ATGC 순서.
  function consensus(bodies) {
    let sequence = '';
    for (let p = 0; p < BODY_NT; p++) {
      const counts = [0, 0, 0, 0];
      for (const body of bodies) {
        const index = BASES.indexOf(body[p]);
        if (index >= 0) counts[index]++;
      }
      let winner = 0;
      for (let b = 1; b < 4; b++) if (counts[b] > counts[winner]) winner = b;
      sequence += BASES[winner];
    }
    return sequence;
  }

  // 원본 대응: Local RS 성공 read들을 byte 위치별 다수결한다.
  function byteConsensus(rows) {
    const row = new Uint8Array(ROW_BYTES);
    for (let p = 0; p < ROW_BYTES; p++) {
      const counts = new Uint32Array(256);
      for (const candidate of rows) counts[candidate[p]]++;
      let winner = 0;
      for (let b = 1; b < 256; b++) if (counts[b] > counts[winner]) winner = b;
      row[p] = winner;
    }
    return row;
  }

  // 원본 대응: KIS 역할의 헤더 행을 읽는다.
  function parseHeader(row) {
    if (!row || row.length !== ROW_BYTES ||
        row.slice(13, 17).some(b => b > 127)) return null;
    const view = new DataView(row.buffer, row.byteOffset, row.byteLength);
    const header = {version: row[0], type: row[1], length: view.getUint32(2),
      crc32: view.getUint32(6), D: view.getUint16(10), flags: row[12],
      ext: String.fromCharCode(...row.slice(13, 17)).replace(/ +$/, '')};
    if (header.version !== 1 || header.type > 2 || header.D < 2 ||
        header.D % 2 || header.D * 1.5 > 65535 ||
        header.length > (header.D - 1) * ROW_BYTES) return null;
    return header;
  }

  // 원본 대응: XORrun2의 세 가닥 중 정확히 하나가 없으면 복원한다.
  function recoverXor(rows, status, D) {
    const H = D / 2;
    let recovered = 0;
    for (let j = 1; j <= H; j++) {
      const indices = [j, j + H, D + j];
      const missing = indices.filter(i => !rows.has(i));
      if (missing.length === 1) {
        const present = indices.filter(i => rows.has(i));
        rows.set(missing[0], xorRows(rows.get(present[0]), rows.get(present[1])));
        status.set(missing[0], 'xor'); recovered++;
      }
    }
    return recovered;
  }

  // 복원 파일 SHA-256 검산(브라우저 오프라인).
  function sha256(value) {
    const data = bytes(value);
    const constants = [
      0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,
      0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,
      0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,
      0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,
      0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,
      0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,
      0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,
      0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,
      0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const hash = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,
      0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const total = Math.ceil((data.length + 9) / 64) * 64;
    const padded = new Uint8Array(total); padded.set(data); padded[data.length] = 128;
    const view = new DataView(padded.buffer);
    view.setUint32(total - 8, Math.floor(data.length / 536870912));
    view.setUint32(total - 4, (data.length * 8) >>> 0);
    const rotate = (x, n) => (x >>> n) | (x << (32 - n));
    const words = new Uint32Array(64);
    for (let start = 0; start < total; start += 64) {
      for (let i = 0; i < 16; i++) words[i] = view.getUint32(start + i * 4);
      for (let i = 16; i < 64; i++) {
        const a = words[i - 15], b = words[i - 2];
        const s0 = rotate(a, 7) ^ rotate(a, 18) ^ (a >>> 3);
        const s1 = rotate(b, 17) ^ rotate(b, 19) ^ (b >>> 10);
        words[i] = (words[i - 16] + s0 + words[i - 7] + s1) >>> 0;
      }
      let [a,b,c,d,e,f,g,h] = hash;
      for (let i = 0; i < 64; i++) {
        const sum1 = rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25);
        const choice = (e & f) ^ (~e & g);
        const t1 = (h + sum1 + choice + constants[i] + words[i]) >>> 0;
        const sum0 = rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22);
        const majority = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (sum0 + majority) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      [a,b,c,d,e,f,g,h].forEach((n, i) => { hash[i] = (hash[i] + n) >>> 0; });
    }
    return hash.map(n => n.toString(16).padStart(8, '0')).join('');
  }

  // 원본 대응: STL_Decode의 방향 → PrimerSort → iSCAN → RS → XOR.
  function decode(input, opts = {}) {
    const reads = typeof input === 'string' ? readSequences(input) : Array.from(input);
    const F = String(opts.f ?? opts.F ?? F_PRIMER).toUpperCase();
    const R = String(opts.r ?? opts.R ?? R_PRIMER).toUpperCase();
    if (!/^[ATGC]+$/.test(F) || !/^[ATGC]+$/.test(R)) throw new Error('프라이머는 ATGC로 입력하세요.');
    const expectedLength = F.length + BODY_NT + R.length;
    const report = {reads: reads.length, reversed: 0, no_primer: 0,
      bad_length: 0, invalid_index: 0, groups: 0, expected: 0,
      global: 0, local: 0, xor: 0, missing: [], crc_ok: false,
      type: -1, ext: '', length: 0, sha256: sha256([]), status: []};
    const groups = new Map(), rows = new Map(), status = new Map();
    for (const raw of reads) {
      let read = String(raw).replace(/\s/g, '').toUpperCase().replace(/U/g, 'T');
      if (matches(read, F) < F.length - 2) {
        read = reverseComplement(read);
        if (matches(read, F) < F.length - 2) {
          report.no_primer++; continue;
        }
        report.reversed++;
      }
      if (read.length < expectedLength ||
          matches(read.slice(F.length + BODY_NT, expectedLength), R) <
          R.length - 2) {
        report.bad_length++; continue;
      }
      const body = read.slice(F.length, F.length + BODY_NT);
      const indexBytes = dnaToBytes(body.slice(ROW_BYTES * 4, MSG_BYTES * 4));
      const index = indexBytes[0] * 256 + indexBytes[1];
      if (!index) { report.invalid_index++; continue; }
      if (!groups.has(index)) groups.set(index, []);
      groups.get(index).push(body);
    }
    report.groups = groups.size;
    const ordered = Array.from(groups.keys()).sort((a, b) => a - b);
    for (const index of ordered) {
      const bodies = groups.get(index), result = rsDecode(dnaToBytes(consensus(bodies)));
      if (result && result.message[17] * 256 + result.message[18] === index) {
        rows.set(index, result.message.slice(0, ROW_BYTES));
        status.set(index, 'global'); report.global++; continue;
      }
      const local = [];
      for (const body of bodies) {
        const result = rsDecode(dnaToBytes(body));
        if (result && result.message[17] * 256 + result.message[18] === index) {
          local.push(result.message.slice(0, ROW_BYTES));
        }
      }
      if (local.length) {
        rows.set(index, byteConsensus(local)); status.set(index, 'local'); report.local++;
      }
    }
    let header = parseHeader(rows.get(1));
    let maximumIndex = 0;
    for (const index of rows.keys()) maximumIndex = Math.max(maximumIndex, index);
    let D = header ? header.D : 2 * Math.ceil(maximumIndex / 3);
    if (D) report.xor += recoverXor(rows, status, D);
    const recoveredHeader = parseHeader(rows.get(1));
    if (!header && recoveredHeader) {
      header = recoveredHeader; D = header.D;
      report.xor += recoverXor(rows, status, D);
    }
    report.expected = D * 1.5;
    for (let i = 1; i <= report.expected; i++) {
      report.status.push(status.get(i) || 'missing');
      if (!rows.has(i)) report.missing.push(i);
    }
    if (!header) return {data: new Uint8Array(), header: null, report};
    const buffer = new Uint8Array((D - 1) * ROW_BYTES);
    for (let index = 2; index <= D; index++) {
      let row = rows.get(index) || new Uint8Array(ROW_BYTES);
      if (header.flags & 1) row = whitenRow(row, index);
      buffer.set(row, (index - 2) * ROW_BYTES);
    }
    const data = buffer.slice(0, header.length);
    report.crc_ok = crc32(data) === header.crc32;
    report.type = header.type; report.ext = header.ext; report.length = header.length;
    report.sha256 = sha256(data);
    return {data, header, report};
  }

  // 원본 대응: cCal의 GC 계산과 호모폴리머 확인용 통계.
  function statistics(oligos) {
    let total = 0, gc = 0, maxRun = 0;
    for (const value of oligos) {
      const seq = typeof value === 'string' ? value : value.seq;
      let previous = '', run = 0;
      for (const b of seq) {
        total++; if (b === 'G' || b === 'C') gc++;
        run = b === previous ? run + 1 : 1;
        maxRun = Math.max(maxRun, run); previous = b;
      }
    }
    return {count: oligos.length, total_nt: total,
      gc_percent: total ? 100 * gc / total : 0, max_homopolymer: maxRun};
  }

  return {BASES, F_PRIMER, R_PRIMER, ROW_BYTES, IDX_BYTES, NSYM,
    MSG_BYTES, CW_BYTES, BODY_NT, OLIGO_NT, PAD, PRIMER_MIN,
    textBytes, describeText, imageBytes, bytesToDNA, bytesToDna: bytesToDNA,
    dnaToBytes, reverseComplement, rsEncode, rsDecode, crc32, sha256,
    makeRng, whitenRow, xorRows, parseHeader, encode, toFasta, readSequences,
    simulate, toFastq, decode, statistics};
}));
