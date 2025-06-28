/**
 * Type definitions for the `khala add` command (MVP)
 */

/**
 * Options for the add command
 */
export type AddOptions = {
  /** Recursively add directories */
  recursive?: boolean;
  /** Force add even if already exists */
  force?: boolean;
  /** Verbose output */
  verbose?: boolean;
};

/**
 * Arguments for the add command
 */
export type AddArguments = {
  /** Path to file or directory to add */
  path: string;
};

/**
 * Result of adding files to the database
 */
export type AddResult = {
  /** Number of files successfully added */
  added: number;
  /** Number of files skipped */
  skipped: number;
  /** Number of files that failed */
  failed: number;
  /** Total processing time in milliseconds */
  processingTime: number;
};

/**
 * File processing status
 */
export type FileStatus = "added" | "skipped" | "failed" | "processing";

/**
 * File metadata extracted during processing
 */
export type FileMetadata = {
  /** File path */
  path: string;
  /** File size in bytes */
  size: number;
  /** File modification time */
  modified: Date;
  /** File hash for deduplication */
  hash: string;
  /** TypeScript AST information */
  ast?: {
    /** Number of functions found */
    functionCount: number;
    /** Number of types found */
    typeCount: number;
    /** Number of imports */
    importCount: number;
    /** Number of exports */
    exportCount: number;
  };
  /** Processing status */
  status: FileStatus;
  /** Error message if processing failed */
  error?: string;
};

/**
 * Configuration for file processing
 */
export type ProcessingConfig = {
  /** File extensions to process */
  extensions: string[];
  /** Maximum file size in bytes */
  maxFileSize: number;
  /** Whether to extract AST information */
  extractAst: boolean;
  /** Whether to generate fingerprints */
  generateFingerprints: boolean;
  /** Whether to validate TypeScript syntax */
  validateSyntax: boolean;
}; 