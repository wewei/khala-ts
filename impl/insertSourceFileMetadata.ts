import { Database } from "bun:sqlite";
import type { SourceFileMetadata } from "@d/add/types";

/**
 * Insert source file metadata into SQLite
 */
const insertSourceFileMetadata = (metadata: SourceFileMetadata, sqlitePath: string): void => {
  const db = new Database(sqlitePath);
  
  db.run(`
    INSERT OR REPLACE INTO source_file_metadata (
      key, description, size, created_at
    ) VALUES (?, ?, ?, ?)
  `, [
    metadata.key,
    metadata.description,
    metadata.size,
    metadata.createdAt,
  ]);
  
  db.close();
};

export default insertSourceFileMetadata; 