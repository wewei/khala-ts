import type { SymbolInfo } from "@d/typescript/parser";
import type { Node, SourceFile, ClassDeclaration } from "typescript";
import extractDependencies from "./extractDependencies";

const pushClassDeclaration = (node: Node, sourceFile: SourceFile, symbols: SymbolInfo[]): void => {
  const classDecl = node as ClassDeclaration;
  
  if (classDecl.name) {
    symbols.push({
      qualifiedName: classDecl.name.text,
      kind: "ClassDeclaration",
      description: `Class ${classDecl.name.text}`,
      ast: classDecl,
      dependencies: extractDependencies(classDecl, sourceFile),
    });
  }
};

export default pushClassDeclaration; 