// Original lower-piece metadata plus complete six-piece indices; no source data copies.
import db2Index from '../data/international/db2.idx';
import db3Index from '../data/international/db3.idx';
import db4Index from '../data/international/db4.idx';
import db5Index from '../data/international/db5.idx';
import {internationalSixIndexes} from './international-six-indexes.js';
export const internationalIndexes=Object.freeze([
  Object.freeze({name:'db2',byteLength:404,indexText:db2Index}),
  Object.freeze({name:'db3',byteLength:21628,indexText:db3Index}),
  Object.freeze({name:'db4',byteLength:1176396,indexText:db4Index}),
  Object.freeze({name:'db5',byteLength:33886572,indexText:db5Index}),
  ...internationalSixIndexes,
]);
