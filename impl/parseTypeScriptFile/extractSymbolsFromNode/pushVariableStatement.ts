import type { SymbolInfo } from "@d/typescript/parser";
import type { Node, SourceFile, VariableStatement, Identifier } from "typescript";
import extractDependencies from "./extractDependencies";

const pushVariableStatement = (node: Node, sourceFile: SourceFile, symbols: SymbolInfo[]): void => {
  const ts = require("typescript");
  const varStmt = node as VariableStatement;
  
  varStmt.declarationList.declarations.forEach(decl => {
    if (ts.isIdentifier(decl.name)) {
      const identifier = decl.name as Identifier;
      symbols.push({
        qualifiedName: identifier.text,
        kind: "VariableDeclaration",
        description: `Variable ${identifier.text}`,
        ast: decl,
        dependencies: extractDependencies(decl, sourceFile),
      });
    }
  });
};

export default pushVariableStatement; 