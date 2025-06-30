/**
 * Type definitions for TypeScript parsing functionality
 */

/**
 * Information about a symbol extracted from TypeScript code
 */
export type SymbolInfo = {
  /** Fully qualified name of the symbol (e.g., "Utils.formatString") */
  qualifiedName: string;
  /** TypeScript AST node kind (e.g., "FunctionDeclaration") */
  kind: string;
  /** Human-readable description of the symbol */
  description: string;
  /** TypeScript AST node (serialized as JSON for storage) */
  ast: any;
  /** List of symbols this symbol depends on */
  dependencies: string[];
};

/**
 * Configuration for TypeScript parsing
 */
export type ParserConfig = {
  /** Path to the TypeScript file to parse */
  filePath: string;
  /** Path to tsconfig.json file */
  tsConfigPath: string;
  /** Whether to extract dependencies */
  extractDependencies: boolean;
  /** Whether to include AST nodes in output */
  includeAst: boolean;
};

/**
 * Result of parsing a TypeScript file
 */
export type ParseResult = {
  /** Success status */
  success: boolean;
  /** Extracted symbols */
  symbols: SymbolInfo[];
  /** Error message if parsing failed */
  error?: string;
  /** Processing time in milliseconds */
  processingTime: number;
}; 