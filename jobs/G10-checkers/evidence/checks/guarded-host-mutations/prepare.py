import pathlib
root=pathlib.Path.cwd()
source=(root/'scripts/build.mjs').read_text()
source=source.replace("from './corpus-pack.mjs'", "from '../../scripts/corpus-pack.mjs'")
source="import {guardHost} from './guard-host.mjs';\n"+source
mark='const browser=await build({'
assert source.count(mark)==1
plugin="const guardedHost={name:'private-guarded-host',setup(api){api.onLoad({filter:/src\\/browser\\.ts$/},async()=>{const original=await readFile('src/browser.ts','utf8'),contents=guardHost(original);await writeFile('.work/host-write-private/guarded-browser.ts',contents);return {contents,loader:'ts'};});}};\n"
source=source.replace(mark,plugin+mark)
assert source.count('plugins:[stub(false,false)]')==1
source=source.replace('plugins:[stub(false,false)]','plugins:[guardedHost,stub(false,false)]')
mark="const template=await readFile('src/play.template.html','utf8')"
assert source.count(mark)==1
source=source.replace(mark,"await writeFile('.work/host-write-private/host.js',browser.outputFiles[0].text.replaceAll('</script','<\\\\/script'));process.stdout.write('Private guarded host compiled; no full page rebuilt.\\n');process.exit(0);\n"+mark)
(root/'.work/host-write-private/build.mjs').write_text(source)
print('Private builder prepared; public source unchanged')
