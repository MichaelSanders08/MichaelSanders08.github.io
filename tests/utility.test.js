import test from 'node:test';
import assert from 'node:assert/strict';
import {textStats,transformText,mediaSize,resize,contrast,hex,jsonFormat,cleanURL,scoreDecision,timerRemaining,validateBookmarks} from '../utility/core.js';
test('Unicode counts and reversible text operations',()=>{
 assert.equal(textStats('Hello world').words,2);assert.equal(textStats('A😀').characters,2);assert.equal(textStats('').lines,0);
 assert.equal(transformText('  hello   world\n\n\nagain  ','clean'),'hello world\n\nagain');
 assert.equal(transformText('Crème & culture!','slug'),'creme-culture');assert.equal(transformText('a\na\nb','dedupe'),'a\nb');
});
test('media units distinguish GB and GiB and reject invalid input',()=>{
 const result=mediaSize(60,100,2);assert.equal(result.gb,90);assert.ok(Math.abs(result.gib-83.8190317154)<1e-8);
 assert.throws(()=>mediaSize(-1,100));assert.throws(()=>mediaSize('',100));assert.throws(()=>mediaSize(1,Infinity));
 assert.deepEqual(resize(3840,2160,1920),{width:1920,height:1080,ratio:'16:9',scale:.5});assert.throws(()=>resize(0,1,1));
});
test('WCAG black/white extrema, symmetry, and thresholds',()=>{
 assert.equal(contrast('#000','#fff').ratio,21);assert.equal(contrast('#ffffff','#ffffff').ratio,1);
 assert.equal(contrast('#123456','#f3eeee').ratio,contrast('#f3eeee','#123456').ratio);
 assert.equal(contrast('#777','#fff').aa,false);assert.equal(contrast('#000','#fff').aaa,true);
 assert.equal(hex('ABC'),'#aabbcc');assert.throws(()=>hex('red'));
});
test('JSON sorting preserves arrays and proto keys without mutating prototypes',()=>{
 const out=JSON.parse(jsonFormat('{"z":[2,1],"__proto__":{"polluted":true},"a":1}','sort'));
 assert.deepEqual(out.z,[2,1]);assert.equal({}.polluted,undefined);assert.equal(out.__proto__.polluted,true);
 assert.equal(jsonFormat('{"x": 2}','minify'),'{"x":2}');assert.throws(()=>jsonFormat('{bad}'));
});
test('URL cleaning keeps destination parameters/fragments and rejects executable schemes',()=>{
 const result=cleanURL('https://example.com/path?id=8&utm_source=test&gclid=x#notes');
 assert.equal(result.url,'https://example.com/path?id=8#notes');assert.deepEqual(result.removed,['utm_source','gclid']);
 assert.throws(()=>cleanURL('javascript:alert(1)'));assert.throws(()=>cleanURL('https://me:secret@example.com'));assert.throws(()=>cleanURL('not a url'));
});
test('decision weights normalize, ties stay stable, invalid ratings fail',()=>{
 const criteria=[{weight:3},{weight:1}],options=[{name:'A',scores:[10,0]},{name:'B',scores:[5,5]}];
 assert.equal(scoreDecision(criteria,options)[0].score,7.5);assert.equal(scoreDecision(criteria,options)[0].name,'A');
 assert.throws(()=>scoreDecision([{weight:0}],[{name:'A',scores:[1]}]));assert.throws(()=>scoreDecision(criteria,[{name:'A',scores:[11,0]}]));
});
test('timer catches up across inactive tabs and clamps at zero',()=>{
 assert.equal(timerRemaining({running:true,endsAt:10000},4001),6);assert.equal(timerRemaining({running:true,endsAt:10000},11000),0);
 assert.equal(timerRemaining({running:false,remaining:300},999999),300);
});
test('reference imports reject non-web URLs and validate before replacement',()=>{
 assert.equal(validateBookmarks([{title:' Docs ',url:'https://example.com',note:'Useful'}])[0].title,'Docs');
 assert.throws(()=>validateBookmarks([{title:'Bad',url:'javascript:alert(1)'}]));assert.throws(()=>validateBookmarks('bad'));
});
test('URL cleanup preserves encoding of nontracking parameters',()=>{
 assert.equal(cleanURL('https://example.com/?q=a%20b&path=%2F~&utm_source=x').url,'https://example.com/?q=a%20b&path=%2F~');
});
