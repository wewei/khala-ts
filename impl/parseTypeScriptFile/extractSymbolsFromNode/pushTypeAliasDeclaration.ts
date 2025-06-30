import type { SymbolInfo } from "@d/typescript/parser";
import type { Node, SourceFile, TypeAliasDeclaration } from "typescript";
import extractDependencies from "./extractDependencies";

const pushTypeAliasDeclaration = (node: Node, sourceFile: SourceFile, symbols: SymbolInfo[]): void => {
  const typeDecl = node as TypeAliasDeclaration;
  
  symbols.push({
    qualifiedName: typeDecl.name.text,
    kind: "TypeAliasDeclaration",
    description: `Type ${typeDecl.name.text}`,
    ast: typeDecl,
    dependencies: extractDependencies(typeDecl, sourceFile),
  });
};

export default pushTypeAliasDeclaration; 