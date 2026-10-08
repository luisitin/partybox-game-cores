import db2 from '../data/international/db2.bin';
import db2Index from '../data/international/db2.idx';
import db3 from '../data/international/db3.bin';
import db3Index from '../data/international/db3.idx';
import db4 from '../data/international/db4.bin';
import db4Index from '../data/international/db4.idx';
import db5 from '../data/international/db5.bin';
import db5Index from '../data/international/db5.idx';
import dictionary from '../data/international/tunstall-v2.bin';
import {createInternationalDatabase} from './international.js';
declare const G10_INTERNATIONAL_ENABLED:boolean;
// Fixed licensed outcomes; absent six-piece partitions remain unknown.
export const internationalCorpus=G10_INTERNATIONAL_ENABLED?createInternationalDatabase([
  {name:'db2',data:db2,indexText:db2Index},
  {name:'db3',data:db3,indexText:db3Index},
  {name:'db4',data:db4,indexText:db4Index},
  {name:'db5',data:db5,indexText:db5Index},
],dictionary):null;
