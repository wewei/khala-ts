import { describe, it, expect } from "bun:test";
import parseTypeScriptProgram from "../parseTypeScriptProgram";
import { createSystem, createDefaultMapFromNodeModules } from "@typescript/vfs";
import isSuccess from "@i/isSuccess";
import * as ts from "typescript";

// Helper function to create a VFS with TypeScript standard library files
const createVFSWithLib = (files: Map<string, string>) => {
  // Load TypeScript standard library files from node_modules
  const libFiles = createDefaultMapFromNodeModules({
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    skipLibCheck: true,
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true,
  }, ts);

  // Merge with provided files
  const allFiles = new Map([...libFiles, ...files]);
  
  return createSystem(allFiles);
};

describe("parseTypeScriptFileV2", () => {
  it("should parse a simple TypeScript file using VFS", () => {
    // Create a virtual file system with a test file
    const testFileContent = `
      function hello(name: string): string {
        return \`Hello \${name}!\`;
      }
      
      const greeting = "Hello World";
      
      type User = {
        name: string;
        age: number;
      };
    `;
    
    const vfs = createVFSWithLib(new Map([
      ["/test.ts", testFileContent],
    ]));
    
    const result = parseTypeScriptProgram({
      vfs,
      filePath: "/test.ts",
    });
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      const sourceFiles = result.value as Record<string, any>;
      const mainFile = sourceFiles["/test.ts"];
      expect(mainFile).toBeDefined();
      
      // Check that we have the expected nodes
      const nodes: string[] = [];
      mainFile.forEachChild((node: any) => {
        nodes.push(node.kind.toString());
      });
      
      // Should have function declaration, variable statement, and type alias
      expect(nodes.length).toBeGreaterThan(0);
    }
  });
  
  it("should handle missing file gracefully", () => {
    const vfs = createVFSWithLib(new Map());
    
    const result = parseTypeScriptProgram({
      vfs,
      filePath: "/nonexistent.ts",
    });
    
    expect(isSuccess(result)).toBe(false);
    if (!isSuccess(result)) {
      // The error should contain information about the missing file
      expect(result.error).toContain("File '/nonexistent.ts' not found.");
    }
  });
  
  it("should handle invalid TypeScript syntax", () => {
    const invalidTsContent = `
      function hello(name: string {  // Missing closing parenthesis
        return \`Hello \${name}!\`;
      }
    `;
    
    const vfs = createVFSWithLib(new Map([
      ["/invalid.ts", invalidTsContent],
    ]));
    
    const result = parseTypeScriptProgram({
      vfs,
      filePath: "/invalid.ts",
    });
    
    // Should still succeed as TypeScript parser is lenient
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      const sourceFiles = result.value as Record<string, any>;
      expect(sourceFiles["/invalid.ts"]).toBeDefined();
    }
  });
  
  it("should work with custom compiler options", () => {
    const testFileContent = `
      const greeting = "Hello World";
    `;
    
    const vfs = createVFSWithLib(new Map([
      ["/test.ts", testFileContent],
    ]));
    
    const result = parseTypeScriptProgram({
      vfs,
      filePath: "/test.ts",
      compilerOptions: {
        target: 1, // ES3
        module: 1, // CommonJS
      },
    });
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      const sourceFiles = result.value as Record<string, any>;
      expect(sourceFiles["/test.ts"]).toBeDefined();
    }
  });
}); 