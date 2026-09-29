// 홈페이지 내 학생 제출 폼. 배포 실행 주체: 소유자 / 접근: 모든 사용자.
// 폴더는 비공개로 유지합니다. 학생에게 Drive 폴더나 파일 URL을 공개하지 않습니다.
function doGet() {
  setup_();
  return HtmlService.createHtmlOutput(FORM_HTML_)
    .setTitle('4-3강 DNA 실습 제출')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 소유자가 편집기에서 한 번 실행합니다. FOLDER_ID가 없을 때만 폴더 생성.
function setup_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('FOLDER_ID');
  if (!id) {
    id = DriveApp.createFolder('분자정보공학_4주차_DNA_제출').getId();
    props.setProperty('FOLDER_ID', id);
  }
  console.log('제출 폴더: https://drive.google.com/drive/folders/' + id);
}

// 브라우저에서 google.script.run으로 호출되는 유일한 업로드 함수입니다.
// 파일 검사를 서버에서도 반복하여 임의 파일과 잘못된 데이터 저장을 막습니다.
function submitAssignment(form) {
  const clean = (value, max) => {
    const s = String(value || '').trim();
    if (!s || s.length > max || /[\x00-\x1f\/\\]/.test(s)) throw new Error('이름과 학번을 확인하세요.');
    return s.replace(/[^\p{L}\p{N}_-]/gu, '_');
  };
  const name = clean(form.student_name, 60), id = clean(form.student_id, 40);
  const requestId = String(form.request_id || '');
  if (!/^[a-zA-Z0-9-]{16,64}$/.test(requestId)) throw new Error('페이지를 새로 열고 다시 제출하세요.');
  const blob = form.fasta;
  if (!blob || typeof blob.getBytes !== 'function') throw new Error('FASTA 파일을 선택하세요.');
  const bytes = blob.getBytes();
  if (!bytes.length || bytes.length > 20*1024*1024) throw new Error('FASTA 파일은 20 MB 이하여야 합니다.');
  if (!/\.(fa|fasta|fna)$/i.test(blob.getName())) throw new Error('FASTA 확장자를 확인하세요.');
  const lines = blob.getDataAsString('UTF-8').replace(/^\uFEFF/,'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const sequences = []; let current = null;
  for (const line of lines) {
    if (line.startsWith('>')) {
      if (!line.slice(1).trim()) throw new Error('FASTA 이름 줄이 비었습니다.');
      if (current !== null) sequences.push(current);
      current = '';
    } else {
      if (current === null) throw new Error('FASTA는 >이름 줄로 시작해야 합니다.');
      current += line.toUpperCase();
    }
  }
  if (current !== null) sequences.push(current);
  if (!sequences.length || sequences.length > 65535 || sequences.length%3) throw new Error('완전한 인코딩 결과 FASTA를 제출하세요.');
  const indices = new Set(); const alphabet = 'ATGC';
  for (const s of sequences) {
    if (s.length !== 148 || !/^[ATGC]+$/.test(s)) throw new Error('모든 가닥은 A/T/G/C 148 nt여야 합니다.');
    if (!s.startsWith('AGCCTTGTGTCCATCAATCC') || !s.endsWith('TGCGCTATGGTTTGGCTAAT')) throw new Error('강의 실습 primer와 다릅니다.');
    let index=0; for(const c of s.slice(88,96)) index=index*4+alphabet.indexOf(c);
    if(index<1 || index>sequences.length || indices.has(index)) throw new Error('가닥 index가 중복되었거나 누락되었습니다.');
    indices.add(index);
  }
  const props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty('FOLDER_ID');
  if(!folderId) throw new Error('제출 폴더 설정이 아직 완료되지 않았습니다.');
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try {
    const folder=DriveApp.getFolderById(folderId);
    // 재시도 시 같은 요청을 중복 저장하지 않습니다. Drive description에 접수번호 기록.
    const filename=id+'_'+name+'_DNA.fasta';
    const same=folder.getFilesByName(filename);
    while(same.hasNext()){
      const file=same.next();
      if(file.getDescription().includes('request='+requestId+'\n'))return {ok:true,receiptId:requestId,filename:filename};
    }
    const file=folder.createFile(Utilities.newBlob(bytes,'text/plain',filename));
    file.setDescription('request='+requestId+'\n학생 이름: '+name+'\n학번: '+id+'\n가닥 수: '+sequences.length+'\n제출 시각: '+new Date().toISOString());
    return {ok:true,receiptId:requestId,filename:filename};
  } finally {lock.releaseLock();}
}

const FORM_HTML_ = "<!doctype html><html lang=\"ko\"><head><base target=\"_top\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>*{box-sizing:border-box}body{margin:0;padding:20px;color:#16324f;font:16px/1.7 system-ui,sans-serif;background:white}h2{font-size:22px;margin:0 0 12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}label{display:block;font-weight:650}input{width:100%;padding:10px;border:1px solid #9cb1c8;border-radius:7px;font:inherit}.wide{grid-column:1/-1}button{padding:11px 18px;border:0;border-radius:7px;background:#16324f;color:white;font:inherit;cursor:pointer}button:disabled{opacity:.5}#status{white-space:pre-wrap;overflow-wrap:anywhere}.note{color:#56697b;font-size:14px}@media(max-width:560px){.grid{grid-template-columns:1fr}}</style></head><body><h2>이름·학번·FASTA 제출</h2><p>MATLAB에서 복호 결과까지 확인한 FASTA를 올려주세요. 제출 파일은 담당 교수의 Google Drive에 저장됩니다.</p><form id=\"form\"><div class=\"grid\"><div><label for=\"name\">학생 이름</label><input id=\"name\" name=\"student_name\" required maxlength=\"60\" autocomplete=\"name\"></div><div><label for=\"id\">학번</label><input id=\"id\" name=\"student_id\" required maxlength=\"40\"></div><div class=\"wide\"><label for=\"file\">Encoding 결과 FASTA</label><input id=\"file\" name=\"fasta\" type=\"file\" accept=\".fasta,.fa,.fna\" required><span class=\"note\">최대 20 MB · 각 가닥 148 nt</span></div></div><input name=\"request_id\" id=\"request\" type=\"hidden\"><p><button id=\"send\" type=\"submit\">제출</button></p><p id=\"status\" role=\"status\" aria-live=\"polite\"></p></form><p class=\"note\">이름과 학번은 과제 확인용으로 파일명에 기록됩니다. 저장 파일명: 학번_이름_DNA.fasta. 제출 완료와 접수번호가 표시되어야 접수된 것입니다.</p><script>const form=document.getElementById('form'),button=document.getElementById('send'),status=document.getElementById('status');let busy=false;const newRequest=()=>document.getElementById('request').value=crypto.randomUUID();newRequest();form.addEventListener('change',()=>{if(!busy)newRequest();});form.addEventListener('submit',event=>{event.preventDefault();if(busy||!form.reportValidity())return;const file=document.getElementById('file').files[0];if(!file||file.size>20*1024*1024){status.textContent='20 MB 이하 FASTA 파일을 선택하세요.';return;}busy=true;button.disabled=true;status.textContent='Google Drive에 저장 중입니다. 이 페이지를 닫지 마세요.';google.script.run.withSuccessHandler(result=>{busy=false;button.disabled=false;if(!result||result.ok!==true||!result.receiptId){status.textContent='저장 확인을 받지 못했습니다. 다시 시도하세요.';return;}status.textContent='제출 완료\\n파일: '+result.filename+'\\n접수번호: '+result.receiptId;}).withFailureHandler(error=>{busy=false;button.disabled=false;status.textContent='제출 실패: '+error.message;}).submitAssignment(form);});</script></body></html>\n";
