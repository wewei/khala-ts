import type { SourceFile } from "typescript";

/**
 * Options for the add command
 */
export type AddOptions = {
  recursive?: boolean;
  force?: boolean;
  verbose?: boolean;
  symbolMap?: string;
};

/**
 * Result of adding a source file
 */
export type AddSourceFileResult = {
  success: boolean;
  symbolsCount?: number;
  message?: string;
  error?: string;
};

/**
 * Parsed source file with metadata
 */
export type ParsedSourceFile = {
  filePath: string;
  content: string;
  hash: string;
  sourceFile: SourceFile;
};

/**
 * AST node for storage
 */
export type ASTNode = {
  sourceFileKey: string;
  startPos: number;
  endPos: number;
  kind: string;
  attributes: Record<string, any>;
};

/**
 * Symbol definition
 */
export type SymbolKind = 
  | "function"
  | "class" 
  | "interface"
  | "type"
  | "enum"
  | "variable"
  | "namespace"
  | "module";

export type Symbol = {
  key: string;
  sourceFileKey: string;
  startPos: number;
  endPos: number;
  name: string;
  kind: SymbolKind;
  description?: string;
  dependencies: string[];
};

/**
 * Symbol reference
 */
export type SymbolRef = {
  sourceFileKey: string;
  startPos: number;
  endPos: number;
  definitionKey: string;
  referenceType: "import" | "usage" | "export";
};

/**
 * Source file metadata for database storage
 */
export type SourceFileMetadata = {
  key: string;
  description: string;
  size: number;
  createdAt: string;
};

/**
 * AST file structure for storage
 */
export type ASTFile = {
  version: number;
  nodes: Omit<ASTNode, 'sourceFileKey'>[];
};

/**
 * Compiler options with metadata
 */
export type CompilerOptionsWithMetadata = {
  configFilePath: string;
  target: number;
  module: number;
  moduleResolution: number;
  allowSyntheticDefaultImports: boolean;
  esModuleInterop: boolean;
  skipLibCheck: boolean;
  [key: string]: any;
}; 