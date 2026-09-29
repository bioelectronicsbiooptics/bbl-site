const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/Code.gs','utf8');
function fixture(){
 const calls=[],files=['later','first'].map((receipt,i)=>{let value={receipt,created:i?'2026-01-01':'2026-01-02',status:'pending'};return {getName:()=>receipt+'.json',getBlob:()=>({getDataAsString:()=>JSON.stringify(value)}),setContent:s=>value=JSON.parse(s)};});
 let locked=false;const ctx={console:{error(){}},LockService:{getScriptLock:()=>({tryLock:()=>{if(locked)return false;locked=true;return true},releaseLock:()=>locked=false})}};vm.createContext(ctx);vm.runInContext(source,ctx);ctx.setup_=()=>{};ctx.folder_=()=>({getFiles:()=>{let i=0;return {hasNext:()=>i<files.length,next:()=>files[i++]};}});ctx.processJob_=(id,budget,held)=>{assert(held&&locked);calls.push(id);return {status:'ready'};};return {ctx,calls,files};
}
let f=fixture();f.ctx.processFastqQueue();assert.deepEqual(f.calls,['first','later']);
f=fixture();f.ctx.processJob_=()=>{throw Error('temporary')};for(let i=0;i<3;i++)f.ctx.processFastqQueue();assert.equal(JSON.parse(f.files[1].getBlob().getDataAsString()).status,'failed');assert.equal(JSON.parse(f.files[0].getBlob().getDataAsString()).status,'pending');f.ctx.processJob_=id=>{f.calls.push(id);return {status:'ready'}};f.ctx.processFastqQueue();assert.deepEqual(f.calls,['later']);
f=fixture();f.ctx.latestForStudent_=()=>({receipt:'first'});f.ctx.resolveJob_=()=>f.files[1];f.ctx.summary_=j=>j;assert.equal(f.ctx.refreshStudentFastq('123').status,'pending');assert.deepEqual(f.calls,[]);
console.log('PASS: FIFO, retry limit, later job recovery, status lookup does not generate');
