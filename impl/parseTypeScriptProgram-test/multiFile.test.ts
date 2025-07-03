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
      const sourceFilePaths = Object.keys(sourceFiles);
      expect(sourceFilePaths).toContain("/src/main.ts");
      expect(sourceFilePaths).toContain("/src/types.ts");
      expect(sourceFilePaths).toContain("/src/utils.ts");
      expect(sourceFilePaths).toHaveLength(3);
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
      const sourceFilePaths = Object.keys(sourceFiles);
      expect(sourceFilePaths).toContain("/src/main.ts");
      expect(sourceFilePaths).toContain("/src/types.ts");
      expect(sourceFilePaths).toContain("/src/utils.ts");
      expect(sourceFilePaths).not.toContain("/test/test.ts");
      expect(sourceFilePaths).toHaveLength(3);
    }
  });
  
  it("should exclude files using exclude patterns", () => {
    const vfs = createSystem(new Map([
      ["/src/main.ts", `export function main() {}`],
      ["/src/types.ts", `export type User = { name: string };`],
      ["/src/main.test.ts", `export function test() {}`],
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
      const sourceFilePaths = Object.keys(sourceFiles);
      expect(sourceFilePaths).toContain("/src/main.ts");
      expect(sourceFilePaths).toContain("/src/types.ts");
      expect(sourceFilePaths).not.toContain("/src/main.test.ts");
      expect(sourceFilePaths).not.toContain("/src/temp.ts");
      expect(sourceFilePaths).toHaveLength(2);
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
      ["/src/main.test.ts", `export function test() {}`],
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
      const sourceFilePaths = Object.keys(sourceFiles);
      expect(sourceFilePaths).toContain("/src/main.ts");
      expect(sourceFilePaths).toContain("/src/types.ts");
      expect(sourceFilePaths).not.toContain("/src/main.test.ts");
      expect(sourceFilePaths).toHaveLength(2);
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
      const sourceFilePaths = Object.keys(sourceFiles);
      expect(sourceFilePaths).toContain("/src/main.ts");
      expect(sourceFilePaths).not.toContain("/src/types.ts");
      expect(sourceFilePaths).toHaveLength(1);
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
      const sourceFilePaths = Object.keys(sourceFiles);
      expect(sourceFilePaths).toContain("/src/components/Button.tsx");
      expect(sourceFilePaths).toContain("/src/components/Input.tsx");
      expect(sourceFilePaths).toContain("/src/utils/helpers.ts");
      expect(sourceFilePaths).toContain("/src/utils/constants.ts");
      expect(sourceFilePaths).toContain("/src/pages/Home.tsx");
      expect(sourceFilePaths).toContain("/src/pages/About.tsx");
      expect(sourceFilePaths).not.toContain("/src/styles/global.css");
      expect(sourceFilePaths).toHaveLength(6);
    }
  });
}); 