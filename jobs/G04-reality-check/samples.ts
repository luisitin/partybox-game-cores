import {z} from 'zod';
export const realmIds=['emergency-room','dead-or-alive','internet-famous','ancient-or-ikea','name-your-baby','real-town-or-fake','patent-pending','do-not-use'] as const;
export type RealmId=typeof realmIds[number];
export type Kind='number'|'choice'|'century'|'decade'|'bluff';
export const realms:readonly {id:RealmId;name:string;kind:Kind}[]=Object.freeze([
 {id:'emergency-room',name:'Emergency Room',kind:'number'},
 {id:'dead-or-alive',name:'Dead or Alive',kind:'choice'},
 {id:'internet-famous',name:'Internet Famous',kind:'choice'},
 {id:'ancient-or-ikea',name:'Ancient or IKEA',kind:'century'},
 {id:'name-your-baby',name:'Name Your Baby',kind:'decade'},
 {id:'real-town-or-fake',name:'Real Town or Fake',kind:'bluff'},
 {id:'patent-pending',name:'Patent Pending',kind:'bluff'},
 {id:'do-not-use',name:'Do Not Use',kind:'bluff'}
].map(r=>Object.freeze(r)) as {id:RealmId;name:string;kind:Kind}[]);
const base={id:z.string().min(1).max(80),realm:z.enum(realmIds),prompt:z.string().min(1).max(240),hint:z.string().max(200),fact:z.string().max(90)};
const bounded={min:z.number().finite(),max:z.number().finite(),correct:z.number().finite()};
export const rowSchema=z.discriminatedUnion('kind',[
 z.object({...base,kind:z.literal('number'),...bounded}).strict().refine(r=>r.min>=0&&r.max>r.min&&r.max<=1e12&&r.correct>=r.min&&r.correct<=r.max),
 z.object({...base,kind:z.literal('choice'),correct:z.union([z.literal(0),z.literal(1)]),left:z.string().max(80),right:z.string().max(80)}).strict(),
 z.object({...base,kind:z.literal('century'),...bounded}).strict().refine(r=>[r.min,r.max,r.correct].every(Number.isInteger)&&r.min>=-100&&r.max<=100&&r.min<r.max&&r.correct>=r.min&&r.correct<=r.max&&r.correct!==0),
 z.object({...base,kind:z.literal('decade'),...bounded}).strict().refine(r=>[r.min,r.max,r.correct].every(n=>Number.isInteger(n)&&n%10===0)&&r.min>=0&&r.max<=3000&&r.min<r.max&&r.correct>=r.min&&r.correct<=r.max),
 z.object({...base,kind:z.literal('bluff'),correct:z.string().min(1).max(160)}).strict()
]);
export type Row=z.infer<typeof rowSchema>;
export const catalogSchema=z.array(rowSchema).min(16).max(50000).refine(rows=>new Set(rows.map(r=>r.id)).size===rows.length&&realms.every(realm=>rows.filter(r=>r.realm===realm.id).length>=2)&&rows.every(r=>realms.find(realm=>realm.id===r.realm)?.kind===r.kind));
export const plants=Object.freeze(['Yarrow','Clover','Juniper','Willow','Fern','Sorrel','Aster','Thistle','Mallow','Laurel']);
export const harbours=Object.freeze(['Quay','Harbour','Pier','Cove','Landing','Bay','Dock','Inlet','Port','Shore']);
export const materials=Object.freeze(['Copper','Silver','Canvas','Brass','Velvet','Glass','Tin','Cork','Amber','Bamboo']);
export const machines=Object.freeze(['Compass','Trolley','Sieve','Pump','Bell','Crank','Press','Fan','Lifter','Spinner']);
export const defects=Object.freeze(['fraying','warping','rattling','leaking','jamming','splintering','peeling','buckling','sticking','crumbling']);
const names=['Nettlewick','Cloudford','Mossmere','Thimbleton','Ribbonhaven','Petalbridge','Glimmerfen','Driftbarrow','Lanternstead','Pebblebrook','Twinefield','Dewport','Puddlecrest','Leafhaven','Copperglade','Featherford','Cinderquay','Spindlewick','Hollowmere','Tinkerton'];
export function makeSamples():Row[]{
 const rows:Row[]=[];
 for(const realm of realms)for(let i=0;i<20;i++){
  const common={id:`${realm.id}-${i+1}`,realm:realm.id,fact:'This is a made-up workshop story, not a claim about the real world.'};
  if(realm.kind==='number'){
   const min=10**(1+i%4),max=min*100,correct=Math.round(min*Math.exp(Math.log(100)*(i+.5)/20));
   rows.push({...common,kind:'number',min,max,correct,prompt:`How many paper kites visited the imaginary ${names[i]} repair clinic?`,hint:`The story's estimates range from ${min} to ${max}. Equal multiplicative errors score equally.`});
  }else if(realm.kind==='choice'){
   const a=11+(i*17)%89,b=8+(i*31)%91;const left=names[i]!,right=names[(i+7)%20]!;
   rows.push({...common,kind:'choice',left,right,correct:a>=b?0:1,prompt:realm.id==='dead-or-alive'?`Which imaginary clockwork creature has the stronger activity signal: ${left} (${a}) or ${right} (${b})?`:`Which fictional headline spread further: ${left} (${a} shares) or ${right} (${b} shares)?`,hint:'The number in each record is its activity or attention measure.'});
  }else if(realm.kind==='century'){
   const year=i<3?-(470+i*113):1401+i*43,correct=year<0?-Math.ceil(-year/100):Math.ceil(year/100);
   rows.push({...common,kind:'century',min:-15,max:30,correct,prompt:`A pretend ${names[i]} museum label dates its object to ${Math.abs(year)} ${year<0?'BCE':'CE'}. Which century is that?`,hint:'Century 1 covers years 1–100. Negative slider values mean BCE; there is no century zero.'});
  }else if(realm.kind==='decade'){
   const year=1903+i*7;rows.push({...common,kind:'decade',min:1900,max:2100,correct:Math.floor(year/10)*10,prompt:`The invented name ${names[i]} peaked in ${year}. Choose its decade.`,hint:'A decade is labelled by its starting year: for example, 1976 belongs to the 1970s.'});
  }else {
   const correct=realm.id==='real-town-or-fake'?`${plants[i%10]} ${harbours[Math.floor(i/2)%10]}`:realm.id==='patent-pending'?`${materials[i%10]} ${machines[Math.floor(i/2)%10]}`:`${materials[i%10].toLowerCase()} ${defects[Math.floor(i/2)%10]}`;
   const hint=realm.id==='real-town-or-fake'?'Names in this fictional region use two words: a plant and a harbour word.':realm.id==='patent-pending'?'This fictional archive uses two-word titles: a material and a machine.':'Reasons in this fictional workshop use two words: a material and a defect.';
   rows.push({...common,kind:'bluff',correct,prompt:realm.id==='real-town-or-fake'?`Which two-word place is in chapter ${i+1} of the imaginary harbour gazette?`:realm.id==='patent-pending'?`What was the two-word title of imaginary workshop patent ${i+1}?`:`What was the two-word recall reason for imaginary workshop batch ${i+1}?`,hint});
  }
 }
 return catalogSchema.parse(rows);
}
export const sampleRows:readonly Row[]=Object.freeze(makeSamples().map(r=>Object.freeze(r)));
