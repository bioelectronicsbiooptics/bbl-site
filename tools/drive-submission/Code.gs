// Deploy as the owner; access: Google-account users (Workspace policy).
// FASTA and FASTQ folders stay private. Student ID selects the latest submission. Internal UUIDs identify jobs only.
function doGet(e) {
  setup_();
  const isWeek12 = e && e.parameter && e.parameter.view === 'week12';
  const html = isWeek12 ? WEEK12_HTML_.replace('__INITIAL_STUDENT__', JSON.stringify(e.parameter.student ? clean_(e.parameter.student,40) : '')) : FORM_HTML_;
  return HtmlService.createHtmlOutput(html)
    .setTitle(isWeek12 ? '12주차 FASTQ 복호화 실습' : '4-3강 DNA 실습 제출')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function setup_() {
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const props = PropertiesService.getScriptProperties();
    let semesterId=props.getProperty('SEMESTER_FOLDER_ID');
    if(!semesterId){
      const root=DriveApp.getRootFolder(),matches=root.getFoldersByName('2026_2학기');
      const semester=matches.hasNext()?matches.next():root.createFolder('2026_2학기');
      semesterId=semester.getId();props.setProperty('SEMESTER_FOLDER_ID',semesterId);
    }
    const semester=DriveApp.getFolderById(semesterId);
    if (!props.getProperty('FOLDER_ID')) props.setProperty('FOLDER_ID', semester.createFolder('분자정보공학_4주차_DNA_제출').getId());
    if (!props.getProperty('FASTQ_FOLDER_ID')) props.setProperty('FASTQ_FOLDER_ID', semester.createFolder('분자정보공학_12주차_FASTQ').getId());
    if(props.getProperty('SEMESTER_LAYOUT_V1')!==semesterId){
      DriveApp.getFolderById(props.getProperty('FOLDER_ID')).moveTo(semester);
      DriveApp.getFolderById(props.getProperty('FASTQ_FOLDER_ID')).moveTo(semester);
      props.setProperty('SEMESTER_LAYOUT_V1',semesterId);
    }
  } finally { lock.releaseLock(); }
}
function receipt_(value) {
  const s=String(value||'');
  if(!/^[a-zA-Z0-9-]{16,64}$/.test(s)) throw new Error('제출 파일을 다시 조회해 주세요.');
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
  const text=blob.getDataAsString('UTF-8'),seqs=DNA_NOISE.parseFasta(text);
  const {L,ext}=fastaMetadata_(text,seqs.length);
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
  return {ok:true,studentId:id,filename:file.getName()};
}
function jobFile_(receipt) {
  const it=folder_('FASTQ_FOLDER_ID').getFilesByName(receipt+'.json');return it.hasNext()?it.next():null;
}
function fastaMetadata_(text,N) {
  const header=String(text).replace(/^\uFEFF/,'').split(/\r?\n/).find(line=>line.startsWith('>'))||'';
  const l=header.match(/(?:^|\s)L=(\d+)(?=\s|$)/),d=header.match(/(?:^|\s)D=(\d+)(?=\s|$)/),e=header.match(/(?:^|\s)ext=([A-Za-z0-9]{1,12})(?=\s|$)/);
  if(!l||!d||!e)throw new Error('이전 형식의 FASTA입니다. 홈페이지의 최신 5단계 코드로 파일을 다시 저장해 주세요.');
  const L=Number(l[1]),D=Number(d[1]),ext=e[1].toLowerCase();
  if(!Number.isSafeInteger(L)||L<1||L>17*D||D*1.5!==N)throw new Error('FASTA에 기록된 복호 정보와 가닥 수가 맞지 않습니다.');
  return {L,D,ext};
}
function sourceMetadata_(source,N) {
  const desc=source.getDescription(),lm=desc.match(/\nL=(\d+)\n/),em=desc.match(/\next=([a-z0-9]+)\n/);
  if(lm&&em)return {L:Number(lm[1]),ext:em[1]};
  const receipt=(desc.match(/request=([^\n]+)/)||[])[1];
  // Only explicitly verified legacy metadata is configured by the instructor.
  const saved=receipt&&PropertiesService.getScriptProperties().getProperty('metadata_'+receipt);
  if(saved)return JSON.parse(saved);
  try{return fastaMetadata_(source.getBlob().getDataAsString('UTF-8'),N);}catch(_){return {L:null,ext:''};}
}
function ensureJob_(receipt,source,seqs) {
  let file=jobFile_(receipt);
  const meta=sourceMetadata_(source,seqs.length);
  if(file){
    const job=JSON.parse(file.getBlob().getDataAsString());
    if(job.L===null&&meta.L!==null){job.L=meta.L;job.ext=meta.ext;file.setContent(JSON.stringify(job));}
    return file;
  }
  const job={version:1,receipt:receipt,sourceId:source.getId(),sourceName:source.getName(),N:seqs.length,D:seqs.length*2/3,L:meta.L,ext:meta.ext,seed:20260929,coverage:3,next:0,parts:[],status:'pending',created:new Date().toISOString()};
  return folder_('FASTQ_FOLDER_ID').createFile(receipt+'.json',JSON.stringify(job),MimeType.PLAIN_TEXT);
}
function latestForStudent_(student) {
  const id=clean_(student,40),it=folder_('FOLDER_ID').getFiles();let found=null,date=-1;
  while(it.hasNext()){const file=it.next();if(!file.getDescription().includes('\n학번: '+id+'\n'))continue;const t=file.getDateCreated().getTime();if(t>date){found=file;date=t;}}
  if(!found)throw new Error('이 학번으로 제출한 FASTA가 없습니다.');
  const receipt=receipt_((found.getDescription().match(/request=([^\n]+)/)||[])[1]);
  const existing=jobFile_(receipt);
  if(existing){const job=JSON.parse(existing.getBlob().getDataAsString());if(job.L===null){const meta=sourceMetadata_(found,job.N);if(meta.L!==null){job.L=meta.L;job.ext=meta.ext;existing.setContent(JSON.stringify(job));}}}
  return {file:found,receipt};
}
function refreshStudentFastq(student) {setup_();return summary_(JSON.parse(resolveJob_(latestForStudent_(student).receipt).getBlob().getDataAsString()));}
function downloadStudentPart(student,index) {return downloadFastqPart(latestForStudent_(student).receipt,index);}
function getStudentDecoder(student) {return getDecoder(latestForStudent_(student).receipt);}

