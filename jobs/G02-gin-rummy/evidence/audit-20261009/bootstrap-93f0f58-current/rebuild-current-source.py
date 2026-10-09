import pathlib,json,hashlib,subprocess,shutil,os,datetime
base=pathlib.Path('/tmp/G02-current-93f0f58-artifact-20261009')
art=base/'extracted';owner=pathlib.Path('/tmp/G02-source-93f0f58-20261009')
job=owner/'jobs/G02-gin-rummy';mirror=base/'proof-mirror/repo/jobs/G02-gin-rummy';rebuild=base/'rebuild/repo/jobs/G02-gin-rummy'
index=json.loads((art/'initial-presence-bootstrap/source-copy-index.json').read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert index['head']=='93f0f58284f3c0df6c6e4c8e055d208845748f15'
copies=index['copied']+index['additionalCopied'];assert len(copies)==37
immutable={str(p):sha(p) for p in [owner/'.github/workflows/G02.yml']+[job/c['originalPath'] for c in copies if not c['originalPath'].startswith('dist/')]+[p for p in art.rglob('*') if p.is_file()]}
for c in copies:
 source=art/c['artifactPath'].removeprefix('.work/');assert sha(source)==c['sha256'] and source.stat().st_size==c['bytes']
 if not c['originalPath'].startswith('dist/'):
  assert (job/c['originalPath']).read_bytes()==source.read_bytes()
  git_path=(job/c['originalPath']).resolve().relative_to(owner).as_posix()
  assert subprocess.check_output(['git','show','93f0f58284f3c0df6c6e4c8e055d208845748f15:'+git_path],cwd=owner)==source.read_bytes()
 for dst in [mirror/c['originalPath'],rebuild/c['originalPath']]:
  dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,dst);assert dst.read_bytes()==source.read_bytes()
mods=rebuild/'node_modules';mods.mkdir()
prior=pathlib.Path('/tmp/G02-current-38d0-artifact-20261009/rebuild/repo/jobs/G02-gin-rummy/node_modules')
for p in prior.iterdir():
 target=mods/p.name
 if p.is_symlink():target.symlink_to(p.resolve(),target_is_directory=p.resolve().is_dir())
 elif p.name=='zod':shutil.copytree(p,target,copy_function=os.link)
 else:raise AssertionError('Unexpected prior dependency '+p.name)
assert json.loads((mods/'zod/package.json').read_text())['version']=='4.6.5'
deps={str(p):sha(p) for p in (mods/'zod').rglob('*') if p.is_file()}
run=subprocess.run(['node','scripts/build.mjs'],cwd=rebuild,capture_output=True,text=True)
(base/'exact-source-rebuild.log').write_text(run.stdout+run.stderr);assert run.returncode==0,run.stderr
equal=[]
for p in ['dist/core.mjs','dist/cards.mjs','dist/contract.mjs','play.html']:
 assert (rebuild/p).read_bytes()==(mirror/p).read_bytes(),p
 equal.append({'path':p,'bytes':(rebuild/p).stat().st_size,'sha256':sha(rebuild/p),'byteIdentical':True})
assert {p:sha(pathlib.Path(p)) for p in immutable}==immutable
assert {p:sha(pathlib.Path(p)) for p in deps}==deps
result={'closedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'nativeGuardedSources':35,'supplementalInputs':2,'copied37InputFiles':True,'all3BundlesAndHtmlReproduced':equal,'pinnedPhysicalZod':'4.6.5','dependencyContentReusedByHardLink':True,'dependencyGuardFiles':len(deps),'originalBuildExit':run.returncode,'nativeSamplerRun':False,'allNonCompiledInputsExactToCurrentGitSource':True,'allImmutableBeforeAfterGuards':len(immutable),'sourceStart':immutable,'sourceEnd':immutable}
(base/'exact-source-rebuild-CLOSED.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['sourceStart','sourceEnd']}))
