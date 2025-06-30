import type { Node, SourceFile, ImportDeclaration, TypeReferenceNode, PropertyAccessExpression, Identifier, NamedImports } from "typescript";

const extractDependencies = (node: Node, sourceFile: SourceFile): string[] => {
  const dependencies: string[] = [];
  const ts = require("typescript");
  
  const visitNode = (n: Node) => {
    // Look for import statements
    if (ts.isImportDeclaration(n)) {
      const importDecl = n as ImportDeclaration;
      const importClause = importDecl.importClause;
      if (importClause && importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
        const namedImports = importClause.namedBindings as NamedImports;
        namedImports.elements.forEach((element) => {
          dependencies.push(element.name.text);
        });
      }
    }
    
    // Look for type references
    if (ts.isTypeReferenceNode(n)) {
      const typeRef = n as TypeReferenceNode;
      if (ts.isIdentifier(typeRef.typeName)) {
        const identifier = typeRef.typeName as Identifier;
        dependencies.push(identifier.text);
      }
    }
    
    // Look for qualified names (e.g., Utils.functionName)
    if (ts.isPropertyAccessExpression(n)) {
      const propAccess = n as PropertyAccessExpression;
      if (ts.isIdentifier(propAccess.expression)) {
        const expression = propAccess.expression as Identifier;
        dependencies.push(`${expression.text}.${propAccess.name.text}`);
      }
    }
    
    n.forEachChild(visitNode);
  };
  
  visitNode(node);
  return dependencies;
};

export default extractDependencies; 