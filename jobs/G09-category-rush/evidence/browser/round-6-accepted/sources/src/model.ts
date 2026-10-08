import type {GameStateBase,TvView,ControllerView} from '../../../contract/contract';

export interface Category {id:string;prompt:string;clarification:string;theme:string}
export interface Settings {rounds:number;roundSeconds:number}
export type Input = {type:'submit';answers:string[]} | {type:'vote';votes:(boolean|null)[]} | {type:'next'};
export interface Group {id:string;text:string;owners:string[];duplicate:boolean;eligible:boolean}
export interface Verdict extends Group {accepted:boolean;points:number}
export interface CategoryResult {categoryId:string;groups:Verdict[]}
export interface RoundResult {round:number;letter:string;categories:Category[];points:Record<string,number>;entries:CategoryResult[]}
export interface State extends GameStateBase {
  order:string[];left:string[];cfg:Settings;round:number;letter:string;usedLetters:string[];
  categories:Category[];answers:Record<string,string[]>;submitted:Record<string,boolean>;
  reviewIndex:number;votes:Record<string,(boolean|null)[]>;reviewed:CategoryResult[];
  scores:Record<string,number>;roundResult:RoundResult|null;history:RoundResult[];phaseClock:number;
}
export interface PublicView extends TvView {
  round:number;totalRounds:number;letter:string;categories:Category[];
  review:null|{categoryIndex:number;category:Category;groups:{id:string;text:string;duplicateCount:number;eligible:boolean}[]};
  roundResult:RoundResult|null;history:RoundResult[];
}
export interface PrivateView extends ControllerView,PublicView {
  submitted:boolean;myAnswers:string[];voted:boolean;myVotes:(boolean|null)[];
}
