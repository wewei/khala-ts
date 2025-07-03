import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import parseTypeScriptProgram from "@i/parseTypeScriptProgram";
import { createSystem } from "@typescript/vfs";
import isSuccess from "@i/isSuccess";

describe("parseTypeScriptProgram - Multi-file parsing", () => {
  let tempDir: string;
  
  beforeAll(() => {
    tempDir = mkdtempSync(join(tmpdir(), "khala-multi-parse-test-"));
  });
  
  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });
  
  it("should parse multiple files with explicit file list", () => {
    const vfs = createSystem(new Map([
      ["/src/main.ts", `
        import { User } from './types';
        import { createUser } from './utils';
        
        export function app() {
          const user = createUser("John");
          return user;
        }
      `],
      ["/src/types.ts", `
        export interface User {
          id: string;
          name: string;
          email?: string;
        }
      `],
      ["/src/utils.ts", `
        import { User } from './types';
        
        export function createUser(name: string): User {
          return {
            id: Date.now().toString(),
            name,
          };
        }
      `],
    ]));
    
    const result = parseTypeScriptProgram({
      vfs,
      files: ["/src/main.ts", "/src/types.ts", "/src/utils.ts"],
    });
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      const sourceFiles = result.value as Record<string, any>;
      expect(Object.keys(sourceFiles)).toHaveLength(3);
      expect(sourceFiles["/src/main.ts"]).toBeDefined();
      expect(sourceFiles["/src/types.ts"]).toBeDefined();
      expect(sourceFiles["/src/utils.ts"]).toBeDefined();
    }
  });
  
  it("should parse files using include patterns", () => {
    const vfs = createSystem(new Map([
      ["/src/main.ts", `export function main() {}`],
      ["/src/types.ts", `export type User = { name: string };`],
      ["/src/utils.ts", `export function helper() {}`],
      ["/test/test.ts", `export function test() {}`],
      ["/docs/README.md", `# Documentation`],
    ]));
    
    const result = parseTypeScriptProgram({
      vfs,
      include: ["src/**/*.ts"],
      baseDir: "/",
    });
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      const sourceFiles = result.value as Record<string, any>;
      expect(Object.keys(sourceFiles)).toHaveLength(3);
      expect(sourceFiles["/src/main.ts"]).toBeDefined();
      expect(sourceFiles["/src/types.ts"]).toBeDefined();
      expect(sourceFiles["/src/utils.ts"]).toBeDefined();
      expect(sourceFiles["/test/test.ts"]).toBeUndefined();
    }
  });
  
  it("should exclude files using exclude patterns", () => {
    const vfs = createSystem(new Map([
      ["/src/main.ts", `export function main() {}`],
      ["/src/types.ts", `export type User = { name: string };`],
      ["/src/test.ts", `export function test() {}`],
      ["/src/temp.ts", `export function temp() {}`],
    ]));
    
    const result = parseTypeScriptProgram({
      vfs,
      include: ["src/**/*.ts"],
      exclude: ["**/*.test.ts", "**/temp.ts"],
      baseDir: "/",
    });
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      const sourceFiles = result.value as Record<string, any>;
      expect(Object.keys(sourceFiles)).toHaveLength(2);
      expect(sourceFiles["/src/main.ts"]).toBeDefined();
      expect(sourceFiles["/src/types.ts"]).toBeDefined();
      expect(sourceFiles["/src/test.ts"]).toBeUndefined();
      expect(sourceFiles["/src/temp.ts"]).toBeUndefined();
    }
  });
  
  it("should handle tsconfig.json file list configuration", () => {
    const vfs = createSystem(new Map([
      ["/tsconfig.json", `{
        "compilerOptions": {
          "target": "ES2020",
          "module": "ESNext"
        },
        "include": ["src/**/*.ts"],
        "exclude": ["**/*.test.ts"]
      }`],
      ["/src/main.ts", `export function main() {}`],
      ["/src/types.ts", `export type User = { name: string };`],
      ["/src/test.ts", `export function test() {}`],
    ]));
    
    const result = parseTypeScriptProgram({
      vfs,
      useTsConfigFileList: true,
      include: ["src/**/*.ts"],
      exclude: ["**/*.test.ts"],
      baseDir: "/",
    });
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      const sourceFiles = result.value as Record<string, any>;
      expect(Object.keys(sourceFiles)).toHaveLength(2);
      expect(sourceFiles["/src/main.ts"]).toBeDefined();
      expect(sourceFiles["/src/types.ts"]).toBeDefined();
      expect(sourceFiles["/src/test.ts"]).toBeUndefined();
    }
  });
  
  it("should fall back to single file mode when only filePath is provided", () => {
    const vfs = createSystem(new Map([
      ["/src/main.ts", `export function main() {}`],
      ["/src/types.ts", `export type User = { name: string };`],
    ]));
    
    const result = parseTypeScriptProgram({
      vfs,
      filePath: "/src/main.ts",
    });
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      const sourceFiles = result.value as Record<string, any>;
      expect(Object.keys(sourceFiles)).toHaveLength(1);
      expect(sourceFiles["/src/main.ts"]).toBeDefined();
      expect(sourceFiles["/src/types.ts"]).toBeUndefined();
    }
  });
  
  it("should return error when no files are specified", () => {
    const vfs = createSystem(new Map([
      ["/src/main.ts", `export function main() {}`],
    ]));
    
    const result = parseTypeScriptProgram({
      vfs,
    });
    
    expect(isSuccess(result)).toBe(false);
    if (!isSuccess(result)) {
      expect(result.error).toContain("No files specified for parsing");
    }
  });
  
  it("should return error when no files match the patterns", () => {
    const vfs = createSystem(new Map([
      ["/src/main.ts", `export function main() {}`],
    ]));
    
    const result = parseTypeScriptProgram({
      vfs,
      include: ["nonexistent/**/*.ts"],
      baseDir: "/",
    });
    
    expect(isSuccess(result)).toBe(false);
    if (!isSuccess(result)) {
      expect(result.error).toContain("No files found to parse");
    }
  });
  
  it("should handle complex glob patterns", () => {
    const vfs = createSystem(new Map([
      ["/src/components/Button.tsx", `export function Button() {}`],
      ["/src/components/Input.tsx", `export function Input() {}`],
      ["/src/utils/helpers.ts", `export function helper() {}`],
      ["/src/utils/constants.ts", `export const API_URL = "https://api.example.com";`],
      ["/src/pages/Home.tsx", `export function Home() {}`],
      ["/src/pages/About.tsx", `export function About() {}`],
      ["/src/styles/global.css", `body { margin: 0; }`],
    ]));
    
    const result = parseTypeScriptProgram({
      vfs,
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/styles/**"],
      baseDir: "/",
    });
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      const sourceFiles = result.value as Record<string, any>;
      expect(Object.keys(sourceFiles)).toHaveLength(5);
      expect(sourceFiles["/src/components/Button.tsx"]).toBeDefined();
      expect(sourceFiles["/src/components/Input.tsx"]).toBeDefined();
      expect(sourceFiles["/src/utils/helpers.ts"]).toBeDefined();
      expect(sourceFiles["/src/utils/constants.ts"]).toBeDefined();
      expect(sourceFiles["/src/pages/Home.tsx"]).toBeDefined();
      expect(sourceFiles["/src/pages/About.tsx"]).toBeDefined();
      expect(sourceFiles["/src/styles/global.css"]).toBeUndefined();
    }
  });
}); 