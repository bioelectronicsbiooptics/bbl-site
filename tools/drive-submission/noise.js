/* Deterministic, bounded FASTQ channel for the week 12 no-header decoder.
 * Include this file as a .gs source in Apps Script, or require it in Node.
 */
var DNA_NOISE = (function () {
  'use strict';

  var F = 'AGCCTTGTGTCCATCAATCC';
  var R = 'TGCGCTATGGTTTGGCTAAT';
  var BASES = 'ATGC';
  var COMPLEMENT = { A: 'T', T: 'A', G: 'C', C: 'G' };
  var MAX_N = 65535;

  function checkedCount(n, label) {
    if (!Number.isSafeInteger(n) || n < 0) throw new Error(label + ' must be a nonnegative integer.');
  }

  function strandIndex(seq) {
    var index = 0;
    for (var k = 88; k < 96; k++) index = index * 4 + BASES.indexOf(seq.charAt(k));
    return index;
  }

  function gfMultiply(a, b) {
    var product = 0;
    while (b) {
      if (b & 1) product ^= a;
      a <<= 1;
      if (a & 256) a ^= 0x11d;
      b >>>= 1;
    }
    return product;
  }

  function validCodeword(seq) {
    var bytes = new Array(27);
    for (var i = 0; i < 27; i++) {
      var v = 0;
      for (var j = 0; j < 4; j++) v = 4 * v + BASES.indexOf(seq.charAt(20 + 4 * i + j));
      bytes[i] = v;
    }
    var root = 1;
    for (var power = 1; power <= 8; power++) {
      root = gfMultiply(root, 2);
      var syndrome = 0;
      for (var k = 0; k < 27; k++) syndrome = gfMultiply(syndrome, root) ^ bytes[k];
      if (syndrome) return false;
    }
    return true;
  }

  function validateSequences(seqs) {
    if (!Array.isArray(seqs) || !seqs.length || seqs.length > MAX_N || seqs.length % 3 !== 0)
      throw new Error('A complete FASTA needs N divisible by 3 and at most 65535 strands.');
    var sorted = new Array(seqs.length);
    for (var k = 0; k < seqs.length; k++) {
      var seq = seqs[k];
      if (typeof seq !== 'string' || seq.length !== 148 || !/^[ATGC]+$/.test(seq) ||
          seq.slice(0, 20) !== F || seq.slice(128) !== R)
        throw new Error('Strand ' + (k + 1) + ' must have 148 ATGC bases and the course primers.');
      var index = strandIndex(seq);
      if (index < 1 || index > seqs.length || sorted[index - 1] !== undefined)
        throw new Error('Strand indices must be unique and contiguous from 1 to N.');
      if (!validCodeword(seq)) throw new Error('Strand ' + index + ' has an invalid RS(27,19) codeword.');
      sorted[index - 1] = seq;
    }
    return sorted;
  }

  function parseFasta(text) {
    if (typeof text !== 'string') throw new Error('FASTA input must be text.');
    var lines = text.replace(/^\uFEFF/, '').replace(/\r/g, '').split('\n');
    var seqs = [];
    var current = null;
    for (var k = 0; k < lines.length; k++) {
      var line = lines[k].trim();
      if (!line) continue;
      if (line.charAt(0) === '>') {
        if (!line.slice(1).trim()) throw new Error('Empty FASTA header.');
        if (current !== null) {
          if (!current) throw new Error('Empty FASTA strand.');
          seqs.push(current);
        }
        current = '';
      } else {
        if (current === null) throw new Error('FASTA must start with a header.');
        current += line.toUpperCase();
      }
    }
    if (current === null || !current) throw new Error('FASTA contains no complete strands.');
    seqs.push(current);
    return validateSequences(seqs);
  }

  function isDropped(zeroIndex, H) {
    return zeroIndex < H && zeroIndex % 20 === 0;
  }

  function plan(seqsOrN, coverage) {
    var N = Array.isArray(seqsOrN) ? seqsOrN.length : seqsOrN;
    if (!Number.isSafeInteger(N) || N < 3 || N > MAX_N || N % 3 !== 0)
      throw new Error('N must be divisible by 3 and in 3..65535.');
    coverage = coverage === undefined ? 3 : coverage;
    if (!Number.isSafeInteger(coverage) || coverage < 1 || coverage > 20)
      throw new Error('Coverage must be an integer in 1..20.');
    var D = 2 * N / 3, H = N / 3;
    var droppedStrands = Math.ceil(H / 20);
    var retainedStrands = N - droppedStrands;
    return {
      N: N, D: D, H: H, coverage: coverage,
      droppedStrands: droppedStrands, retainedStrands: retainedStrands,
      reads: retainedStrands * coverage,
      nucleotides: retainedStrands * coverage * 148,
      byteErrors: retainedStrands * coverage * 3,
      baseErrors: retainedStrands * coverage * 3
    };
  }

  function rngFor(seed, index) {
    // Numerical Recipes LCG constants used by matlab/dnas_simulate.m.
    // Independent per-strand streams make output invariant to chunk boundaries.
    var state = (seed ^ Math.imul(index + 1, 0x9e3779b9)) >>> 0;
    return function () {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function reverseComplement(seq) {
    var out = '';
    for (var k = seq.length - 1; k >= 0; k--) out += COMPLEMENT[seq.charAt(k)];
    return out;
  }

  function generateChunk(seqs, start, end, seed, coverage) {
    if (!Array.isArray(seqs)) throw new Error('Pass the array returned by parseFasta.');
    var p = plan(seqs, coverage);
    checkedCount(start, 'start'); checkedCount(end, 'end');
    if (start > end || end > p.N) throw new Error('Chunk bounds must satisfy 0 <= start <= end <= N.');
    seed = seed === undefined ? 20260929 : seed;
    if (!Number.isSafeInteger(seed)) throw new Error('Seed must be an integer.');
    seed = seed >>> 0;
    var parts = [];
    var stats = {
      start: start, end: end, strands: end - start,
      retainedStrands: 0, droppedStrands: 0, reads: 0,
      nucleotides: 0, byteErrors: 0, baseErrors: 0, reverseReads: 0
    };
    for (var i = start; i < end; i++) {
      var seq = seqs[i];
      if (typeof seq !== 'string' || seq.length !== 148 || strandIndex(seq) !== i + 1)
        throw new Error('Expected sorted valid strand index ' + (i + 1) + '.');
      if (isDropped(i, p.H)) { stats.droppedStrands++; continue; }
      var next = rngFor(seed, i);
      // Message payload bytes 0..16 and parity bytes 19..26 only.
      // Three distinct byte errors are shared by every read of this strand,
      // so the consensus also has three correctable RS byte errors.
      var selected = [Math.floor(next() * 17), 19 + Math.floor(next() * 8)];
      var third;
      do { third = Math.floor(next() * 25); if (third >= 17) third += 2; }
      while (third === selected[0] || third === selected[1]);
      selected.push(third);
      var chars = seq.split('');
      var qchars = new Array(148).fill('I');
      for (var m = 0; m < selected.length; m++) {
        var nt = 20 + 4 * selected[m] + Math.floor(next() * 4);
        var oldBase = chars[nt];
        var other = BASES.replace(oldBase, '');
        chars[nt] = other.charAt(Math.floor(next() * 3));
        qchars[nt] = '5';
      }
      var mutated = chars.join('');
      var quality = qchars.join('');
      stats.retainedStrands++;
      for (var copy = 1; copy <= p.coverage; copy++) {
        var reversed = next() < 0.5;
        var read = reversed ? reverseComplement(mutated) : mutated;
        var qual = reversed ? quality.split('').reverse().join('') : quality;
        parts.push('@strand_' + String(i + 1).padStart(5, '0') + '_read_' + copy + '\n' +
          read + '\n+\n' + qual + '\n');
        stats.reads++;
        stats.nucleotides += 148;
        stats.byteErrors += 3;
        stats.baseErrors += 3;
        if (reversed) stats.reverseReads++;
      }
    }
    return { fastq: parts.join(''), stats: stats };
  }

  return { parseFasta: parseFasta, plan: plan, generateChunk: generateChunk };
}());

if (typeof module === 'object' && module.exports) module.exports = DNA_NOISE;
