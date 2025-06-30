import type { SymbolInfo } from "@d/typescript/parser";
import type { Node, SourceFile, FunctionDeclaration } from "typescript";
import extractDependencies from "./extractDependencies";

const pushFunctionDeclaration = (node: Node, sourceFile: SourceFile, symbols: SymbolInfo[]): void => {
  const funcDecl = node as FunctionDeclaration;
  
  if (funcDecl.name) {
    symbols.push({
      qualifiedName: funcDecl.name.text,
      kind: "FunctionDeclaration",
      description: `Function ${funcDecl.name.text}`,
      ast: funcDecl,
      dependencies: extractDependencies(funcDecl, sourceFile),
    });
  }
};

export default pushFunctionDeclaration; 