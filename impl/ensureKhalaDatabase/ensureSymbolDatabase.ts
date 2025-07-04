import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";
import type { KhalaDatabaseConfig, DatabaseInitResult } from "@d/database/khala";

const createSourceFileMetadataTable = (db: Database): void => {
  db.run(`
    CREATE TABLE IF NOT EXISTS source_file_metadata (
      key TEXT PRIMARY KEY,
      description TEXT,
      size INTEGER NOT NULL,
      created_at DATETIME NOT NULL
    )
  `);
};

const createSymbolDefinitionsTable = (db: Database): void => {
  db.run(`
    CREATE TABLE IF NOT EXISTS symbol_definitions (
      key TEXT PRIMARY KEY,
      source_file_key TEXT NOT NULL,
      start_pos INTEGER NOT NULL,
      end_pos INTEGER NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      description TEXT,
      dependencies TEXT,
      created_at DATETIME NOT NULL,
      FOREIGN KEY (source_file_key) REFERENCES source_file_metadata(key)
    )
  `);
};

const createSymbolReferencesTable = (db: Database): void => {
  db.run(`
    CREATE TABLE IF NOT EXISTS symbol_references (
      source_file_key TEXT NOT NULL,
      start_pos INTEGER NOT NULL,
      end_pos INTEGER NOT NULL,
      definition_key TEXT NOT NULL,
      reference_type TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      PRIMARY KEY (source_file_key, start_pos, end_pos),
      FOREIGN KEY (source_file_key) REFERENCES source_file_metadata(key),
      FOREIGN KEY (definition_key) REFERENCES symbol_definitions(key)
    )
  `);
};

const createIndexes = (db: Database): void => {
  // Performance indexes for faster queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_symbol_definitions_source_file 
    ON symbol_definitions(source_file_key)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_symbol_definitions_name 
    ON symbol_definitions(name)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_symbol_references_definition 
    ON symbol_references(definition_key)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_symbol_references_source_file 
    ON symbol_references(source_file_key)`);
};

const createTriggers = (db: Database): void => {
  // Trigger to automatically update the updated_at timestamp
  db.run(`
    CREATE TRIGGER IF NOT EXISTS update_symbols_updated_at
    AFTER UPDATE ON symbols
    BEGIN
      UPDATE symbols SET updated_at = CURRENT_TIMESTAMP WHERE qualified_name = NEW.qualified_name;
    END
  `);
};

const ensureSymbolDatabase = (config: KhalaDatabaseConfig): DatabaseInitResult => {
  try {
    // Check if database already exists
    if (existsSync(config.sqlitePath)) {
      return {
        success: true,
        sqlitePath: config.sqlitePath,
      };
    }
    // Create or open database
    const db = new Database(config.sqlitePath);
    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON");
    // Create tables
    createSourceFileMetadataTable(db);
    createSymbolDefinitionsTable(db);
    createSymbolReferencesTable(db);
    // Create indexes
    createIndexes(db);
    // Create triggers
    createTriggers(db);
    // Close database connection
    db.close();
    return {
      success: true,
      sqlitePath: config.sqlitePath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export default ensureSymbolDatabase; 