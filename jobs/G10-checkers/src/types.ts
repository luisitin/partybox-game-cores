export type Variant='american'|'international';
export type Side=1|-1;
export type Piece=0|1|2|-1|-2;
export interface Move {path:number[];captures:number[];promotes:boolean}
export interface Config {
  variant:Variant;drawPolicy:'official'|'fortyMove';repetition:boolean;turnSeconds:number;
}
export interface DrawClock {kind:'sixteen'|'five'|'diagonalFive';weak:Side;started:number;limit:number}
export interface Position {
  board:Piece[];side:Side;variant:Variant;quietPlies:number;ply:number;
  repetition:Record<string,number>;drawWindows:DrawClock[];
}
