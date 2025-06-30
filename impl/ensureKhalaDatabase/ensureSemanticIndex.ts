import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { KhalaDatabaseConfig, DatabaseInitResult } from "@d/database/khala";

const createSemanticIndexStructure = (semanticIndexPath: string): void => {
  // Create the main semantic index directory
  if (!existsSync(semanticIndexPath)) {
    mkdirSync(semanticIndexPath, { recursive: true });
  }

  // Create subdirectories for different types of embeddings
  const subdirs = ["symbols", "descriptions", "content"];
  
  for (const subdir of subdirs) {
    const subdirPath = join(semanticIndexPath, subdir);
    if (!existsSync(subdirPath)) {
      mkdirSync(subdirPath, { recursive: true });
    }
  }
};

const createLanceDBConfig = (semanticIndexPath: string): void => {
  // Create a basic LanceDB configuration file
  const configPath = join(semanticIndexPath, "lancedb-config.json");
  
  // For now, we'll just create the directory structure
  // LanceDB will create its own configuration when first used
  // This is a placeholder for future LanceDB integration
};

const ensureSemanticIndex = (config: KhalaDatabaseConfig): DatabaseInitResult => {
  try {
    // Create the semantic index directory structure
    createSemanticIndexStructure(config.semanticIndexPath);
    
    // Create LanceDB configuration
    createLanceDBConfig(config.semanticIndexPath);
    
    return {
      success: true,
      semanticIndexPath: config.semanticIndexPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export default ensureSemanticIndex; 