import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import type { KhalaDatabaseConfig, DatabaseInitResult } from "@d/database/khala";
import ensureFileSystemStorage from "./ensureFileSystemStorage";
import ensureSymbolDatabase from "./ensureSymbolDatabase";
import ensureSemanticIndex from "./ensureSemanticIndex";

const createDirectoryStructure = (folder: string): void => {
  const dirs = [
    join(folder, "files"),
    join(folder, "semantic-index")
  ];
  
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
};

const ensureKhalaDatabase = (folder: string): DatabaseInitResult => {
  try {
    // Ensure the main folder exists
    if (!existsSync(folder)) {
      mkdirSync(folder, { recursive: true });
    }

    // Create directory structure for three-layer storage
    createDirectoryStructure(folder);

    const config: KhalaDatabaseConfig = {
      folder,
      filesPath: join(folder, "files"),
      sqlitePath: join(folder, "khala.db"),
      semanticIndexPath: join(folder, "semantic-index"),
    };

    // Initialize file system storage
    const fileSystemResult = ensureFileSystemStorage(config);
    if (!fileSystemResult.success) {
      return {
        success: false,
        error: `Failed to initialize file system storage: ${fileSystemResult.error}`,
      };
    }

    // Initialize SQLite database
    const sqliteResult = ensureSymbolDatabase(config);
    if (!sqliteResult.success) {
      return {
        success: false,
        error: `Failed to initialize SQLite database: ${sqliteResult.error}`,
      };
    }

    // Initialize semantic index
    const semanticResult = ensureSemanticIndex(config);
    if (!semanticResult.success) {
      return {
        success: false,
        error: `Failed to initialize semantic index: ${semanticResult.error}`,
      };
    }

    return {
      success: true,
      filesPath: config.filesPath,
      sqlitePath: config.sqlitePath,
      semanticIndexPath: config.semanticIndexPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export default ensureKhalaDatabase; 