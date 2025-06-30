import type { SymbolInfo } from "@d/typescript/parser";
import type { Node, SourceFile, InterfaceDeclaration } from "typescript";
import extractDependencies from "./extractDependencies";

const pushInterfaceDeclaration = (node: Node, sourceFile: SourceFile, symbols: SymbolInfo[]): void => {
  const interfaceDecl = node as InterfaceDeclaration;
  
  symbols.push({
    qualifiedName: interfaceDecl.name.text,
    kind: "InterfaceDeclaration",
    description: `Interface ${interfaceDecl.name.text}`,
    ast: interfaceDecl,
    dependencies: extractDependencies(interfaceDecl, sourceFile),
  });
};

export default pushInterfaceDeclaration; 