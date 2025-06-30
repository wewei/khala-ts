import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { join } from "node:path";
import { rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { Database } from "bun:sqlite";
import ensureKhalaDatabase from "../ensureKhalaDatabase";
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
    expect(result.sqlitePath).toBe(join(testFolder, "khala.db"));
    expect(result.semanticIndexPath).toBe(join(testFolder, "semantic-index"));
    expect(result.error).toBeUndefined();
  });
  
  it("should create SQLite database with correct schema", () => {
    const dbPath = join(testFolder, "khala.db");
    const db = new Database(dbPath);
    
    // Check if tables exist
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('symbols', 'dependencies', 'namespaces')
    `).all();
    
    expect(tables).toHaveLength(3);
    expect(tables.map((t: any) => t.name)).toContain("symbols");
    expect(tables.map((t: any) => t.name)).toContain("dependencies");
    expect(tables.map((t: any) => t.name)).toContain("namespaces");
    
    // Check if indexes exist
    const indexes = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND name LIKE 'idx_%'
    `).all();
    
    expect(indexes.length).toBeGreaterThan(0);
    
    db.close();
  });
  
  it("should create semantic index directory structure", () => {
    const semanticIndexPath = join(testFolder, "semantic-index");
    const { readdirSync } = require("node:fs");
    
    const subdirs = readdirSync(semanticIndexPath);
    expect(subdirs).toContain("symbols");
    expect(subdirs).toContain("descriptions");
    expect(subdirs).toContain("content");
  });
  
  it("should handle existing database gracefully", () => {
    // Call again with same folder
    const result: DatabaseInitResult = ensureKhalaDatabase(testFolder);
    
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });
}); 