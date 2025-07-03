/**
 * Type definitions for the `khala inspect` command
 */

/**
 * Options for the inspect command
 */
export type InspectOptions = {
  /** Show detailed information */
  detailed?: boolean;
  /** Output format */
  format?: "table" | "json" | "tree";
  /** Show dependencies */
  dependencies?: boolean;
  /** Show metadata */
  metadata?: boolean;
  /** Verbose output */
  verbose?: boolean;
};

/**
 * Arguments for the inspect command
 */
export type InspectArguments = {
  /** Target to inspect (file, function, type, dependency) */
  target: string;
};

/**
 * Symbol information extracted from TypeScript files
 */
export type SymbolInfo = {
  /** Symbol name */
  name: string;
  /** Symbol kind (function, type, interface, etc.) */
  kind: string;
  /** File path where symbol is defined */
  filePath: string;
  /** Line number where symbol starts */
  line: number;
  /** Column number where symbol starts */
  column: number;
  /** Whether symbol is exported */
  exported: boolean;
  /** Whether symbol is exported as default */
  isDefaultExport?: boolean;
  /** Symbol documentation/comment */
  documentation?: string;
  /** Symbol modifiers (public, private, etc.) */
  modifiers?: string[];
  /** Symbol type information */
  type?: string;
  /** Dependencies of this symbol */
  dependencies?: string[];
};

/**
 * Result of inspecting symbols
 */
export type InspectSymbolsResult = {
  /** List of symbols found */
  symbols: SymbolInfo[];
  /** Total number of symbols */
  totalCount: number;
  /** Number of files processed */
  filesProcessed: number;
  /** Processing time in milliseconds */
  processingTime: number;
  /** Any errors encountered */
  errors?: string[];
};

/**
 * File inspection result
 */
export type FileInspectionResult = {
  /** File path */
  filePath: string;
  /** Symbols found in this file */
  symbols: SymbolInfo[];
  /** File processing status */
  status: "success" | "error" | "skipped";
  /** Error message if processing failed */
  error?: string;
};

/**
 * Configuration for symbol inspection
 */
export type InspectionConfig = {
  /** Whether to include node_modules */
  includeNodeModules: boolean;
  /** Whether to follow imports */
  followImports: boolean;
  /** Maximum depth for dependency traversal */
  maxDepth: number;
  /** File extensions to process */
  extensions: string[];
  /** Whether to extract documentation */
  extractDocumentation: boolean;
  /** Whether to extract type information */
  extractTypes: boolean;
}; 