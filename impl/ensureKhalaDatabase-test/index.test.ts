import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { join } from "node:path";
import { rmSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { Database } from "bun:sqlite";
import ensureKhalaDatabase from "@i/ensureKhalaDatabase";
import type { DatabaseInitResult } from "@d/database/khala";

describe("ensureKhalaDatabase", () => {
  let testFolder: string;
  
  beforeAll(() => {
    // Create a temporary directory that will be automatically cleaned up
    testFolder = mkdtempSync(join(tmpdir(), "khala-test-"));
  });
  
  afterAll(() => {
    // Clean up test folder
    try {
      rmSync(testFolder, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });
  
  it("should create Khala database successfully", () => {
    const result: DatabaseInitResult = ensureKhalaDatabase(testFolder);
    
    expect(result.success).toBe(true);
    expect(result.filesPath).toBe(join(testFolder, "files"));
    expect(result.sqlitePath).toBe(join(testFolder, "khala.db"));
    expect(result.semanticIndexPath).toBe(join(testFolder, "semantic-index"));
    expect(result.error).toBeUndefined();
  });
  
  it("should create SQLite database with correct schema", () => {
    const dbPath = join(testFolder, "khala.db");
    const db = new Database(dbPath);
    
    // Check if tables exist - updated to match current schema
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('source_file_metadata', 'symbol_definitions', 'symbol_references')
    `).all();
    
    expect(tables).toHaveLength(3);
    expect(tables.map((t: any) => t.name)).toContain("source_file_metadata");
    expect(tables.map((t: any) => t.name)).toContain("symbol_definitions");
    expect(tables.map((t: any) => t.name)).toContain("symbol_references");
    
    // Check if indexes exist
    const indexes = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND name LIKE 'idx_%'
    `).all();
    
    expect(indexes.length).toBeGreaterThan(0);
    
    // Verify specific indexes exist
    const indexNames = indexes.map((idx: any) => idx.name);
    expect(indexNames).toContain("idx_symbol_definitions_source_file");
    expect(indexNames).toContain("idx_symbol_definitions_name");
    expect(indexNames).toContain("idx_symbol_references_definition");
    expect(indexNames).toContain("idx_symbol_references_source_file");
    
    db.close();
  });
  
  it("should create semantic index directory structure", () => {
    const semanticIndexPath = join(testFolder, "semantic-index");
    
    const subdirs = readdirSync(semanticIndexPath);
    expect(subdirs).toContain("symbols");
    expect(subdirs).toContain("embeddings");
  });
  
  it("should create files directory structure", () => {
    const filesPath = join(testFolder, "files");
    
    // Check that the files directory exists
    expect(readdirSync(testFolder)).toContain("files");
    
    // The files directory should be empty initially
    // Hash-based subdirectories will be created on-demand when files are added
    const filesDirContents = readdirSync(filesPath);
    expect(filesDirContents.length).toBe(0);
  });
  
  it("should handle existing database gracefully", () => {
    // Call again with same folder
    const result: DatabaseInitResult = ensureKhalaDatabase(testFolder);
    
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });
}); 