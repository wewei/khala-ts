import { Database } from "bun:sqlite";
import { getSourceFilePath, getASTFilePath } from "@i/ensureKhalaDatabase/filePathUtils";
import { removeFileAndCleanup } from "@i/directoryUtils";

/**
 * Remove source file and clean up empty directories
 */
const removeSourceFile = (
  fileHash: string,
  config: {
    filesPath: string;
    sqlitePath: string;
  },
  options: { verbose?: boolean } = {}
): void => {
  if (options.verbose) {
    console.log(`Removing source file with hash: ${fileHash}`);
  }
  
  // Remove source file
  const sourceFilePath = getSourceFilePath(config.filesPath, fileHash);
  removeFileAndCleanup(sourceFilePath, options);
  
  // Remove AST file
  const astFilePath = getASTFilePath(config.filesPath, fileHash);
  removeFileAndCleanup(astFilePath, options);
  
  // Remove from SQLite database
  const db = new Database(config.sqlitePath);
  
  // Remove source file metadata
  db.run(`DELETE FROM source_file_metadata WHERE key = ?`, [fileHash]);
  
  // Remove symbol definitions
  db.run(`DELETE FROM symbol_definitions WHERE source_file_key = ?`, [fileHash]);
  
  // Remove symbol references
  db.run(`DELETE FROM symbol_references WHERE source_file_key = ?`, [fileHash]);
  
  db.close();
  
  if (options.verbose) {
    console.log(`Removed source file and all related data`);
  }
};

export default removeSourceFile; 