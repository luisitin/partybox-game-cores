import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {stem,normalize,sameAnswer,groupAnswers,firstLetter} from '../src/match';
import {scoreCategory} from '../src/scoring';
import {game} from '../src/index';
import {CATEGORIES} from '../content/categories';
import {z} from 'zod';
import {lexicalAuditSchema} from '../content/lexical-schema';
const tuples: [string,string,string][] = [
['child','children','positive'],['foot','feet','positive'],['tooth','teeth','positive'],['person','people','positive'],['mouse','mice','positive'],['goose','geese','positive'],['man','men','positive'],['woman','women','positive'],
['knife','knives','positive'],['leaf','leaves','positive'],['shelf','shelves','positive'],['life','lives','positive'],['wife','wives','positive'],['half','halves','positive'],['loaf','loaves','positive'],['elf','elves','positive'],
['cactus','cacti','positive'],['fungus','fungi','positive'],['datum','data','positive'],['syllabus','syllabi','positive'],['analysis','analyses','positive'],['diagnosis','diagnoses','positive'],['oasis','oases','positive'],['thesis','theses','positive'],['crisis','crises','positive'],
['potato','potatoes','positive'],['tomato','tomatoes','positive'],['sheep','sheep','positive'],['fish','fish','positive'],['deer','deer','positive'],['species','species','positive'],['aircraft','aircraft','positive'],
['hero','heroes','positive'],['echo','echoes','positive'],['bus','buses','positive'],['quiz','quizzes','positive'],['status','statuses','positive'],['roof','roofs','positive'],['chief','chiefs','positive'],['proof','proofs','positive'],['wolf','wolves','positive'],['calf','calves','positive'],['gas','gases','positive'],['gas','gasses','positive'],['cactus','cactuses','positive'],['house','houses','positive'],
['news','new','negative'],['chief','chieves','negative'],['proof','prooves','negative'],['roof','rooves','nonselected-variant'],['axis','axe','negative'],['axis','axes','ambiguous'],['axe','axes','ambiguous'],['basis','base','negative'],['basis','bases','ambiguous'],['base','bases','ambiguous'],['species','specie','semantic-fuzzy-guard'],['bus','business','negative'],['leaf','leave','negative'],['knife','knave','negative'],['status','statue','semantic-fuzzy-guard'],['house','hose','negative']
];
const state=game.init({players:[{id:'a',name:'A',avatarId:'face0',connected:true,bot:false},{id:'b',name:'B',avatarId:'face1',connected:true,bot:false}],settings:{rounds:1,roundSeconds:30},seed:177,now:0});
const rows=tuples.map(([a,b,kind])=>{
 const s=structuredClone(state);s.letter=firstLetter(a);s.answers={a:Array(12).fill(''),b:Array(12).fill('')};s.answers.a[0]=a;s.answers.b[0]=b;s.votes={};
 const score=scoreCategory(s,0);
 const own=structuredClone(s);own.answers.b[0]='';own.answers.a[1]=b;
 const ownScore=scoreCategory(own,0).groups.reduce((n,g)=>n+g.points,0)+scoreCategory(own,1).groups.reduce((n,g)=>n+g.points,0);
 const keys=(v:string)=>normalize(v).norm.split(' ').map(stem).join(' ');
 return{a,b,kind,same:sameAnswer(a,b),stemA:keys(a),stemB:keys(b),groups:groupAnswers([a,b]),awarded:score.groups.reduce((n,g)=>n+g.points,0),ownAwarded:ownScore};
});
const hash=(name:string)=>createHash('sha256').update(readFileSync(name)).digest('hex');
const positives=rows.filter(row=>row.kind==='positive'),negatives=rows.filter(row=>row.kind==='negative');
const report={sourceHashes:{match:hash('src/match.ts'),core:hash('src/index.ts'),scoring:hash('src/scoring.ts'),data:hash('content/categories.json')},cases:rows.length,positive:positives.length,positiveSame:positives.filter(row=>row.same).length,positiveFailures:positives.filter(row=>!row.same),stemFailures:positives.filter(row=>row.stemA!==row.stemB),negative:negatives.length,negativeFalseMerges:negatives.filter(row=>row.same),rows};
lexicalAuditSchema.parse(report);
writeFileSync('evidence/lexical-audit.schema.json',JSON.stringify(z.toJSONSchema(lexicalAuditSchema),null,2)+'\n');
const label=process.argv.includes('--baseline')?'baseline':'after';
writeFileSync(`evidence/lexical-audit-${label}.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
