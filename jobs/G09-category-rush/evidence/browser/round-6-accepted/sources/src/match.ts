// Standalone English adapter for the contract's absent game-sdk/match package.
// Deliberately explicit: normalized punctuation/articles/numbers, plural stems,
// and one-edit matching for long answers. Grouping is transitive, as ADR-048 asks.
const ONES=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
// Bounded noun facts, independently sourced in SOURCES-MATCHER.md. Ambiguous
// axes/bases and general -ves/-oes rewrites are deliberately excluded.
const PLURAL_NOUNS:ReadonlyMap<string,string>=new Map([
  ['children','child'],['feet','foot'],['teeth','tooth'],['people','person'],
  ['mice','mouse'],['geese','goose'],['men','man'],['women','woman'],
  ['knives','knife'],['leaves','leaf'],['shelves','shelf'],['lives','life'],
  ['wives','wife'],['halves','half'],['loaves','loaf'],['elves','elf'],
  ['cacti','cactus'],['cactuses','cactus'],['fungi','fungus'],['data','datum'],
  ['syllabi','syllabus'],['analyses','analysis'],['diagnoses','diagnosis'],
  ['oases','oasis'],['theses','thesis'],['crises','crisis'],
  ['potatoes','potato'],['tomatoes','tomato'],['heroes','hero'],['echoes','echo'],
  ['buses','bus'],['busses','bus'],['quizzes','quiz'],['statuses','status'],
  ['wolves','wolf'],['calves','calf'],['gases','gas'],['gasses','gas'],
]);
export function normalize(text:string):{norm:string;compact:string} {
  let norm=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/[‘’'"“”]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/^(a|an|the)\s+/,'');
  const words=norm.split(' '),out:string[]=[];
  for(let i=0;i<words.length;i++){
    const tens=TENS.indexOf(words[i]),one=ONES.indexOf(words[i]);
    if(tens>=2){const extra=ONES.indexOf(words[i+1]);out.push(String(tens*10+(extra>0&&extra<10?extra:0)));if(extra>0&&extra<10)i++;}
    else out.push(one>=0?String(one):words[i]);
  }
  norm=out.join(' ');return {norm,compact:norm.replace(/ /g,'')};
}
export function stem(word:string):string {
  // News is singular in construction; removing its s would equate it with new.
  if(word==='news')return word;
  word=PLURAL_NOUNS.get(word)??word;
  if(word.length>4&&word.endsWith('ies'))return word.slice(0,-3)+'i';
  let base=word;
  if(word.length>4&&/(ches|shes|xes|zes|sses)$/.test(word))base=word.slice(0,-2);
  else if(word.length>3&&word.endsWith('s')&&!/(ss|us|is)$/.test(word))base=word.slice(0,-1);
  // Preserve existing apostrophe-stripped forms such as men's/mens and mice's.
  base=PLURAL_NOUNS.get(base)??base;
  if(base.endsWith('ie'))return base.slice(0,-1);
  if(/[bcdfghjklmnpqrstvwxyz]y$/.test(base))return base.slice(0,-1)+'i';
  return base;
}
function oneEdit(a:string,b:string):boolean {
  if(Math.abs(a.length-b.length)>1)return false;
  let i=0,j=0,diff=0;
  while(i<a.length&&j<b.length){
    if(a[i]===b[j]){i++;j++;continue;}
    if(++diff>1)return false;
    if(a.length>=b.length)i++;
    if(b.length>=a.length)j++;
  }
  return diff+(a.length-i)+(b.length-j)<=1;
}
export function sameAnswer(a:string,b:string):boolean {
  const left=normalize(a),right=normalize(b);
  if(!left.compact||!right.compact)return false;
  if(left.compact===right.compact)return true;
  if(left.norm.split(' ').map(stem).join(' ')===right.norm.split(' ').map(stem).join(' '))return true;
  // Numeric answers never fuzz: 12 distinct from 13, even inside a title.
  return !/[0-9]/.test(left.compact+right.compact)&&Math.min(left.compact.length,right.compact.length)>=6&&oneEdit(left.compact,right.compact);
}
export function groupAnswers(texts:readonly string[]):number[][] {
  const parents=texts.map((_,i)=>i);
  const root=(i:number):number=>{while(parents[i]!==i)i=parents[i];return i;};
  for(let i=0;i<texts.length;i++)for(let j=0;j<i;j++)if(sameAnswer(texts[i],texts[j]))parents[root(i)]=root(j);
  const groups=new Map<number,number[]>();
  for(let i=0;i<texts.length;i++){const key=root(i);const list=groups.get(key)??[];list.push(i);groups.set(key,list);}
  return [...groups.values()].sort((a,b)=>a[0]-b[0]);
}
// The spelling on the sheet decides the initial. Number canonicalization is for
// equality only: "one plum" starts O, even though it matches "1 plum".
export const firstLetter=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  .replace(/[‘’'"“”]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/^(a|an|the)\s+/,'').charAt(0).toUpperCase();
