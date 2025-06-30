import type { SymbolInfo } from "@d/typescript/parser";
import type { Node, SourceFile, ModuleDeclaration, Identifier } from "typescript";
import extractDependencies from "./extractDependencies";

const pushModuleDeclaration = (node: Node, sourceFile: SourceFile, symbols: SymbolInfo[]): void => {
  const ts = require("typescript");
  const moduleDecl = node as ModuleDeclaration;
  
  if (ts.isIdentifier(moduleDecl.name)) {
    const identifier = moduleDecl.name as Identifier;
    symbols.push({
      qualifiedName: identifier.text,
      kind: "ModuleDeclaration",
      description: `Module ${identifier.text}`,
      ast: moduleDecl,
      dependencies: extractDependencies(moduleDecl, sourceFile),
    });
  }
};

export default pushModuleDeclaration; 