import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";
import type { KhalaDatabaseConfig, DatabaseInitResult } from "@d/database/khala";

const createSymbolsTable = (db: Database): void => {
  db.run(`
    CREATE TABLE IF NOT EXISTS symbols (
      qualified_name TEXT PRIMARY KEY,
      namespace TEXT NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      description TEXT NOT NULL,
      ast TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const createDependenciesTable = (db: Database): void => {
  db.run(`
    CREATE TABLE IF NOT EXISTS dependencies (
      from_qualified_name TEXT NOT NULL,
      to_qualified_name TEXT NOT NULL,
      dependency_type TEXT DEFAULT 'reference',
      context TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (from_qualified_name, to_qualified_name),
      FOREIGN KEY (from_qualified_name) REFERENCES symbols(qualified_name) ON DELETE CASCADE,
      FOREIGN KEY (to_qualified_name) REFERENCES symbols(qualified_name) ON DELETE CASCADE
    )
  `);
};

const createNamespacesTable = (db: Database): void => {
  db.run(`
    CREATE TABLE IF NOT EXISTS namespaces (
      name TEXT PRIMARY KEY,
      description TEXT,
      parent_namespace TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const createIndexes = (db: Database): void => {
  // Indexes for faster queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_symbols_namespace ON symbols(namespace)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_symbols_name ON symbols(name)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_symbols_kind ON symbols(kind)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_symbols_namespace_kind ON symbols(namespace, kind)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_dependencies_from ON dependencies(from_qualified_name)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_dependencies_to ON dependencies(to_qualified_name)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_namespaces_parent ON namespaces(parent_namespace)`);
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
    const dbExists = existsSync(config.sqlitePath);
    
    // Create or open database
    const db = new Database(config.sqlitePath);
    
    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON");
    
    // Create tables
    createSymbolsTable(db);
    createDependenciesTable(db);
    createNamespacesTable(db);
    
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