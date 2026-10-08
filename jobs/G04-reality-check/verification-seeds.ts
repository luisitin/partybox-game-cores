import {createRng} from '../../contract/rng.ts';
export const replaySamplerSeed=0x6040006;
/** Reproducible uniform draws across the uint32 range, excluding duplicates. */
export function replaySeeds():number[]{
 const rng=createRng(replaySamplerSeed),seeds=new Set([1,2,3]);
 while(seeds.size<1003)seeds.add(rng.int(0,0xffffffff));
 return [...seeds];
}
