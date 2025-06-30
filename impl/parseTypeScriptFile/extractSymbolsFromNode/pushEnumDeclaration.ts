import type { SymbolInfo } from "@d/typescript/parser";
import type { Node, SourceFile, EnumDeclaration } from "typescript";
import extractDependencies from "./extractDependencies";

const pushEnumDeclaration = (node: Node, sourceFile: SourceFile, symbols: SymbolInfo[]): void => {
  const enumDecl = node as EnumDeclaration;
  
  symbols.push({
    qualifiedName: enumDecl.name.text,
    kind: "EnumDeclaration",
    description: `Enum ${enumDecl.name.text}`,
    ast: enumDecl,
    dependencies: extractDependencies(enumDecl, sourceFile),
  });
};

export default pushEnumDeclaration; 