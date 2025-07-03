import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { writeFileSync, unlinkSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import extractSymbols from "../inspect/extractSymbols";
import type { InspectOptions } from "@d/cli/inspect";

describe("inspect symbols", () => {
  let tempDir: string;
  
  beforeAll(() => {
    tempDir = mkdtempSync(join(tmpdir(), "khala-inspect-test-"));
  });
  
  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });
  
  it("should extract symbols from a simple TypeScript file", async () => {
    const testFile = join(tempDir, "test.ts");
    writeFileSync(testFile, `
      export function hello(name: string): string {
        return \`Hello \${name}!\`;
      }
      
      const greeting = "Hello World";
      
      export type User = {
        name: string;
        age: number;
      };
      
      export interface Config {
        apiUrl: string;
        timeout: number;
      }
    `);
    
    const result = await extractSymbols(testFile);
    
    expect(result.totalCount).toBe(4);
    expect(result.filesProcessed).toBe(1);
    expect(result.symbols.length).toBe(4);
    
    // Check for function
    const functionSymbol = result.symbols.find(s => s.name === "hello");
    expect(functionSymbol).toBeDefined();
    expect(functionSymbol!.kind).toBe("function");
    expect(functionSymbol!.exported).toBe(true);
    
    // Check for variable
    const variableSymbol = result.symbols.find(s => s.name === "greeting");
    expect(variableSymbol).toBeDefined();
    expect(variableSymbol!.kind).toBe("variable");
    expect(variableSymbol!.exported).toBe(false);
    
    // Check for type
    const typeSymbol = result.symbols.find(s => s.name === "User");
    expect(typeSymbol).toBeDefined();
    expect(typeSymbol!.kind).toBe("type");
    expect(typeSymbol!.exported).toBe(true);
    
    // Check for interface
    const interfaceSymbol = result.symbols.find(s => s.name === "Config");
    expect(interfaceSymbol).toBeDefined();
    expect(interfaceSymbol!.kind).toBe("interface");
    expect(interfaceSymbol!.exported).toBe(true);
  });
  
  it("should handle files with no symbols", async () => {
    const emptyFile = join(tempDir, "empty.ts");
    writeFileSync(emptyFile, `// This file has no symbols`);
    
    const result = await extractSymbols(emptyFile);
    
    expect(result.totalCount).toBe(0);
    expect(result.filesProcessed).toBe(1);
    expect(result.symbols.length).toBe(0);
  });
  
  it("should handle class declarations", async () => {
    const classFile = join(tempDir, "class.ts");
    writeFileSync(classFile, `
      export class Calculator {
        add(a: number, b: number): number {
          return a + b;
        }
      }
      
      enum Status {
        Active = "active",
        Inactive = "inactive"
      }
    `);
    
    const result = await extractSymbols(classFile);
    
    expect(result.totalCount).toBe(2);
    
    // Check for class
    const classSymbol = result.symbols.find(s => s.name === "Calculator");
    expect(classSymbol).toBeDefined();
    expect(classSymbol!.kind).toBe("class");
    expect(classSymbol!.exported).toBe(true);
    
    // Check for enum
    const enumSymbol = result.symbols.find(s => s.name === "Status");
    expect(enumSymbol).toBeDefined();
    expect(enumSymbol!.kind).toBe("enum");
    expect(enumSymbol!.exported).toBe(false);
  });
  
  it("should handle non-existent files", async () => {
    const nonExistentFile = join(tempDir, "nonexistent.ts");
    
    const result = await extractSymbols(nonExistentFile);
    
    expect(result.totalCount).toBe(0);
    expect(result.filesProcessed).toBe(0);
    expect(result.symbols.length).toBe(0);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
    expect(result.errors![0]).toContain("does not exist");
  });
  
  it("should handle non-TypeScript files", async () => {
    const jsFile = join(tempDir, "test.js");
    writeFileSync(jsFile, `console.log("Hello World");`);
    
    const result = await extractSymbols(jsFile);
    
    expect(result.totalCount).toBe(0);
    expect(result.filesProcessed).toBe(0);
    expect(result.symbols.length).toBe(0);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
    expect(result.errors![0]).toContain("not a TypeScript file");
  });
}); 