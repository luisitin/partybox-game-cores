import bytes from '../data/chinook/DB6.bin';
import indexText from '../data/chinook/DB6.idx';
import {createChinookDatabase} from './chinook.js';
declare const G10_CHINOOK_ENABLED:boolean;
// Fixed licensed corpus; initialized once and never changed by a game.
export const chinookCorpus=G10_CHINOOK_ENABLED?createChinookDatabase(bytes,indexText):null;
