// Deploy as the owner; access: Google-account users (Workspace policy).
// FASTA and FASTQ folders stay private. A random submission receipt gates access.
function doGet(e) {
  setup_();
  const isWeek12 = e && e.parameter && e.parameter.view === 'week12';
  const html = isWeek12 ? WEEK12_HTML_.replace('__INITIAL_RECEIPT__', JSON.stringify(e.parameter.receipt ? receipt_(e.parameter.receipt) : '')) : FORM_HTML_;
  return HtmlService.createHtmlOutput(html)
    .setTitle(isWeek12 ? '12주차 FASTQ 복호화 실습' : '4-3강 DNA 실습 제출')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function setup_() {
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const props = PropertiesService.getScriptProperties();
    if (!props.getProperty('FOLDER_ID')) props.setProperty('FOLDER_ID', DriveApp.createFolder('분자정보공학_4주차_DNA_제출').getId());
    if (!props.getProperty('FASTQ_FOLDER_ID')) props.setProperty('FASTQ_FOLDER_ID', DriveApp.createFolder('분자정보공학_12주차_FASTQ').getId());
  } finally { lock.releaseLock(); }
}
function receipt_(value) {
  const s=String(value||'');
  if(!/^[a-zA-Z0-9-]{16,64}$/.test(s)) throw new Error('4주차 제출 접수번호를 입력하세요.');
  return s;
}
function folder_(key) { return DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty(key)); }
function clean_(value,max) {
  const s=String(value||'').trim();
  if(!s||s.length>max||/[\x00-\x1f\/\\]/.test(s))throw new Error('이름과 학번을 확인하세요.');
  return s.replace(/[^\p{L}\p{N}_-]/gu,'_');
}
function submitAssignment(form) {
  setup_();
  const name=clean_(form.student_name,60),id=clean_(form.student_id,40),receipt=receipt_(form.request_id);
  const blob=form.fasta;
  if(!blob||typeof blob.getBytes!=='function'||!/\.(fa|fasta|fna)$/i.test(blob.getName()))throw new Error('FASTA 파일을 선택하세요.');
  const bytes=blob.getBytes();
  if(!bytes.length||bytes.length>20*1024*1024)throw new Error('FASTA는 20 MB 이하여야 합니다.');
  const seqs=DNA_NOISE.parseFasta(blob.getDataAsString('UTF-8'));
  const L=Number(form.original_length),ext=String(form.original_ext||'').trim().toLowerCase();
  if(!Number.isSafeInteger(L)||L<1||L>17*seqs.length*2/3||!/^[a-z0-9]{1,12}$/.test(ext))throw new Error('인코더 출력의 L과 확장자를 확인하세요.');
  let file; const lock=LockService.getScriptLock();lock.waitLock(30000);
  try {
    const same=folder_('FOLDER_ID').getFilesByName(id+'_'+name+'_DNA.fasta');
    while(same.hasNext()){const f=same.next();if(f.getDescription().includes('request='+receipt+'\n')){file=f;break;}}
    if(!file){
      file=folder_('FOLDER_ID').createFile(Utilities.newBlob(bytes,'text/plain',id+'_'+name+'_DNA.fasta'));
      file.setDescription('request='+receipt+'\n학생 이름: '+name+'\n학번: '+id+'\nL='+L+'\next='+ext+'\n가닥 수: '+seqs.length+'\n제출 시각: '+new Date().toISOString());
    }
    ensureJob_(receipt,file,seqs);
  }finally{lock.releaseLock();}
  // Saving FASTA is final even if noise generation fails. Receipt allows resume.
  let fastq;
  try {fastq=processJob_(receipt,180000);}catch(error){fastq={status:'pending',error:error.message};}
  return {ok:true,receiptId:receipt,filename:file.getName(),fastq:fastq};
}
function jobFile_(receipt) {
  const it=folder_('FASTQ_FOLDER_ID').getFilesByName(receipt+'.json');return it.hasNext()?it.next():null;
}
function ensureJob_(receipt,source,seqs) {
  let file=jobFile_(receipt);if(file)return file;
  const desc=source.getDescription(),lm=desc.match(/\nL=(\d+)\n/),em=desc.match(/\next=([a-z0-9]+)\n/);
  const job={version:1,receipt:receipt,sourceId:source.getId(),sourceName:source.getName(),N:seqs.length,D:seqs.length*2/3,L:lm?Number(lm[1]):null,ext:em?em[1]:'',seed:20260929,coverage:3,next:0,parts:[],status:'pending',created:new Date().toISOString()};
  return folder_('FASTQ_FOLDER_ID').createFile(receipt+'.json',JSON.stringify(job),MimeType.PLAIN_TEXT);
}
function resolveJob_(receipt) {
  let file=jobFile_(receipt);if(file)return file;
  // Older submissions are located by their existing receipt; never guess L or ext.
  const sources=folder_('FOLDER_ID').getFiles();
  while(sources.hasNext()){
    const source=sources.next();
    if(source.getDescription().includes('request='+receipt+'\n'))return ensureJob_(receipt,source,DNA_NOISE.parseFasta(source.getBlob().getDataAsString('UTF-8')));
  }
  throw new Error('접수번호에 해당하는 제출 파일이 없습니다.');
}
function summary_(job) {
  return {status:job.status,filename:job.sourceName,receiptId:job.receipt,L:job.L,D:job.D,ext:job.ext,N:job.N,processed:job.next,partCount:job.parts.length,bytes:job.parts.reduce((s,p)=>s+p.bytes,0),coverage:3,seed:job.seed,error:job.error||''};
}
function refreshFastq(receipt) {setup_();return processJob_(receipt_(receipt),180000);}
function processJob_(receipt,budget) {
  const started=Date.now(),lock=LockService.getScriptLock();
  if(!lock.tryLock(1000))return {status:'busy',receiptId:receipt};
  try {
    const jf=resolveJob_(receipt),job=JSON.parse(jf.getBlob().getDataAsString());
    if(job.status==='ready')return summary_(job);
    const seqs=DNA_NOISE.parseFasta(DriveApp.getFileById(job.sourceId).getBlob().getDataAsString('UTF-8'));
    const out=folder_('FASTQ_FOLDER_ID');
    job.status='processing';job.error='';
    let produced=0;
    while(job.next<job.N&&Date.now()-started<budget&&produced<1){
      const end=Math.min(job.next+3000,job.N),partNo=job.parts.length+1;
      const name=job.sourceName.replace(/\.fasta$/i,'')+'_'+receipt+'_part'+String(partNo).padStart(3,'0')+'.fastq';
      const generated=DNA_NOISE.generateChunk(seqs,job.next,end,job.seed,3);
      // Deterministic names make refresh/retry idempotent after interrupted writes.
      const matches=out.getFilesByName(name);let part=matches.hasNext()?matches.next():out.createFile(name,generated.fastq,MimeType.PLAIN_TEXT);
      job.parts.push({id:part.getId(),name:name,bytes:part.getSize(),start:job.next,end:end,stats:generated.stats});
      job.next=end;produced++;jf.setContent(JSON.stringify(job));
    }
    job.status=job.next===job.N?'ready':'processing';jf.setContent(JSON.stringify(job));return summary_(job);
  }finally{lock.releaseLock();}
}
function downloadFastqPart(receipt,index) {
  receipt=receipt_(receipt);index=Number(index);
  const file=jobFile_(receipt);if(!file)throw new Error('먼저 새로고침해 주세요.');
  const job=JSON.parse(file.getBlob().getDataAsString());
  if(job.status!=='ready'||!Number.isInteger(index)||index<0||index>=job.parts.length)throw new Error('FASTQ 생성이 완료되지 않았습니다.');
  const part=DriveApp.getFileById(job.parts[index].id);
  return {data:Utilities.base64Encode(part.getBlob().getBytes()),index:index,bytes:part.getSize()};
}
function getDecoder(receipt,length,extension) {
  const file=jobFile_(receipt_(receipt));if(!file)throw new Error('먼저 FASTQ를 생성하세요.');
  const job=JSON.parse(file.getBlob().getDataAsString());
  const L=job.L===null?Number(length):job.L,ext=job.ext||String(extension||'').toLowerCase();
  if(!Number.isSafeInteger(L)||L<1||L>17*job.D||!/^[a-z0-9]{1,12}$/.test(ext))throw new Error('4주차 인코더 로그의 L과 확장자를 입력하세요.');
  return DECODER_SOURCE_.replace("inFile = 'dnas_sequences.txt';","inFile = 'noisy_reads.fastq';").replace('L = 27;','L = '+L+';').replace('D = 2;','D = '+job.D+';').replace("ext = 'txt';","ext = '"+ext+"';");
}
