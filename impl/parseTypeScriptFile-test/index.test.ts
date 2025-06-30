import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import parseTypeScriptFile from "@i/parseTypeScriptFile";

describe("parseTypeScriptFile (modular)", () => {
  let tempDir: string;
  
  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "khala-test-"));
  });
  
  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });
  
  it("should parse a simple TypeScript file", () => {
    // Create a simple TypeScript file
    const tsFile = join(tempDir, "test.ts");
    const tsConfigFile = join(tempDir, "tsconfig.json");
    
    const tsContent = `
      function hello(name: string): string {
        return \`Hello \${name}!\`;
      }
      
      const greeting = "Hello World";
      
      type User = {
        name: string;
        age: number;
      };
    `;
    
    const tsConfigContent = `{
      "compilerOptions": {
        "target": "ES2020",
        "module": "ESNext",
        "strict": true
      }
    }`;
    
    writeFileSync(tsFile, tsContent);
    writeFileSync(tsConfigFile, tsConfigContent);
    
    const symbols = parseTypeScriptFile(tsFile, tsConfigFile);
    
    expect(symbols).toBeDefined();
    expect(symbols.length).toBeGreaterThan(0);
    
    // Check that we have the expected symbols
    const symbolNames = symbols.map(s => s.qualifiedName);
    expect(symbolNames).toContain("hello");
    expect(symbolNames).toContain("greeting");
    expect(symbolNames).toContain("User");
    
    // Check symbol kinds
    const helloSymbol = symbols.find(s => s.qualifiedName === "hello");
    expect(helloSymbol?.kind).toBe("FunctionDeclaration");
    
    const greetingSymbol = symbols.find(s => s.qualifiedName === "greeting");
    expect(greetingSymbol?.kind).toBe("VariableDeclaration");
    
    const userSymbol = symbols.find(s => s.qualifiedName === "User");
    expect(userSymbol?.kind).toBe("TypeAliasDeclaration");
  });
  
  it("should handle missing tsconfig.json gracefully", () => {
    const tsFile = join(tempDir, "test.ts");
    const nonExistentTsConfig = join(tempDir, "nonexistent.json");
    
    const tsContent = `
      function test(): void {
        console.log("test");
      }
    `;
    
    writeFileSync(tsFile, tsContent);
    
    const symbols = parseTypeScriptFile(tsFile, nonExistentTsConfig);
    
    expect(symbols).toBeDefined();
    expect(symbols.length).toBeGreaterThan(0);
  });
}); 