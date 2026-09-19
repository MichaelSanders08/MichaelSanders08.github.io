import {scoreDecision, timerRemaining, validateBookmarks} from './core.js';
export const TOOL_IDS=['text','media','color','decision','focus','json','links','references'];
export function validateBackup(raw, now=Date.now()) {
  if(!raw || raw.format!=='michael-utility-desk' || raw.version!==1) throw new Error('Choose a version 1 Utility Desk backup.');
  const data=raw.data;
  if(!data || !Array.isArray(data.pins) || data.pins.length>TOOL_IDS.length || data.pins.some(id=>!TOOL_IDS.includes(id))) throw new Error('Backup contains invalid pinned tools.');
  const decision=data.decision;
  if(!decision)throw new Error('Backup is missing its decision matrix.');
  scoreDecision(decision.criteria,decision.alternatives);
  for(const item of [...decision.criteria,...decision.alternatives])if(typeof item.name!=='string'||item.name.length>100)throw new Error('Matrix names must be at most 100 characters.');
  const timer=data.timer;
  if(!timer || typeof timer.running!=='boolean' || !Number.isFinite(timer.endsAt) || !Number.isInteger(timer.remaining) || timer.remaining<0 || timer.remaining>10800 || !Number.isFinite(timer.minutes) || timer.minutes<1 || timer.minutes>180 || typeof timer.task!=='string' || timer.task.length>300) throw new Error('Backup contains an invalid focus timer.');
  const remaining=timerRemaining(timer,now);
  if(remaining>10800)throw new Error('Focus sessions cannot exceed three hours.');
  return {pins:[...new Set(data.pins)],decision:{criteria:decision.criteria.map(c=>({name:c.name,weight:Number(c.weight)})),alternatives:decision.alternatives.map(a=>({name:a.name,scores:a.scores.map(Number)}))},bookmarks:validateBookmarks(data.bookmarks),timer:{remaining,running:false,endsAt:0,minutes:timer.minutes,task:timer.task}};
}
export function makeBackup(data,now=Date.now()) {
  return {format:'michael-utility-desk',version:1,exportedAt:new Date(now).toISOString(),data:validateBackup({format:'michael-utility-desk',version:1,data},now)};
}
// Write only after validating every section. Roll back prior values if storage fills.
export function storeBackup(storage,data,prefix='ms-utility-desk:') {
  const previous=Object.keys(data).map(key=>[key,storage.getItem(prefix+key)]);
  try{for(const [key] of previous)storage.setItem(prefix+key,JSON.stringify(data[key]));}
  catch(error){
    let restored=true;
    for(const [key,value] of previous)try{if(value===null)storage.removeItem(prefix+key);else storage.setItem(prefix+key,value);}catch{restored=false;}
    throw new Error(restored?'Restore could not be saved. Your previous desk was kept.':'Storage failed during restore. Keep your backup and reload to inspect saved data.');
  }
}
