import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { Database } from "bun:sqlite";
import type { ASTNode, Symbol, SymbolRef, SourceFileMetadata, ASTFile } from "@d/add/types";
import { getSourceFilePath, getASTFilePath } from "@i/ensureKhalaDatabase/filePathUtils";
import { ensureDirectory, removeFileAndCleanup } from "@i/directoryUtils";

/**
 * Generate file description from content
 */
const generateFileDescription = (content: string): string => {
  // Extract first few lines for description
  const lines = content.split('\n').slice(0, 3);
  const preview = lines.join(' ').substring(0, 100);
  return preview + (preview.length === 100 ? '...' : '');
};

/**
 * Store source file content
 */
const storeSourceFileContent = (
  fileHash: string, 
  content: string, 
  filesPath: string,
  sqlitePath: string,
  options: { verbose?: boolean } = {}
): void => {
  const filePath = getSourceFilePath(filesPath, fileHash);
  const dir = dirname(filePath);
  
  if (options.verbose) {
    console.log(`Writing source file to: ${filePath}`);
  }
  
  // Ensure directory exists
  ensureDirectory(dir, options);
  
  // Write file content
  writeFileSync(filePath, content, 'utf-8');
  
  if (options.verbose) {
    console.log(`Wrote ${content.length} bytes to source file`);
  }
  
  // Store metadata in SQLite
  const metadata: SourceFileMetadata = {
    key: fileHash,
    description: generateFileDescription(content),
    size: content.length,
    createdAt: new Date().toISOString()
  };
  
  if (options.verbose) {
    console.log(`Storing metadata: ${metadata.description} (${metadata.size} bytes)`);
  }
  
  insertSourceFileMetadata(metadata, sqlitePath);
};

/**
 * Store AST nodes
 */
const storeASTNodes = (
  fileHash: string, 
  astNodes: ASTNode[], 
  filesPath: string,
  options: { verbose?: boolean } = {}
): void => {
  const astFilePath = getASTFilePath(filesPath, fileHash);
  const dir = dirname(astFilePath);
  
  if (options.verbose) {
    console.log(`Writing AST file to: ${astFilePath}`);
  }
  
  // Ensure directory exists
  ensureDirectory(dir, options);
  
  // Store AST as JSON
  const astFile: ASTFile = {
    version: 1,
    nodes: astNodes.map(node => ({
      startPos: node.startPos,
      endPos: node.endPos,
      kind: node.kind,
      attributes: node.attributes
    }))
  };
  
  writeFileSync(astFilePath, JSON.stringify(astFile, null, 2), 'utf-8');
  
  if (options.verbose) {
    console.log(`Wrote AST file with ${astNodes.length} nodes`);
  }
};

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
    metadata.createdAt
  ]);
  
  db.close();
};

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
      new Date().toISOString()
    ]);
  }
  
  db.close();
  
  if (options.verbose) {
    console.log(`Stored ${symbols.length} symbol definitions in database`);
  }
};

/**
 * Extract symbol references from AST nodes
 * TODO: Implement reference extraction logic
 */
const extractSymbolReferences = (ast: ASTNode[], symbols: Symbol[]): SymbolRef[] => {
  // For now, return empty array
  // This should be implemented to find symbol references
  return [];
};

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
      new Date().toISOString()
    ]);
  }
  
  db.close();
  
  if (options.verbose) {
    console.log(`Stored ${references.length} symbol references in database`);
  }
};

/**
 * Update semantic index for symbols
 * TODO: Implement LanceDB integration
 */
const indexSymbols = (
  symbols: Symbol[], 
  options: { verbose?: boolean } = {}
): void => {
  if (options.verbose) {
    console.log(`Would update semantic index for ${symbols.length} symbols (LanceDB integration pending)`);
  }
  // TODO: Implement semantic indexing with LanceDB
};

/**
 * Store source file with all components
 */
const storeSourceFile = (
  fileHash: string, 
  content: string,
  ast: ASTNode[], 
  symbols: Symbol[],
  config: {
    filesPath: string;
    sqlitePath: string;
  },
  options: { verbose?: boolean } = {}
): void => {
  if (options.verbose) {
    console.log(`Storing source file with hash: ${fileHash}`);
  }
  
  // Store source file content
  if (options.verbose) {
    console.log(`Storing source file content`);
  }
  storeSourceFileContent(fileHash, content, config.filesPath, config.sqlitePath, options);
  
  // Store AST nodes
  if (options.verbose) {
    console.log(`Storing ${ast.length} AST nodes`);
  }
  storeASTNodes(fileHash, ast, config.filesPath, options);
  
  // Store symbol definitions
  if (options.verbose) {
    console.log(`Storing ${symbols.length} symbol definitions`);
  }
  storeSymbolDefinitions(symbols, config.sqlitePath, options);
  
  // Extract and store symbol references
  const references = extractSymbolReferences(ast, symbols);
  storeSymbolReferences(references, config.sqlitePath, options);
  
  // Update semantic index
  indexSymbols(symbols, options);
  
  if (options.verbose) {
    console.log(`Successfully stored file in database`);
  }
};

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

export {
  storeSourceFile,
  removeSourceFile,
  storeSourceFileContent,
  storeASTNodes,
  storeSymbolDefinitions,
  storeSymbolReferences,
  extractSymbolReferences,
  indexSymbols,
}; 