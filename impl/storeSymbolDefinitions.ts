import { Database } from "bun:sqlite";
import type { Symbol } from "@d/add/types";

/**
 * Store symbol definitions in SQLite
 */
const storeSymbolDefinitions = (
  symbols: Symbol[], 
  sqlitePath: string,
  options: { verbose?: boolean } = {}
): void => {
  const db = new Database(sqlitePath);
  
  if (options.verbose) {
    console.log(`Opening database: ${sqlitePath}`);
  }
  
  for (const symbol of symbols) {
    if (options.verbose) {
      console.log(`Storing symbol: ${symbol.name} (${symbol.kind}) at positions ${symbol.startPos}-${symbol.endPos}`);
    }
    
    db.run(`
      INSERT OR REPLACE INTO symbol_definitions (
        key, source_file_key, start_pos, end_pos, 
        name, kind, description, dependencies, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      symbol.key,
      symbol.sourceFileKey,
      symbol.startPos,
      symbol.endPos,
      symbol.name,
      symbol.kind,
      symbol.description || '',
      JSON.stringify(symbol.dependencies),
      new Date().toISOString(),
    ]);
  }
  
  db.close();
  
  if (options.verbose) {
    console.log(`Stored ${symbols.length} symbol definitions in database`);
  }
};

export default storeSymbolDefinitions; 