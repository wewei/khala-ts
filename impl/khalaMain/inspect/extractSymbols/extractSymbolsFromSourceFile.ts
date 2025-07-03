import * as ts from "typescript";
import hasExportModifier from "./hasExportModifier";
import isDefaultExport from "./isDefaultExport";
import getDocumentation from "./getDocumentation";
import getModifiers from "./getModifiers";
import getReturnType from "./getReturnType";
import getVariableType from "./getVariableType";
import type { InspectOptions, SymbolInfo } from "@d/cli/inspect";

/**
 * Extract symbols from a TypeScript source file
 */
const extractSymbolsFromSourceFile = (
  sourceFile: any, 
  filePath: string, 
  options: InspectOptions
): SymbolInfo[] => {
  const symbols: SymbolInfo[] = [];
  const symbolMap = new Map<string, any>();

  // First pass: collect all top-level declarations
  const collectDeclarations = (node: any): void => {
    switch (node.kind) {
      case ts.SyntaxKind.FunctionDeclaration:
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
      case ts.SyntaxKind.VariableStatement:
        if (node.declarationList && node.declarationList.declarations) {
          for (const decl of node.declarationList.declarations) {
            if (decl.name) {
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
        break;
      case ts.SyntaxKind.ClassDeclaration:
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
      case ts.SyntaxKind.InterfaceDeclaration:
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
      case ts.SyntaxKind.TypeAliasDeclaration:
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
      case ts.SyntaxKind.EnumDeclaration:
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
      case ts.SyntaxKind.ExportDeclaration:
        if (node.exportClause && node.exportClause.kind === ts.SyntaxKind.NamedExports) {
          for (const element of node.exportClause.elements) {
            const symbolName = element.name.text;
            const existingSymbol = symbolMap.get(symbolName);
            if (existingSymbol) {
              existingSymbol.exported = true;
            }
          }
        }
        break;
      case ts.SyntaxKind.ExportAssignment:
        let symbolName = undefined;
        if (node.expression) {
          if (node.expression.kind === ts.SyntaxKind.Identifier) {
            symbolName = node.expression.text;
          } else if (node.expression.kind === ts.SyntaxKind.PropertyAccessExpression && node.expression.name) {
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