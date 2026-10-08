import ts from 'typescript';

const forbiddenGlobals=new Set(['window','document','localStorage','sessionStorage','navigator','globalThis','self','fetch','XMLHttpRequest','WebSocket','setTimeout','setInterval','requestAnimationFrame','Intl']);
const boundNames=(name,names)=>{
  if(ts.isIdentifier(name))names.add(name.text);
  else if(ts.isObjectBindingPattern(name)||ts.isArrayBindingPattern(name))for(const entry of name.elements)if(ts.isBindingElement(entry))boundNames(entry.name,names);
};
function declarations(node){
  const names=new Set();
  if(ts.isFunctionLike(node)){
    for(const parameter of node.parameters)boundNames(parameter.name,names);
    if(node.name&&ts.isIdentifier(node.name))names.add(node.name.text);
  }
  if(ts.isCatchClause(node)&&node.variableDeclaration)boundNames(node.variableDeclaration.name,names);
  if(ts.isForStatement(node)&&node.initializer&&ts.isVariableDeclarationList(node.initializer))for(const declaration of node.initializer.declarations)boundNames(declaration.name,names);
  if((ts.isForInStatement(node)||ts.isForOfStatement(node))&&ts.isVariableDeclarationList(node.initializer))for(const declaration of node.initializer.declarations)boundNames(declaration.name,names);
  if(ts.isSourceFile(node)||ts.isBlock(node))for(const statement of node.statements){
    if(ts.isVariableStatement(statement))for(const declaration of statement.declarationList.declarations)boundNames(declaration.name,names);
    else if((ts.isFunctionDeclaration(statement)||ts.isClassDeclaration(statement))&&statement.name)names.add(statement.name.text);
    else if(ts.isImportDeclaration(statement)&&statement.importClause){
      if(statement.importClause.name)names.add(statement.importClause.name.text);
      const bindings=statement.importClause.namedBindings;
      if(bindings&&ts.isNamespaceImport(bindings))names.add(bindings.name.text);
      else if(bindings)for(const specifier of bindings.elements)names.add(specifier.name.text);
    }
  }
  return names;
}
function isReference(node){
  const parent=node.parent;
  if((ts.isPropertyAccessExpression(parent)&&parent.name===node)||
    ((ts.isPropertyAssignment(parent)||ts.isMethodDeclaration(parent)||ts.isPropertyDeclaration(parent))&&parent.name===node)||
    ((ts.isVariableDeclaration(parent)||ts.isParameter(parent)||ts.isBindingElement(parent)||ts.isFunctionDeclaration(parent)||ts.isClassDeclaration(parent))&&parent.name===node)||
    ts.isImportSpecifier(parent)||ts.isImportClause(parent)||ts.isNamespaceImport(parent)||ts.isExportSpecifier(parent))return false;
  return true;
}

export function scanPureSource(source,name='game.ts'){
  const tree=ts.createSourceFile(name,source,ts.ScriptTarget.ES2022,true,ts.ScriptKind.TS),failures=[];
  const reject=(node,reason)=>{const at=tree.getLineAndCharacterOfPosition(node.getStart(tree));failures.push({line:at.line+1,column:at.character+1,reason});};
  function walk(node,scopes){
    const scope=declarations(node);if(scope.size)scopes=[...scopes,scope];
    if(ts.isIdentifier(node)&&forbiddenGlobals.has(node.text)&&isReference(node)&&!scopes.some(names=>names.has(node.text)))reject(node,'Host/global operation: '+node.text);
    if(ts.isPropertyAccessExpression(node)){
      if((ts.isIdentifier(node.expression)&&node.expression.text==='Math'&&node.name.text==='random')||
        (ts.isIdentifier(node.expression)&&node.expression.text==='Date'&&node.name.text==='now'))reject(node,'Unseeded randomness or wall clock');
      if(/^(?:localeCompare|toLocaleLowerCase|toLocaleUpperCase)$/.test(node.name.text))reject(node,'Environment-dependent collation');
    }
    if(ts.isImportDeclaration(node)&&ts.isStringLiteral(node.moduleSpecifier)&&node.moduleSpecifier.text.startsWith('node:'))reject(node,'Host I/O module');
    if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword)reject(node,'Dynamic runtime import');
    if(ts.isVariableStatement(node)&&ts.isSourceFile(node.parent)&&!(node.declarationList.flags&ts.NodeFlags.Const))reject(node,'Module-level mutable binding');
    ts.forEachChild(node,child=>walk(child,scopes));
  }
  walk(tree,[]);return failures;
}
