import db2 from '../data/international/db2.bin';
import db2Index from '../data/international/db2.idx';
import db3 from '../data/international/db3.bin';
import db3Index from '../data/international/db3.idx';
import db4 from '../data/international/db4.bin';
import db4Index from '../data/international/db4.idx';
import db5 from '../data/international/db5.bin';
import db5Index from '../data/international/db5.idx';
import dictionary from '../data/international/tunstall-v2.bin';
import {createInternationalDatabase,createInternationalEncodedDatabase,internationalRank} from './international.js';
import {internationalSixFiles} from './international-six-data.js';
import type {Piece,Side} from './types.js';
declare const G10_INTERNATIONAL_ENABLED:boolean;
// Original licensed lower and complete six-piece theoretical WLD bytes.
const lower=G10_INTERNATIONAL_ENABLED?createInternationalDatabase([
  {name:'db2',data:db2,indexText:db2Index},
  {name:'db3',data:db3,indexText:db3Index},
  {name:'db4',data:db4,indexText:db4Index},
  {name:'db5',data:db5,indexText:db5Index},
],dictionary):null;

const higher=G10_INTERNATIONAL_ENABLED?createInternationalEncodedDatabase(internationalSixFiles,dictionary):null;
export const internationalCorpus=lower&&higher?Object.freeze({
  probe:(board:readonly Piece[],side:Side)=>board.filter(piece=>piece!==0).length<=5?lower.probe(board,side):higher.probe(board,side),
  locate:internationalRank,
  coverage:()=>{const a=lower.coverage(),b=higher.coverage();return {files:[...a.files,...b.files].sort(),slices:a.slices+b.slices,bytes:a.bytes+b.bytes,maximumPieces:6,scope:'Complete original International2–6 theoretical WLD; current-side captures require exact resolution; game draw history remains separate'};},
}):null;
