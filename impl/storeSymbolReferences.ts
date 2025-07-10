import { Database } from "bun:sqlite";
import type { SymbolRef } from "@d/add/types";

/**
 * Store symbol references in SQLite
 */
const storeSymbolReferences = (
  references: SymbolRef[], 
  sqlitePath: string,
  options: { verbose?: boolean } = {}
): void => {
  if (references.length === 0) {
    if (options.verbose) {
      console.log(`No symbol references to store`);
    }
    return;
  }
  
  const db = new Database(sqlitePath);
  
  for (const ref of references) {
    if (options.verbose) {
      console.log(`Storing reference: ${ref.referenceType} at positions ${ref.startPos}-${ref.endPos}`);
    }
    
    db.run(`
      INSERT OR REPLACE INTO symbol_references (
        source_file_key, start_pos, end_pos, definition_key, reference_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      ref.sourceFileKey,
      ref.startPos,
      ref.endPos,
      ref.definitionKey,
      ref.referenceType,
      new Date().toISOString(),
    ]);
  }
  
  db.close();
  
  if (options.verbose) {
    console.log(`Stored ${references.length} symbol references in database`);
  }
};

export default storeSymbolReferences; 