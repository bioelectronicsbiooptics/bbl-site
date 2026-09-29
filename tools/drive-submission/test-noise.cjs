'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const noise = require('./noise.js');
const dnas = require('../../courses/molecular-information-engineering/week04/dna-storage/web/dnastore.js');

const outRoot = '/tmp/dnas_work/week12-validation';
const decoderPath = path.resolve(__dirname,
  '../../courses/molecular-information-engineering/week04/dna-storage/downloads/DNA_data_storage_Encoding/Decoding.m');
const matlab = '/Applications/MATLAB_R2026b.app/bin/matlab';
const fixtures = [
  { name: 'name27', fasta: '/tmp/dnas_work/guide_validation/dnas_out.fasta',
    original: '/tmp/dnas_work/guide_validation/decoded.txt', length: 27, D: 2, ext: 'txt' },
  { name: 'photo35298', fasta: '/tmp/dnas_work/dna_helix_encoded.fasta',
    original: '/tmp/dnas_work/guide_validation/dna_helix_demo.jpg', length: 35298, D: 2078, ext: 'jpg' }
];

function records(fastq) {
  const lines = fastq.trimEnd().split('\n');
  assert.equal(lines.length % 4, 0);
  const out = [];
  for (let i = 0; i < lines.length; i += 4) {
    assert.match(lines[i], /^@strand_\d+_read_\d+$/);
    assert.equal(lines[i + 2], '+');
    assert.equal(lines[i + 1].length, 148);
    assert.equal(lines[i + 3].length, 148);
    out.push({ header: lines[i], seq: lines[i + 1], quality: lines[i + 3] });
  }
  return out;
}

function validateReads(seqs, fastq, plan) {
  const seen = new Map();
  let reverseReads = 0;
  const rsExample = { checked: 0, correctedThree: 0 };
  for (const r of records(fastq)) {
    const index = Number(r.header.match(/^@strand_(\d+)/)[1]);
    const original = seqs[index - 1];
    assert.equal(index <= plan.H && (index - 1) % 20 === 0, false,
      'XOR-dropped data row must have no reads');
    let oriented = r.seq, quality = r.quality;
    if (!oriented.startsWith(dnas.F_PRIMER)) {
      oriented = dnas.reverseComplement(oriented);
      quality = quality.split('').reverse().join('');
      reverseReads++;
    }
    assert.equal(oriented.slice(0, 20), dnas.F_PRIMER);
    assert.equal(oriented.slice(128), dnas.R_PRIMER);
    assert.equal(oriented.slice(88, 96), original.slice(88, 96));
    const ntChanges = [];
    const byteChanges = new Set();
    for (let p = 0; p < 148; p++) {
      if (oriented[p] !== original[p]) {
        ntChanges.push(p);
        const byte = Math.floor((p - 20) / 4);
        assert.ok(byte <= 16 || (byte >= 19 && byte <= 26));
        byteChanges.add(byte);
        assert.equal(quality[p], '5');
      } else assert.equal(quality[p], 'I');
    }
    assert.equal(ntChanges.length, 3);
    assert.equal(byteChanges.size, 3);
    const signature = ntChanges.join(',') + ':' + oriented;
    if (seen.has(index)) assert.equal(seen.get(index), signature,
      'every read of a strand must share its three errors');
    else seen.set(index, signature);
    const decoded = dnas.rsDecode(dnas.dnaToBytes(oriented.slice(20, 128)));
    assert.ok(decoded, 'RS must correct the noisy codeword');
    assert.equal(decoded.corrected, 3);
    assert.deepEqual(decoded.message, dnas.dnaToBytes(original.slice(20, 96)));
    rsExample.checked++;
    rsExample.correctedThree++;
  }
  assert.equal(seen.size, plan.retainedStrands);
  assert.equal(rsExample.checked, plan.reads);
  return { reverseReads, rsExample };
}

function makeDecoder(dir, fixture) {
  let script = fs.readFileSync(decoderPath, 'utf8');
  script = script.replace(/^inFile = .*;.*$/m, "inFile = 'reads.fastq';")
    .replace(/^L = .*;.*$/m, `L = ${fixture.length};`)
    .replace(/^D = .*;.*$/m, `D = ${fixture.D};`)
    .replace(/^ext = .*;.*$/m, `ext = '${fixture.ext}';`);
  assert.match(script, /inFile = 'reads.fastq'/);
  fs.writeFileSync(path.join(dir, 'Decoding.m'), script);
}

function runFixture(fixture, withMatlab) {
  const dir = path.join(outRoot, fixture.name);
  fs.mkdirSync(dir, { recursive: true });
  const seqs = noise.parseFasta(fs.readFileSync(fixture.fasta, 'utf8'));
  const plan = noise.plan(seqs);
  assert.equal(plan.D, fixture.D);
  const full = noise.generateChunk(seqs, 0, seqs.length);
  assert.equal(full.stats.reads, plan.reads);
  assert.equal(full.stats.droppedStrands, plan.droppedStrands);
  assert.equal(full.stats.byteErrors, plan.byteErrors);
  const partition = Math.min(103, seqs.length);
  const pieces = [];
  for (let start = 0; start < seqs.length; start += partition)
    pieces.push(noise.generateChunk(seqs, start, Math.min(seqs.length, start + partition)).fastq);
  assert.equal(pieces.join(''), full.fastq, 'FASTQ must be invariant to chunk boundaries');
  const readEvidence = validateReads(seqs, full.fastq, plan);
  const mutated = seqs[0].split('');
  mutated[20] = mutated[20] === 'A' ? 'T' : 'A';
  assert.throws(() => noise.parseFasta('>bad\n' + mutated.join('') + '\n' +
    seqs.slice(1).map((s, i) => '>s' + i + '\n' + s + '\n').join('')), /invalid RS/);
  fs.writeFileSync(path.join(dir, 'reads.fastq'), full.fastq);
  makeDecoder(dir, fixture);
  let matlabEvidence = null;
  if (withMatlab) {
    const child = spawnSync(matlab, ['-batch', 'Decoding'], {
      cwd: dir, encoding: 'utf8', timeout: 240000, maxBuffer: 8 * 1024 * 1024
    });
    const log = (child.stdout || '') + (child.stderr || '');
    fs.writeFileSync(path.join(dir, 'matlab.log'), log);
    if (child.error) throw child.error;
    assert.equal(child.status, 0, log);
    assert.match(log, /XOR 복원 (?:1|52)\b/);
    assert.match(log, /Global RS [1-9]\d*/);
    assert.match(log, /데이터 행 전부 확보/);
    const actual = fs.readFileSync(path.join(dir, 'decoded.' + fixture.ext));
    const original = fs.readFileSync(fixture.original);
    assert.deepEqual(actual, original, 'MATLAB decoded bytes must match the original');
    matlabEvidence = {
      xor: Number(log.match(/XOR 복원 (\d+)/)[1]),
      globalRS: Number(log.match(/Global RS (\d+)/)[1]),
      bytesIdentical: actual.length
    };
    assert.equal(matlabEvidence.xor, plan.droppedStrands);
    assert.equal(matlabEvidence.globalRS, plan.retainedStrands);
  }
  return { fixture: fixture.name, plan, reverseReads: readEvidence.reverseReads,
    allReadsCorrectedThree: readEvidence.rsExample.correctedThree, matlab: matlabEvidence };
}

fs.mkdirSync(outRoot, { recursive: true });
const withMatlab = process.argv.includes('--matlab');
const evidence = fixtures.map(f => runFixture(f, withMatlab));
fs.writeFileSync(path.join(outRoot, 'noise-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence, null, 2));
