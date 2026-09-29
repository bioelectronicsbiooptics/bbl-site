"use strict";
const config = window.DNA_SUBMISSION || {};
const byId = id => document.getElementById(id);
const form = byId('submission'), fileInput = byId('fasta');
let checkedFile = null, revision = 0;
const httpsURL = value => {try {const u=new URL(value); return u.protocol==='https:' ? u.href : '';} catch {return '';}};
const endpoint = httpsURL(config.endpoint), fileRequest = httpsURL(config.fileRequestUrl);
const connected = Boolean(endpoint || fileRequest);
byId('connection').textContent = connected ? 'NAS 제출 경로가 연결되어 있습니다. 파일 확인 후 제출하세요.' : '현재 NAS 제출 경로 연결 대기 중입니다. 파일을 확인하고 제출용 이름으로 저장할 수 있지만, 아직 전송되지는 않습니다.';
if (fileRequest && !endpoint) byId('send').textContent='NAS 파일 제출 페이지 열기';
const invalidate = () => {checkedFile=null; byId('send').disabled=true;byId('prepare').disabled=true;};
fileInput.addEventListener('change', async()=>{
 const token=++revision; invalidate();byId('result').textContent='';
 const file=fileInput.files[0];if(!file)return;
 try{
  if(!/\.(fa|fasta|fna)$/i.test(file.name)||!file.size||file.size>50*1024*1024)throw Error('1 byte~50 MB의 FASTA 파일을 선택하세요.');
  const text=await file.text();if(token!==revision)return;
  const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  let sequences=[], current=null;
  for(const line of lines){
   if(line.startsWith('>')){if(current!==null)sequences.push(current);if(!line.slice(1).trim())throw Error('FASTA 이름 줄이 비어 있습니다.');current='';}
   else{if(current===null)throw Error('FASTA는 >이름 줄로 시작해야 합니다.');current+=line.toUpperCase();}
  }
  if(current!==null)sequences.push(current);
  if(!sequences.length||sequences.some(s=>s.length!==148||!/^[ATGC]+$/.test(s)))throw Error('각 가닥은 A/T/G/C로 된 148 nt여야 합니다.');
  const indices=new Set();const alphabet='ATGC';
  for(const s of sequences){let index=0;for(const c of s.slice(88,96))index=index*4+alphabet.indexOf(c);if(index<1||indices.has(index))throw Error('고정 index가 없거나 중복되어 있습니다.');indices.add(index);}
  if(sequences.length%3||Math.max(...indices)!==sequences.length)throw Error('전체 인코딩 결과의 연속 index와 가닥 수를 확인하세요.');
  checkedFile=file;byId('check').className='success';byId('check').textContent=`파일 형식 확인: ${sequences.length}가닥 × 148 nt. 복호 성공 여부는 MATLAB에서 확인하세요.`;
  byId('send').disabled=!connected;byId('prepare').disabled=false;
 }catch(error){if(token!==revision)return;byId('check').className='error';byId('check').textContent=error.message;}
});
const filename=()=>[byId('student-id').value,byId('name').value,'DNA'].map(s=>s.trim().replace(/[^\p{L}\p{N}_-]/gu,'_')).join('_')+'.fasta';
function prepare(){if(!form.reportValidity()||!checkedFile)return false;const url=URL.createObjectURL(checkedFile),a=document.createElement('a');a.href=url;a.download=filename();a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return true;}
byId('prepare').addEventListener('click',()=>{if(prepare())byId('result').textContent='제출용 파일을 저장했습니다. NAS 전송은 아직 완료되지 않았습니다.';});
form.addEventListener('submit',async event=>{
 event.preventDefault();if(!checkedFile||!connected||!form.reportValidity())return;
 if(!endpoint){if(prepare()){window.open(fileRequest,'_blank','noopener,noreferrer');byId('result').textContent='NAS 페이지에서 방금 저장한 파일을 올리고 업로드 완료 메시지를 확인하세요.';}return;}
 byId('send').disabled=true;byId('result').textContent='NAS로 전송 중…';
 try{const body=new FormData();body.append('student_name',byId('name').value.trim());body.append('student_id',byId('student-id').value.trim());body.append('file',checkedFile,filename());
 const response=await fetch(endpoint,{method:'POST',body});if(!response.ok)throw Error(`업로드 실패 (${response.status})`);
 const receipt=await response.json();if(receipt.ok!==true||typeof receipt.receiptId!=='string'||!receipt.receiptId)throw Error('NAS의 저장 확인을 받지 못했습니다.');
 byId('result').textContent=`제출 완료 · 접수번호 ${receipt.receiptId}`;
 }catch(error){byId('result').textContent=`${error.message} 제출 완료로 기록되지 않았습니다.`;}finally{byId('send').disabled=false;}
});
