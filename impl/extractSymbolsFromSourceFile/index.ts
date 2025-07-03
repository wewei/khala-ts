import type { SourceFile } from "typescript";
import { SyntaxKind } from "typescript";
import hasExportModifier from "./hasExportModifier";
import isDefaultExport from "./isDefaultExport";
import getDocumentation from "./getDocumentation";
import getModifiers from "./getModifiers";
import getReturnType from "./getReturnType";
import getVariableType from "./getVariableType";
import type { SymbolInfo } from "@d/cli/inspect";

/**
 * Extract symbols from a TypeScript source file
 */
const extractSymbolsFromSourceFile = (
  sourceFile: SourceFile, 
  filePath: string, 
): SymbolInfo[] => {
  const symbols: SymbolInfo[] = [];
  const symbolMap = new Map<string, any>();

  // First pass: collect all top-level declarations
  const collectDeclarations = (node: any): void => {
    switch (node.kind) {
      case SyntaxKind.FunctionDeclaration:
        if (node.name) {
          const symbolInfo = {
            name: node.name.text,
            kind: "function",
            filePath,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
            column: sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1,
            exported: hasExportModifier(node),
            isDefaultExport: isDefaultExport(node),
            documentation: getDocumentation(node),
            modifiers: getModifiers(node),
            type: getReturnType(node)
          };
          symbols.push(symbolInfo);
          symbolMap.set(node.name.text, symbolInfo);
        }
        break;
      case SyntaxKind.VariableStatement:
        if (node.declarationList && node.declarationList.declarations) {
          for (const decl of node.declarationList.declarations) {
            if (decl.name) {
              if (decl.name.kind === SyntaxKind.ObjectBindingPattern) {
                // Handle destructuring assignments like const { a, b } = ...
                for (const element of decl.name.elements) {
                  if (element.kind === SyntaxKind.BindingElement && element.name) {
                    const symbolInfo = {
                      name: element.name.text,
                      kind: "variable",
                      filePath,
                      line: sourceFile.getLineAndCharacterOfPosition(element.getStart()).line + 1,
                      column: sourceFile.getLineAndCharacterOfPosition(element.getStart()).character + 1,
                      exported: hasExportModifier(node),
                      isDefaultExport: isDefaultExport(node),
                      documentation: getDocumentation(decl),
                      modifiers: getModifiers(decl),
                      type: getVariableType(decl)
                    };
                    symbols.push(symbolInfo);
                    symbolMap.set(element.name.text, symbolInfo);
                  }
                }
              } else if (decl.name.kind === SyntaxKind.Identifier) {
                // Handle regular variable declarations like const x = ...
                const symbolInfo = {
                  name: decl.name.text,
                  kind: "variable",
                  filePath,
                  line: sourceFile.getLineAndCharacterOfPosition(decl.getStart()).line + 1,
                  column: sourceFile.getLineAndCharacterOfPosition(decl.getStart()).character + 1,
                  exported: hasExportModifier(node),
                  isDefaultExport: isDefaultExport(node),
                  documentation: getDocumentation(decl),
                  modifiers: getModifiers(decl),
                  type: getVariableType(decl)
                };
                symbols.push(symbolInfo);
                symbolMap.set(decl.name.text, symbolInfo);
              }
            }
          }
        }
        break;
      case SyntaxKind.ClassDeclaration:
        if (node.name) {
          const symbolInfo = {
            name: node.name.text,
            kind: "class",
            filePath,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
            column: sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1,
            exported: hasExportModifier(node),
            isDefaultExport: isDefaultExport(node),
            documentation: getDocumentation(node),
            modifiers: getModifiers(node)
          };
          symbols.push(symbolInfo);
          symbolMap.set(node.name.text, symbolInfo);
        }
        break;
      case SyntaxKind.InterfaceDeclaration:
        if (node.name) {
          const symbolInfo = {
            name: node.name.text,
            kind: "interface",
            filePath,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
            column: sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1,
            exported: hasExportModifier(node),
            isDefaultExport: isDefaultExport(node),
            documentation: getDocumentation(node),
            modifiers: getModifiers(node)
          };
          symbols.push(symbolInfo);
          symbolMap.set(node.name.text, symbolInfo);
        }
        break;
      case SyntaxKind.TypeAliasDeclaration:
        if (node.name) {
          const symbolInfo = {
            name: node.name.text,
            kind: "type",
            filePath,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
            column: sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1,
            exported: hasExportModifier(node),
            isDefaultExport: isDefaultExport(node),
            documentation: getDocumentation(node),
            modifiers: getModifiers(node)
          };
          symbols.push(symbolInfo);
          symbolMap.set(node.name.text, symbolInfo);
        }
        break;
      case SyntaxKind.EnumDeclaration:
        if (node.name) {
          const symbolInfo = {
            name: node.name.text,
            kind: "enum",
            filePath,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
            column: sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1,
            exported: hasExportModifier(node),
            isDefaultExport: isDefaultExport(node),
            documentation: getDocumentation(node),
            modifiers: getModifiers(node)
          };
          symbols.push(symbolInfo);
          symbolMap.set(node.name.text, symbolInfo);
        }
        break;
    }
    if (node.forEachChild) node.forEachChild(collectDeclarations);
  };

  // Second pass: process export declarations and assignments
  const processExports = (node: any): void => {
    switch (node.kind) {
      case SyntaxKind.ExportDeclaration:
        if (node.exportClause && node.exportClause.kind === SyntaxKind.NamedExports) {
          for (const element of node.exportClause.elements) {
            const symbolName = element.name.text;
            const existingSymbol = symbolMap.get(symbolName);
            if (existingSymbol) {
              existingSymbol.exported = true;
            }
          }
        }
        break;
      case SyntaxKind.ExportAssignment:
        let symbolName = undefined;
        if (node.expression) {
          if (node.expression.kind === SyntaxKind.Identifier) {
            symbolName = node.expression.text;
          } else if (node.expression.kind === SyntaxKind.PropertyAccessExpression && node.expression.name) {
            symbolName = node.expression.name.text;
          }
        }
        if (symbolName) {
          const existingSymbol = symbolMap.get(symbolName);
          if (existingSymbol) {
            existingSymbol.isDefaultExport = true;
            existingSymbol.exported = true;
          }
        }
        break;
    }
    if (node.forEachChild) node.forEachChild(processExports);
  };

  // Run both passes
  if (sourceFile.forEachChild) {
    sourceFile.forEachChild(collectDeclarations);
    sourceFile.forEachChild(processExports);
  }
  return symbols;
};

export default extractSymbolsFromSourceFile; 