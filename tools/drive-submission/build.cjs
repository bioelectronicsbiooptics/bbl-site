const fs=require('node:fs'),path=require('node:path');
const here=__dirname,repo=path.resolve(here,'../..');
let code=fs.readFileSync(path.join(here,'noise.js'),'utf8')+'\n'+fs.readFileSync(path.join(here,'Code.gs'),'utf8');
for(const [name,file] of [['FORM_HTML_','Form.html'],['WEEK12_HTML_','Week12.html']]) code+='\nconst '+name+' = '+JSON.stringify(fs.readFileSync(path.join(here,file),'utf8'))+';\n';
code+='\nconst DECODER_SOURCE_ = '+JSON.stringify(fs.readFileSync(path.join(repo,'courses/molecular-information-engineering/week04/dna-storage/downloads/DNA_data_storage_Encoding/Decoding.m'),'utf8'))+';\n';
fs.writeFileSync(process.argv[2]||'/tmp/dnas_work/drive-submission/Bundle.gs',code);console.log('Apps Script bundle built.');