function resolveJob_(receipt) {
  let file=jobFile_(receipt);if(file)return file;
  // Older submissions are located by their existing receipt; never guess L or ext.
  const sources=folder_('FOLDER_ID').getFiles();
  while(sources.hasNext()){
    const source=sources.next();
    if(source.getDescription().includes('request='+receipt+'\n'))return ensureJob_(receipt,source,DNA_NOISE.parseFasta(source.getBlob().getDataAsString('UTF-8')));
  }
  throw new Error('제출 파일을 찾을 수 없습니다.');
}
function summary_(job) {
  return {status:job.status,filename:job.sourceName,receiptId:job.receipt,L:job.L,D:job.D,ext:job.ext,N:job.N,processed:job.next,partCount:job.parts.length,bytes:job.parts.reduce((s,p)=>s+p.bytes,0),coverage:3,seed:job.seed,error:job.error||''};
}
function refreshFastq(receipt) {setup_();return summary_(JSON.parse(resolveJob_(receipt_(receipt)).getBlob().getDataAsString()));}
// Install one owner-owned time trigger: processFastqQueue, every minute.
// The lock keeps overlapping triggers from processing submissions out of order.
function processFastqQueue() {
  setup_();
  const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
  const deadline=Date.now()+240000;
  try {
    const files=folder_('FASTQ_FOLDER_ID').getFiles(),queue=[];
    while(files.hasNext()){
      const file=files.next();if(!file.getName().endsWith('.json'))continue;
      const job=JSON.parse(file.getBlob().getDataAsString());
      if(job.status==='pending'||job.status==='processing')queue.push({file,job});
    }
    queue.sort((a,b)=>a.job.created.localeCompare(b.job.created)||a.job.receipt.localeCompare(b.job.receipt));
    for(const item of queue){
      while(Date.now()<deadline){
        try {
          const result=processJob_(item.job.receipt,Math.min(180000,deadline-Date.now()),true);
          if(result.status==='ready')break;
        }catch(error){
          const job=JSON.parse(item.file.getBlob().getDataAsString());
          job.error=String(error.message||error);job.attempts=(job.attempts||0)+1;
          if(job.attempts>=3)job.status='failed';
          item.file.setContent(JSON.stringify(job));
          console.error(item.job.receipt+': '+job.error);
          return; // Retry this submission on the next tick before later files.
        }
      }
      if(Date.now()>=deadline)return;
    }
  }finally{lock.releaseLock();}
}
function processJob_(receipt,budget,lockHeld) {
  const started=Date.now(),lock=LockService.getScriptLock();
  if(!lockHeld&&!lock.tryLock(1000))return {status:'busy',receiptId:receipt};
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
  }finally{if(!lockHeld)lock.releaseLock();}
}
function downloadFastqPart(receipt,index) {
  receipt=receipt_(receipt);index=Number(index);
  const file=jobFile_(receipt);if(!file)throw new Error('먼저 새로고침해 주세요.');
  const job=JSON.parse(file.getBlob().getDataAsString());
  if(job.status!=='ready'||!Number.isInteger(index)||index<0||index>=job.parts.length)throw new Error('FASTQ 생성이 완료되지 않았습니다.');
  const part=DriveApp.getFileById(job.parts[index].id);
  return {data:Utilities.base64Encode(part.getBlob().getBytes()),index:index,bytes:part.getSize()};
}
function getDecoder(receipt) {
  const file=jobFile_(receipt_(receipt));if(!file)throw new Error('먼저 FASTQ를 생성하세요.');
  const job=JSON.parse(file.getBlob().getDataAsString());
  const L=job.L,ext=job.ext;
  if(!Number.isSafeInteger(L)||L<1||L>17*job.D||!/^[a-z0-9]{1,12}$/.test(ext))throw new Error('이전 형식의 파일입니다. 최신 5단계 인코더로 다시 저장해 제출하세요.');
  return DECODER_SOURCE_.replace("inFile = 'dnas_sequences.txt';","inFile = 'noisy_reads.fastq';").replace('L = 27;','L = '+L+';').replace('D = 2;','D = '+job.D+';').replace("ext = 'txt';","ext = '"+ext+"';");
}
