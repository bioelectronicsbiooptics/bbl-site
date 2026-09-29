# Week 4 → Week 12 Drive workflow

The Apps Script web app executes as the authorized owner. Workspace policy requires Google-account sign-in; folders remain private. Students look up the latest submission using their student ID. UUIDs remain internal job identifiers and are not requested or shown in the form.

Project: https://script.google.com/home/projects/1DXl_iCzSk8FYFHU7_peycbM0GA8haKM7Pbv39nzBD2ZnrCMNWTNrOdlA/edit

## Sources and deployment

- `Code.gs`: private FASTA/FASTQ folders, metadata, resumable generation and downloads.
- `noise.js`: bounded deterministic channel, adapted from the original seed-based simulator.
- `Form.html`: submission form, automatic FASTA metadata parsing, automatic generation and Week 12 link.
- `Week12.html`: student-ID lookup, refresh/resume, combined FASTQ and configured decoder downloads.
- `build.cjs`: combines sources and the actual course Decoding.m into one script for the Google editor.

Run `node tools/drive-submission/build.cjs /tmp/Bundle.gs`, paste the result into the existing project's Code.gs, save, and update the existing deployment using a new version. The `/exec` URL stays unchanged. No Google credentials or folder sharing changes are needed.

Script properties `SEMESTER_FOLDER_ID`, `FOLDER_ID` and `FASTQ_FOLDER_ID` hold the `2026_2학기` parent and its two child folder IDs. Existing folders are moved without changing their IDs or contents. They are created once under a script lock. FASTA names remain `studentID_name_DNA.fasta`; each receipt gets its own private JSON generation record and FASTQ part files. The first FASTA description line supplies L/D/ext automatically. Verified legacy metadata may be configured in private Script Properties (metadata_<internal UUID>); it is never guessed from trailing PAD bytes.

## Generation and recovery

New uploads start generation before the server returns and the form automatically resumes partial work. If the browser closes or a request fails, Week 12 Refresh continues from the last persisted part. This is request-driven generation, not an unattended scheduled trigger. Each server request produces one part with at most 3000 original strand indices and a 180-second generation budget; the browser automatically requests the next part. Completed jobs are reused on Refresh, never randomized again.

Three reads per retained strand; three distinct RS byte errors shared across its reads; primers and index unchanged; no indels; approximately half reverse-complemented. One data strand is dropped in XOR groups 1,21,41,... . Original codewords are validated before generation. FASTQ qualities are synthetic (`I` unchanged, `5` substituted), and are ignored by the existing decoder.

Large downloads concatenate bounded server parts in the student's browser into one `noisy_reads.fastq`. `Decoding.m` comes from the same tested course source, with inFile/L/D/ext filled in. The requested student ID selects the latest submission; no class-wide file listing is shown. Internal job IDs pin multipart downloads to one submission.

## Validation

`node tools/drive-submission/test-noise.cjs --matlab` validates deterministic partitioning, FASTQ structure, RS syndromes, reverse complements, and exact MATLAB recovery.

2026-09-29, MATLAB R2026b:
- 27-byte text: 6 reads, Global RS 2, XOR 1, original bytes identical.
- 35,298-byte JPG: 9,195 reads, Global RS 3,065, XOR 52, original bytes identical.

Live deployment validation (version 4, 2026-09-29): existing receipt refreshed into a separate FASTQ folder; downloaded six-read FASTQ and its generated Decoding.m recovered the prior 13-byte text in MATLAB (Global RS 2, XOR 1). A new production submission under the explicit TESTW12 test identifier automatically generated its FASTQ and returned the Week 12 receipt link. A 500,000-byte capacity test produced 41,776,866 FASTQ bytes in 15 parts, each at most 2,889,000 bytes.
