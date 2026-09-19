import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBackup,validateBackup,storeBackup} from '../utility/backup.js';
const data=()=>({pins:['text'],decision:{criteria:[{name:'Fit',weight:5}],alternatives:[{name:'A',scores:[8]}]},bookmarks:[{title:'Docs',url:'https://example.com/',note:'Reference'}],timer:{remaining:60,running:true,endsAt:61000,minutes:25,task:'Make something'}});
test('portable backup pauses the timer and preserves the whole desk',()=>{
 const backup=makeBackup(data(),1000);assert.equal(backup.data.timer.remaining,60);assert.equal(backup.data.timer.running,false);
 assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(backup)),999999),backup.data);
});
test('invalid section rejects entire backup before any storage write',()=>{
 const backup=makeBackup(data(),1000);backup.data.bookmarks.push({title:'bad',url:'javascript:alert(1)'});
 assert.throws(()=>validateBackup(backup));backup.data.bookmarks=[];backup.data.decision.alternatives[0].scores=[11];assert.throws(()=>validateBackup(backup));
});
test('quota failure restores previous stored values',()=>{
 const values=new Map([['ms-utility-desk:pins','["json"]']]);let calls=0;
 const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>{if(++calls===3)throw new Error('quota');values.set(k,v);},removeItem:k=>values.delete(k)};
 assert.throws(()=>storeBackup(storage,makeBackup(data(),1000).data),/previous desk was kept/);
 assert.deepEqual([...values],[['ms-utility-desk:pins','["json"]']]);
});
