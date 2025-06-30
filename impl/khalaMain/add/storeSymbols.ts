import { Database } from "bun:sqlite";
import { join } from "node:path";

type SymbolInfo = {
  qualifiedName: string;
  kind: string;
  description: string;
  ast: any;
  dependencies: string[];
};

const storeSymbols = (dbPath: string, symbols: SymbolInfo[]): void => {
  const db = new Database(dbPath);
  
  // Enable foreign keys
  db.run("PRAGMA foreign_keys = ON");
  
  // Begin transaction for better performance
  db.run("BEGIN TRANSACTION");
  
  try {
    // First, insert all symbols
    for (const symbol of symbols) {
      // Extract namespace and name from qualified name
      const parts = symbol.qualifiedName.split(".");
      const name = parts.pop() || symbol.qualifiedName;
      const namespace = parts.length > 0 ? parts.join(".") : "";
      
      // Insert or update symbol
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO symbols 
        (qualified_name, namespace, name, kind, description, ast, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      stmt.run(
        symbol.qualifiedName,
        namespace,
        name,
        symbol.kind,
        symbol.description,
        JSON.stringify(symbol.ast)
      );
    }
    
    // Then, insert dependencies only for symbols that exist in the database
    for (const symbol of symbols) {
      for (const dependency of symbol.dependencies) {
        // Check if the dependency exists in the symbols table
        const checkStmt = db.prepare(`
          SELECT COUNT(*) as count FROM symbols WHERE qualified_name = ?
        `);
        const result = checkStmt.get(dependency) as { count: number };
        
        if (result.count > 0) {
          const depStmt = db.prepare(`
            INSERT OR IGNORE INTO dependencies 
            (from_qualified_name, to_qualified_name, dependency_type)
            VALUES (?, ?, 'reference')
          `);
          
          depStmt.run(symbol.qualifiedName, dependency);
        }
      }
    }
    
    // Commit transaction
    db.run("COMMIT");
  } catch (error) {
    // Rollback on error
    db.run("ROLLBACK");
    throw error;
  } finally {
    db.close();
  }
};

export default storeSymbols; 