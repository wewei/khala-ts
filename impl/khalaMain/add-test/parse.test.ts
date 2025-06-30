import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { join } from "node:path";
import { rmSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import parseTypeScriptFile from "../add/parseTypeScriptFile";

describe("TypeScript parsing", () => {
  let testFolder: string;
  let testFile: string;
  let tsConfigPath: string;
  
  beforeAll(() => {
    testFolder = mkdtempSync(join(tmpdir(), "khala-parse-test-"));
    testFile = join(testFolder, "test.ts");
    tsConfigPath = join(testFolder, "tsconfig.json");
    
    const testContent = `
export function hello(name: string): string {
  return \`Hello, \${name}!\`;
}

export const GREETING = "Hello, World!";

export type User = {
  id: string;
  name: string;
};

export interface Config {
  apiUrl: string;
  timeout: number;
}

export class UserService {
  constructor(private config: Config) {}
  
  getUser(id: string): User | null {
    return null;
  }
}
`;
    writeFileSync(testFile, testContent);
    
    // Create a tsconfig.json file
    const tsConfigContent = {
      compilerOptions: {
        target: "ES2020",
        module: "ESNext",
        moduleResolution: "node",
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        skipLibCheck: true,
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
      },
      include: ["**/*.ts", "**/*.tsx"],
      exclude: ["node_modules"],
    };
    writeFileSync(tsConfigPath, JSON.stringify(tsConfigContent, null, 2));
  });
  
  afterAll(() => {
    try {
      rmSync(testFolder, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });
  
  it("should parse TypeScript file and extract symbols using tsconfig.json", () => {
    const symbols = parseTypeScriptFile(testFile, tsConfigPath);
    
    expect(symbols).toBeDefined();
    expect(Array.isArray(symbols)).toBe(true);
    expect(symbols.length).toBeGreaterThan(0);
    
    // Check for specific symbols
    const symbolNames = symbols.map(s => s.qualifiedName);
    expect(symbolNames).toContain("hello");
    expect(symbolNames).toContain("GREETING");
    expect(symbolNames).toContain("User");
    expect(symbolNames).toContain("Config");
    expect(symbolNames).toContain("UserService");
    
    // Check symbol kinds
    const helloSymbol = symbols.find(s => s.qualifiedName === "hello");
    expect(helloSymbol?.kind).toBe("FunctionDeclaration");
    
    const userSymbol = symbols.find(s => s.qualifiedName === "User");
    expect(userSymbol?.kind).toBe("TypeAliasDeclaration");
    
    const configSymbol = symbols.find(s => s.qualifiedName === "Config");
    expect(configSymbol?.kind).toBe("InterfaceDeclaration");
    
    const serviceSymbol = symbols.find(s => s.qualifiedName === "UserService");
    expect(serviceSymbol?.kind).toBe("ClassDeclaration");
  });
  
  it("should handle missing tsconfig.json gracefully", () => {
    const nonExistentTsConfig = join(testFolder, "nonexistent-tsconfig.json");
    const symbols = parseTypeScriptFile(testFile, nonExistentTsConfig);
    
    expect(symbols).toBeDefined();
    expect(Array.isArray(symbols)).toBe(true);
    expect(symbols.length).toBeGreaterThan(0);
  });
}); 