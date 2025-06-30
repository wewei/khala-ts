import { resolve } from "node:path";
import type { SymbolInfo } from "@d/typescript/parser";
import type { Node, SourceFile } from "typescript";
import loadCompilerOptions from "./loadCompilerOptions";
import extractSymbolsFromNode from "./extractSymbolsFromNode";

const parseTypeScriptFile = (filePath: string, tsConfigPath: string): SymbolInfo[] => {
  const resolvedPath = resolve(filePath);
  const resolvedTsConfigPath = resolve(tsConfigPath);
  
  // Load compiler options from tsconfig.json
  const compilerOptions = loadCompilerOptions(resolvedTsConfigPath);
  
  // Create TypeScript program
  const { createProgram, getSourceFile } = require("typescript");
  const program = createProgram([resolvedPath], compilerOptions);
  
  const sourceFile = program.getSourceFile(resolvedPath);
  if (!sourceFile) {
    throw new Error(`Could not parse source file: ${resolvedPath}`);
  }
  
  const symbols: SymbolInfo[] = [];
  
  // Visit all top-level nodes
  sourceFile.forEachChild((node: Node) => {
    const nodeSymbols = extractSymbolsFromNode(node, sourceFile);
    symbols.push(...nodeSymbols);
  });
  
  return symbols;
};

export default parseTypeScriptFile; 