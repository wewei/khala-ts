import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import type { KhalaDatabaseConfig, DatabaseInitResult } from "@d/database/khala";
import ensureSymbolDatabase from "./ensureSymbolDatabase";
import ensureSemanticIndex from "./ensureSemanticIndex";

const ensureKhalaDatabase = (folder: string): DatabaseInitResult => {
  try {
    // Ensure the folder exists
    if (!existsSync(folder)) {
      mkdirSync(folder, { recursive: true });
    }

    const config: KhalaDatabaseConfig = {
      folder,
      sqlitePath: join(folder, "khala.db"),
      semanticIndexPath: join(folder, "semantic-index"),
    };

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