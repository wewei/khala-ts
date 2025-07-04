import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { KhalaDatabaseConfig, DatabaseInitResult } from "@d/database/khala";

const createHashBasedDirectories = (basePath: string): void => {
  // Create directories for hash-based storage (00-ff)
  // This creates 256 subdirectories for RIPEMD-160 hash distribution
  for (let i = 0; i < 256; i++) {
    const hexDir = i.toString(16).padStart(2, '0');
    const dirPath = join(basePath, hexDir);
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  }
};

const ensureFileSystemStorage = (config: KhalaDatabaseConfig): DatabaseInitResult => {
  try {
    // Create hash-based directory structure for source files
    createHashBasedDirectories(config.sourceFilesPath);
    
    // Create hash-based directory structure for AST files
    createHashBasedDirectories(config.astFilesPath);
    
    return {
      success: true,
      sourceFilesPath: config.sourceFilesPath,
      astFilesPath: config.astFilesPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export default ensureFileSystemStorage; 