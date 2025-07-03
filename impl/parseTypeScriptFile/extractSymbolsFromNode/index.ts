import type { SymbolInfo } from "@d/typescript/parser";
import type { Node, SourceFile } from "typescript";
import * as ts from "typescript";
import pushFunctionDeclaration from "./pushFunctionDeclaration";
import pushVariableStatement from "./pushVariableStatement";
import pushTypeAliasDeclaration from "./pushTypeAliasDeclaration";
import pushInterfaceDeclaration from "./pushInterfaceDeclaration";
import pushClassDeclaration from "./pushClassDeclaration";
import pushEnumDeclaration from "./pushEnumDeclaration";
import pushModuleDeclaration from "./pushModuleDeclaration";

const extractSymbolsFromNode = (node: Node, sourceFile: SourceFile): SymbolInfo[] => {
  const symbols: SymbolInfo[] = [];
  
  // Only process top-level nodes
  if (node.parent && node.parent.kind !== ts.SyntaxKind.SourceFile) {
    return symbols;
  }
  
  // Single loop with specialized push functions
  switch (node.kind) {
    case ts.SyntaxKind.FunctionDeclaration:
      pushFunctionDeclaration(node, sourceFile, symbols);
      break;
    
    case ts.SyntaxKind.VariableStatement:
      pushVariableStatement(node, sourceFile, symbols);
      break;
    
    case ts.SyntaxKind.TypeAliasDeclaration:
      pushTypeAliasDeclaration(node, sourceFile, symbols);
      break;
    
    case ts.SyntaxKind.InterfaceDeclaration:
      pushInterfaceDeclaration(node, sourceFile, symbols);
      break;
    
    case ts.SyntaxKind.ClassDeclaration:
      pushClassDeclaration(node, sourceFile, symbols);
      break;
    
    case ts.SyntaxKind.EnumDeclaration:
      pushEnumDeclaration(node, sourceFile, symbols);
      break;
    
    case ts.SyntaxKind.ModuleDeclaration:
      pushModuleDeclaration(node, sourceFile, symbols);
      break;
  }
  
  return symbols;
};

export default extractSymbolsFromNode; 