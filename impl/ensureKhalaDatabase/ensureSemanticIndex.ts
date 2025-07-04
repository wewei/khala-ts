import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { KhalaDatabaseConfig, DatabaseInitResult } from "@d/database/khala";

const createSemanticIndexStructure = (semanticIndexPath: string): void => {
  // Create the main semantic index directory
  if (!existsSync(semanticIndexPath)) {
    mkdirSync(semanticIndexPath, { recursive: true });
  }

  // Create subdirectories for LanceDB tables
  const subdirs = ["symbols", "embeddings"];
  
  for (const subdir of subdirs) {
    const subdirPath = join(semanticIndexPath, subdir);
    if (!existsSync(subdirPath)) {
      mkdirSync(subdirPath, { recursive: true });
    }
  }
};

const createLanceDBConfig = (semanticIndexPath: string): void => {
  // Create a basic LanceDB configuration file for symbol semantic indexing
  const configPath = join(semanticIndexPath, "lancedb-config.json");
  
  // Configuration for symbol semantic indexing
  const config = {
    version: 1,
    tables: {
      symbols: {
        schema: {
          symbol_key: "string",
          embeddings: "float32[1536]", // OpenAI embedding dimension
          keywords: "string[]",
          description: "string",
          last_indexed: "date"
        },
        path: join(semanticIndexPath, "symbols", "symbols.lance")
      }
    },
    embedding_model: "text-embedding-ada-002",
    embedding_dimension: 1536
  };
  
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