# Week 4 → Week 12 Drive workflow

The Apps Script web app executes as the authorized owner. Workspace policy requires Google-account sign-in; folders remain private. Student access is gated by the UUID receipt from the submission page.

Project: https://script.google.com/home/projects/1DXl_iCzSk8FYFHU7_peycbM0GA8haKM7Pbv39nzBD2ZnrCMNWTNrOdlA/edit

## Sources and deployment

- `Code.gs`: private FASTA/FASTQ folders, metadata, resumable generation and downloads.
- `noise.js`: bounded deterministic channel, adapted from the original seed-based simulator.
- `Form.html`: submission form, L/ext capture, automatic generation and Week 12 link.
- `Week12.html`: receipt lookup, refresh/resume, combined FASTQ and configured decoder downloads.
- `build.cjs`: combines sources and the actual course Decoding.m into one script for the Google editor.

Run `node tools/drive-submission/build.cjs /tmp/Bundle.gs`, paste the result into the existing project's Code.gs, save, and update the existing deployment using a new version. The `/exec` URL stays unchanged. No Google credentials or folder sharing changes are needed.

Script properties `FOLDER_ID` and `FASTQ_FOLDER_ID` hold the two folder IDs. They are created once under a script lock. FASTA names remain `studentID_name_DNA.fasta`; each receipt gets its own private JSON generation record and FASTQ part files. Older receipts are supported, but their missing original length/extension must be supplied from the student's encoder log.

## Generation and recovery

New uploads start generation before the server returns and the form automatically resumes partial work. If the browser closes or a request fails, Week 12 Refresh continues from the last persisted part. This is request-driven generation, not an unattended scheduled trigger. Each server request produces one part with at most 3000 original strand indices and a 180-second generation budget; the browser automatically requests the next part. Completed jobs are reused on Refresh, never randomized again.

Three reads per retained strand; three distinct RS byte errors shared across its reads; primers and index unchanged; no indels; approximately half reverse-complemented. One data strand is dropped in XOR groups 1,21,41,... . Original codewords are validated before generation. FASTQ qualities are synthetic (`I` unchanged, `5` substituted), and are ignored by the existing decoder.

Large downloads concatenate bounded server parts in the student's browser into one `noisy_reads.fastq`. `Decoding.m` comes from the same tested course source, with inFile/L/D/ext filled in. No student file or filename listing is exposed without a receipt.

## Validation

`node tools/drive-submission/test-noise.cjs --matlab` validates deterministic partitioning, FASTQ structure, RS syndromes, reverse complements, and exact MATLAB recovery.

2026-09-29, MATLAB R2026b:
- 27-byte text: 6 reads, Global RS 2, XOR 1, original bytes identical.
- 35,298-byte JPG: 9,195 reads, Global RS 3,065, XOR 52, original bytes identical.
