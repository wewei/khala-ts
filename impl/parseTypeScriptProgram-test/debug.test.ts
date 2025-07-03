import { describe, it, expect } from "bun:test";
import parseTypeScriptProgram from "@i/parseTypeScriptProgram";
import { createSystem } from "@typescript/vfs";
import isSuccess from "@i/isSuccess";

describe("parseTypeScriptProgram - Debug", () => {
  it("should parse a single file", () => {
    const vfs = createSystem(new Map([
      ["/test.ts", `export function hello() { return "world"; }`],
    ]));
    
    const result = parseTypeScriptProgram({
      vfs,
      filePath: "/test.ts",
    });
    
    expect(isSuccess(result)).toBe(true);
  });
  
  it("should parse multiple files with explicit list", () => {
    const vfs = createSystem(new Map([
      ["/file1.ts", `export function func1() {}`],
      ["/file2.ts", `export function func2() {}`],
    ]));
    
    const result = parseTypeScriptProgram({
      vfs,
      files: ["/file1.ts", "/file2.ts"],
    });
    
    expect(isSuccess(result)).toBe(true);
  });
}); 