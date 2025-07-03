import { describe, it, expect } from "bun:test";
import { createSystem } from "@typescript/vfs";
import extractSymbols from "../inspect/extractSymbols";
import type { InspectOptions } from "@d/cli/inspect";

describe("inspect symbols", () => {
  it("should extract symbols from a simple TypeScript file", async () => {
    const vfs = createSystem(new Map([
      ["/test.ts", `
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
      `],
    ]));
    
    const options: InspectOptions = {
      detailed: true,
      format: "json"
    };
    
    const result = await extractSymbols("/test.ts", "/tsconfig.json", options);
    
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
    const vfs = createSystem(new Map([
      ["/empty.ts", `// This file has no symbols`],
    ]));
    
    const options: InspectOptions = {};
    const result = await extractSymbols("/empty.ts", "/tsconfig.json", options);
    
    expect(result.totalCount).toBe(0);
    expect(result.filesProcessed).toBe(1);
    expect(result.symbols.length).toBe(0);
  });
  
  it("should handle class declarations", async () => {
    const vfs = createSystem(new Map([
      ["/class.ts", `
        export class Calculator {
          add(a: number, b: number): number {
            return a + b;
          }
        }
        
        enum Status {
          Active = "active",
          Inactive = "inactive"
        }
      `],
    ]));
    
    const options: InspectOptions = {};
    const result = await extractSymbols("/class.ts", "/tsconfig.json", options);
    
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
}); 