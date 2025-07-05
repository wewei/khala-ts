import type { Node, SourceFile } from "typescript";
import * as ts from "typescript";
import extractSymbolsFromSourceFile from "@i/extractSymbolsFromSourceFile";
import type { ASTNode, Symbol, SymbolKind, ParsedSourceFile } from "@d/add/types";
import { generateSymbolKey } from "../utils/hashUtils";

/**
 * Check if a node is a symbol definition
 */
const isSymbolDefinition = (node: ASTNode): boolean => {
  const symbolKinds = [
    "FunctionDeclaration",
    "ClassDeclaration", 
    "InterfaceDeclaration",
    "TypeAliasDeclaration",
    "EnumDeclaration",
    "VariableStatement",
    "ModuleDeclaration"
  ];
  
  return symbolKinds.includes(node.kind);
};

/**
 * Map TypeScript node kind to symbol kind
 */
const mapNodeKindToSymbolKind = (nodeKind: string): SymbolKind => {
  switch (nodeKind) {
    case "FunctionDeclaration":
      return "function";
    case "ClassDeclaration":
      return "class";
    case "InterfaceDeclaration":
      return "interface";
    case "TypeAliasDeclaration":
      return "type";
    case "EnumDeclaration":
      return "enum";
    case "VariableStatement":
      return "variable";
    case "ModuleDeclaration":
      return "module";
    default:
      return "variable";
  }
};

/**
 * Generate symbol description from AST node
 */
const generateSymbolDescription = (node: ASTNode): string => {
  const name = node.attributes.name || "unnamed";
  const kind = mapNodeKindToSymbolKind(node.kind);
  
  return `${kind} ${name}`;
};

/**
 * Extract dependencies from AST node
 * TODO: Implement dependency extraction logic
 */
const extractDependencies = (node: ASTNode, allNodes: ASTNode[]): string[] => {
  // For now, return empty array
  // This should be implemented to find symbol references
  return [];
};

/**
 * Extract AST nodes from source file
 */
const extractASTNodes = (parsedFile: ParsedSourceFile): ASTNode[] => {
  const { sourceFile, hash } = parsedFile;
  const nodes: ASTNode[] = [];
  
  // Visit all top-level nodes
  sourceFile.forEachChild((node: Node) => {
    // Only process top-level nodes
    if (node.parent && node.parent.kind !== ts.SyntaxKind.SourceFile) {
      return;
    }
    
    // Extract position information
    const startPos = node.getStart(sourceFile);
    const endPos = node.getEnd();
    
    // Extract attributes based on node kind
    const attributes: Record<string, any> = {};
    
    switch (node.kind) {
      case ts.SyntaxKind.FunctionDeclaration:
        if (ts.isFunctionDeclaration(node) && node.name) {
          attributes.name = node.name.text;
          attributes.isExported = hasExportModifier(node);
          attributes.isDefault = hasDefaultModifier(node);
          attributes.parameterCount = node.parameters.length;
          attributes.returnType = node.type ? node.type.getText(sourceFile) : "any";
        }
        break;
        
      case ts.SyntaxKind.ClassDeclaration:
        if (ts.isClassDeclaration(node) && node.name) {
          attributes.name = node.name.text;
          attributes.isExported = hasExportModifier(node);
          attributes.isDefault = hasDefaultModifier(node);
        }
        break;
        
      case ts.SyntaxKind.InterfaceDeclaration:
        if (ts.isInterfaceDeclaration(node)) {
          attributes.name = node.name.text;
          attributes.isExported = hasExportModifier(node);
        }
        break;
        
      case ts.SyntaxKind.TypeAliasDeclaration:
        if (ts.isTypeAliasDeclaration(node)) {
          attributes.name = node.name.text;
          attributes.isExported = hasExportModifier(node);
        }
        break;
        
      case ts.SyntaxKind.VariableStatement:
        if (ts.isVariableStatement(node)) {
          const firstDecl = node.declarationList.declarations[0];
          if (firstDecl && ts.isIdentifier(firstDecl.name)) {
            attributes.name = firstDecl.name.text;
            attributes.isExported = hasExportModifier(node);
          }
        }
        break;
    }
    
    if (attributes.name) {
      nodes.push({
        sourceFileKey: hash,
        startPos,
        endPos,
        kind: ts.SyntaxKind[node.kind],
        attributes
      });
    }
  });
  
  return nodes;
};

/**
 * Check if node has export modifier
 */
const hasExportModifier = (node: Node): boolean => {
  return (node as any).modifiers?.some((mod: any) => mod.kind === ts.SyntaxKind.ExportKeyword) || false;
};

/**
 * Check if node has default modifier
 */
const hasDefaultModifier = (node: Node): boolean => {
  return (node as any).modifiers?.some((mod: any) => mod.kind === ts.SyntaxKind.DefaultKeyword) || false;
};

/**
 * Extract symbols from AST nodes
 */
const extractSymbolsFromAST = (
  astNodes: ASTNode[], 
  sourceFilePath: string,
  options: { verbose?: boolean } = {}
): Symbol[] => {
  return astNodes
    .filter(node => isSymbolDefinition(node))
    .map(node => {
      const key = generateSymbolKey(node.attributes.name, node.kind);
      const kind = mapNodeKindToSymbolKind(node.kind);
      const description = generateSymbolDescription(node);
      const dependencies = extractDependencies(node, astNodes);
      
      if (options.verbose) {
        console.log(`Extracted symbol: ${node.attributes.name} (${kind})`);
      }
      
      return {
        key,
        sourceFileKey: node.sourceFileKey,
        startPos: node.startPos,
        endPos: node.endPos,
        name: node.attributes.name,
        kind,
        description,
        dependencies
      };
    });
};

/**
 * Process source file to extract AST nodes and symbols
 */
const processSourceFile = (
  parsedFile: ParsedSourceFile, 
  options: { verbose?: boolean } = {}
): {
  ast: ASTNode[];
  symbols: Symbol[];
} => {
  if (options.verbose) {
    console.log(`Extracting AST nodes from source file`);
  }
  
  // Extract AST nodes from source file
  const astNodes = extractASTNodes(parsedFile);
  
  if (options.verbose) {
    console.log(`Found ${astNodes.length} AST nodes`);
  }
  
  // Extract symbols from AST nodes
  const symbols = extractSymbolsFromAST(astNodes, parsedFile.filePath, options);
  
  if (options.verbose) {
    console.log(`Extracted ${symbols.length} symbols from AST nodes`);
  }
  
  // Generate symbol keys (40-digit hex)
  const symbolsWithKeys = symbols.map(symbol => {
    const key = generateSymbolKey(symbol.name, symbol.kind);
    if (options.verbose) {
      console.log(`Generated key for symbol '${symbol.name}': ${key}`);
    }
    return {
      ...symbol,
      key
    };
  });
  
  return { ast: astNodes, symbols: symbolsWithKeys };
};

export {
  processSourceFile,
  extractASTNodes,
  extractSymbolsFromAST,
  isSymbolDefinition,
  mapNodeKindToSymbolKind
}; 