// Intentionally independent, slow oracle: regex number lookup, full Levenshtein
// matrix, graph flood fill, then per-seat scoring. No production imports.
const names=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const tens=['twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
export function referenceNormalize(value:string):{norm:string;compact:string} {
  let s=value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  s=s.replace(/['‘’"“”]/g,'').split(/[^a-z0-9]/).filter(Boolean).join(' ');
  const words=s.split(' ');if(words.length>1&&['the','an','a'].includes(words[0]))words.shift();s=words.join(' ');
  for(let t=tens.length-1;t>=0;t--){
    for(let o=9;o>=1;o--)s=s.replace(new RegExp(`\\b${tens[t]} ${names[o]}\\b`,'g'),String((t+2)*10+o));
    s=s.replace(new RegExp(`\\b${tens[t]}\\b`,'g'),String((t+2)*10));
  }
  for(let i=names.length-1;i>=0;i--)s=s.replace(new RegExp(`\\b${names[i]}\\b`,'g'),String(i));
  return {norm:s,compact:s.split(' ').join('')};
}
function pluralKey(value:string):string {
  return value.split(' ').map(w=>{
    const n=w.length;
    if(n>=5&&w.substring(n-3)==='ies')return w.substring(0,n-3)+'i';
    let result=w;
    if(n>=5&&['ches','shes','xes','zes','sses'].some(e=>w.endsWith(e)))result=w.substring(0,n-2);
    else if(n>=4&&w.substring(n-1)==='s'&&!['ss','us','is'].some(e=>w.endsWith(e)))result=w.substring(0,n-1);
    if(result.slice(-2)==='ie')return result.substring(0,result.length-1);
    if(result.slice(-1)==='y'&&'bcdfghjklmnpqrstvwxyz'.includes(result.slice(-2,-1)))return result.substring(0,result.length-1)+'i';
    return result;
  }).join(' ');
}
function distance(a:string,b:string):number {
  const grid=Array.from({length:a.length+1},()=>Array<number>(b.length+1).fill(0));
  for(let i=0;i<=a.length;i++)grid[i][0]=i;
  for(let j=0;j<=b.length;j++)grid[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)grid[i][j]=Math.min(
    grid[i-1][j]+1,grid[i][j-1]+1,grid[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return grid[a.length][b.length];
}
export function referenceSame(a:string,b:string):boolean {
  const l=referenceNormalize(a),r=referenceNormalize(b);
  if(l.compact===''||r.compact==='')return false;
  return l.compact===r.compact||pluralKey(l.norm)===pluralKey(r.norm)||
    (l.compact.length>=6&&r.compact.length>=6&&!/[0-9]/.test(l.compact+r.compact)&&distance(l.compact,r.compact)<=1);
}
export function referenceGroups(values:readonly string[]):number[][] {
  const pending=new Set(values.map((_,i)=>i)),groups:number[][]=[];
  while(pending.size){
    const start=pending.values().next().value!;pending.delete(start);const component=[start];
    for(let n=0;n<component.length;n++)for(const candidate of [...pending])
      if(referenceSame(values[candidate],values[component[n]])){pending.delete(candidate);component.push(candidate);}
    groups.push(component.sort((a,b)=>a-b));
  }
  return groups;
}
export function referenceCategory(s:{order:string[];round:number;letter:string;categories:{id:string}[];answers:Record<string,string[]>;votes:Record<string,(boolean|null)[]>},index:number){
  const entries:sEntry[]=s.order.flatMap(id=>s.answers[id][index].trim()? [{id,text:s.answers[id][index]}]:[]);
  const groups=referenceGroups(entries.map(e=>e.text));
  return {categoryId:s.categories[index].id,groups:groups.map((indices,n)=>{
    const owners=indices.map(i=>entries[i].id),text=entries[indices[0]].text,duplicate=indices.length>1;
    const start=text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/['‘’"“”]/g,'').split(/[^a-z0-9]/).filter(Boolean);
    if(start.length>1&&['a','an','the'].includes(start[0]))start.shift();
    let eligible=start.join(' ').charAt(0).toUpperCase()===s.letter;
    for(const owner of owners)for(let k=0;k<s.answers[owner].length;k++)
      if(k!==index&&referenceSame(s.answers[owner][k],s.answers[owner][index]))eligible=false;
    const cast=Object.entries(s.votes).filter(([,v])=>typeof v[n]==='boolean');
    const yes=cast.filter(([,v])=>v[n]===true).length,no=cast.length-yes;
    let accepted=cast.length===0||yes>no;
    if(cast.length>0&&yes===no){
      const others=cast.filter(([id])=>!owners.includes(id));
      accepted=others.filter(([,v])=>v[n]===true).length>others.filter(([,v])=>v[n]===false).length;
    }
    accepted=eligible&&accepted;
    return {id:`r${s.round}-c${index}-g${n}`,text,owners,duplicate,eligible,accepted,points:accepted&&!duplicate?1:0};
  })};
}
type sEntry={id:string;text:string};
