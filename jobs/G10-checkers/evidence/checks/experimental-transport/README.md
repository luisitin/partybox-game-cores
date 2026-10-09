Private API experiment; not integrated into the game. Reproduce from the job folder:

```sh
mkdir -p .work/api-src .work/api-dist .work/api-tests
cp evidence/checks/experimental-transport/source.ts.txt .work/api-src/international.ts
cp src/moves.ts src/types.ts .work/api-src/
cp evidence/checks/experimental-transport/test.mjs.txt .work/api-tests/international-transport.test.mjs
printf '%s\n' '{"extends":"../tsconfig.json","include":["api-src/**/*.ts"]}' > .work/api-tsconfig.json
node_modules/.bin/tsc --noEmit -p .work/api-tsconfig.json
node_modules/.bin/esbuild .work/api-src/international.ts --bundle --format=esm --platform=node --target=es2022 --outfile=.work/api-dist/international.mjs
node --test --test-reporter=tap .work/api-tests/international-transport.test.mjs
```

PASS6/6, actual native/independent10k2–5 comparison. Initial5/6 raw failure is retained; the harness incorrectly assumed an original kings slice was uniform. Input snapshots and missing-block honesty remain mandatory. No full-six game-delivery claim.
