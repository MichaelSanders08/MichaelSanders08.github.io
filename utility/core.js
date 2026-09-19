export function finite(value, label, min=0, max=1e12) {
  const n=Number(value);
  if (value === '' || value == null || !Number.isFinite(n) || n<min || n>max) throw new Error(`${label} must be between ${min} and ${max}.`);
  return n;
}
export function textStats(text) {
  const words=typeof Intl.Segmenter==='function' ? [...new Intl.Segmenter(undefined,{granularity:'word'}).segment(text)].filter(s=>s.isWordLike).length : (text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)||[]).length;
  return {words,characters:[...text].length,lines:text ? text.split(/\r?\n/).length : 0,readingMinutes:words/200,speakingMinutes:words/130};
}
export function transformText(text, mode) {
  if(mode==='upper')return text.toLocaleUpperCase();
  if(mode==='lower')return text.toLocaleLowerCase();
  if(mode==='title')return text.toLocaleLowerCase().replace(/(^|\s)(\p{L})/gu,(_,space,c)=>space+c.toLocaleUpperCase());
  if(mode==='slug')return text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
  if(mode==='clean')return text.split(/\r?\n/).map(line=>line.trim().replace(/[\t ]+/g,' ')).join('\n').replace(/\n{3,}/g,'\n\n').trim();
  if(mode==='dedupe')return [...new Set(text.split(/\r?\n/).map(line=>line.trim()).filter(Boolean))].join('\n');
  throw new Error('Unknown text transformation.');
}
export function mediaSize(minutes, mbps, copies=1) {
  const bytes=finite(minutes,'Duration',0,1e6)*60*finite(mbps,'Bitrate',0,1e6)*1e6/8*finite(copies,'Copies',1,100);
  return {bytes,gb:bytes/1e9,gib:bytes/(1024**3)};
}
export function resize(width,height,target) {
  const w=finite(width,'Source width',1,100000),h=finite(height,'Source height',1,100000),t=finite(target,'Target width',1,100000);
  if(![w,h,t].every(Number.isInteger))throw new Error('Pixel dimensions must be whole numbers.');
  const gcd=(a,b)=>b?gcd(b,a%b):a;
  const d=gcd(w,h);return {width:t,height:Math.max(1,Math.round(t*h/w)),ratio:`${w/d}:${h/d}`,scale:t/w};
}
export function hex(value) {
  if(typeof value!=='string')throw new Error('Use a 3- or 6-digit hex color.');
  let raw=value.trim().replace(/^#/,'');
  if(/^[0-9a-f]{3}$/i.test(raw))raw=raw.split('').map(c=>c+c).join('');
  if(!/^[0-9a-f]{6}$/i.test(raw))throw new Error('Use a 3- or 6-digit hex color, such as #8b2340.');
  return '#'+raw.toLowerCase();
}
export function contrast(foreground,background) {
  const luminance=color=>{
    const rgb=hex(color).slice(1).match(/../g).map(c=>parseInt(c,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);
    return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
  };
  const a=luminance(foreground),b=luminance(background),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  return {ratio,aa:ratio>=4.5,aaLarge:ratio>=3,aaa:ratio>=7};
}
export function jsonFormat(text,mode='pretty') {
  if(text.length>1_000_000)throw new Error('Keep JSON under 1 MB for a responsive browser.');
  const value=JSON.parse(text);
  function sort(v){return Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;}
  return JSON.stringify(mode==='sort'?sort(value):value,null,mode==='minify'?0:2);
}
export function cleanURL(raw) {
  let url;try{url=new URL(raw);}catch{throw new Error('Enter a full http:// or https:// URL.');}
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error('Use an HTTP(S) URL without embedded credentials.');
  const removed=[];
  const kept=url.search.slice(1).split('&').filter(part=>{
    let key;try{key=decodeURIComponent(part.split('=')[0].replace(/\+/g,' '));}catch{return true;}
    if(/^utm_/i.test(key)||['fbclid','gclid','dclid','msclkid','mc_cid','mc_eid','igshid'].includes(key.toLowerCase())){removed.push(key);return false;}
    return true;
  });
  url.search=kept.join('&');
  return {url:url.href,removed:[...new Set(removed)]};
}
export function scoreDecision(criteria,alternatives) {
  if(!Array.isArray(criteria)||criteria.length<1||criteria.length>8||!Array.isArray(alternatives)||alternatives.length<1||alternatives.length>6)throw new Error('Use 1–8 criteria and 1–6 options.');
  const weights=criteria.map(c=>finite(c.weight,'Weight',0,100)),total=weights.reduce((a,b)=>a+b,0);
  if(!total)throw new Error('Give at least one criterion a weight above zero.');
  return alternatives.map((a,index)=>{
    if(!Array.isArray(a.scores)||a.scores.length!==criteria.length)throw new Error('Every option needs a score for every criterion.');
    return {name:a.name,index,score:a.scores.reduce((sum,value,i)=>sum+finite(value,'Score',0,10)*weights[i],0)/total};
  }).sort((a,b)=>b.score-a.score||a.index-b.index);
}
export function timerRemaining(timer,now=Date.now()) {
  return Math.max(0,timer.running?Math.ceil((timer.endsAt-now)/1000):timer.remaining);
}
export function validateBookmarks(raw) {
  if(!Array.isArray(raw)||raw.length>100)throw new Error('Use a list of at most 100 bookmarks.');
  return raw.map(item=>{
    if(!item||typeof item.title!=='string'||!item.title.trim()||item.title.length>100||typeof item.url!=='string')throw new Error('Each reference needs a title and URL.');
    const url=new URL(item.url);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error('References need HTTP(S) URLs without credentials.');
    return {title:item.title.trim(),url:url.href,note:typeof item.note==='string'?item.note.slice(0,300):''};
  });
}
