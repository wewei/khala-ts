import type { SymbolInfo } from "@d/typescript/parser";
import type { Node, SourceFile, VariableStatement, Identifier } from "typescript";
import * as ts from "typescript";
import extractDependencies from "./extractDependencies";

const pushVariableStatement = (node: Node, sourceFile: SourceFile, symbols: SymbolInfo[]): void => {
  const varStmt = node as VariableStatement;

  for (const decl of varStmt.declarationList.declarations) {
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
  }
};

export default pushVariableStatement; 