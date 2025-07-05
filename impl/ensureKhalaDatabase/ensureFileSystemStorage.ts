import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { KhalaDatabaseConfig, DatabaseInitResult } from "@d/database/khala";

const ensureFileSystemStorage = (config: KhalaDatabaseConfig): DatabaseInitResult => {
  try {
    // Only create the main directory structure
    // Hash-based subdirectories will be created on-demand when files are added
    
    // Ensure files directory exists (contains both source and AST files)
    if (!existsSync(config.filesPath)) {
      mkdirSync(config.filesPath, { recursive: true });
    }
    
    // Ensure semantic index directory exists
    if (!existsSync(config.semanticIndexPath)) {
      mkdirSync(config.semanticIndexPath, { recursive: true });
    }
    
    return {
      success: true,
      filesPath: config.filesPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export default ensureFileSystemStorage; 