import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createSystem } from "@typescript/vfs";
import type { CompilerOptions } from "typescript";
import * as ts from "typescript";
import parseTypeScriptProgram from "@i/parseTypeScriptProgram";
import isSuccess from "@i/isSuccess";
import type { CompilerOptionsWithMetadata, ParsedSourceFile } from "@d/add/types";
import { generateFileHash } from "@i/hashUtils";

/**
 * Find tsconfig.json in parent directories
 */
const findTsConfig = (filePath: string): string | null => {
  let currentDir = dirname(resolve(filePath));
  
  while (currentDir !== dirname(currentDir)) {
    const tsConfigPath = resolve(currentDir, "tsconfig.json");
    if (existsSync(tsConfigPath)) {
      return tsConfigPath;
    }
    currentDir = dirname(currentDir);
  }
  
  return null;
};

/**
 * Load and parse tsconfig.json
 */
const loadTsConfig = (tsConfigPath: string | null): CompilerOptionsWithMetadata => {
  const defaultOptions: CompilerOptionsWithMetadata = {
    configFilePath: "default",
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    skipLibCheck: true,
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true,
  };
  
  if (!tsConfigPath || !existsSync(tsConfigPath)) {
    return defaultOptions;
  }
  
  try {
    const tsConfigContent = readFileSync(tsConfigPath, "utf-8");
    const tsConfig = ts.parseConfigFileTextToJson(tsConfigPath, tsConfigContent);
    
    if (tsConfig.config) {
      const parsedConfig = ts.parseJsonConfigFileContent(
        tsConfig.config,
        ts.sys,
        dirname(tsConfigPath),
        defaultOptions
      );
      
      return {
        ...defaultOptions,
        ...parsedConfig.options,
        configFilePath: tsConfigPath
      };
    }
  } catch (error) {
    console.warn(`Warning: Could not parse tsconfig.json at ${tsConfigPath}, using defaults`);
  }
  
  return defaultOptions;
};

/**
 * Load compiler options for a file
 */
const loadCompilerOptionsForFile = (filePath: string): CompilerOptionsWithMetadata => {
  const tsConfigPath = findTsConfig(filePath);
  return loadTsConfig(tsConfigPath);
};

/**
 * Parse TypeScript program for a single file
 */
const parseTypeScriptProgramForFile = (
  filePath: string,
  compilerOptions: CompilerOptions
): ParsedSourceFile | null => {
  try {
    // Read file content
    const content = readFileSync(filePath, "utf-8");
    
    // Use a simple virtual file system with just the file
    const vfs = createSystem(new Map([
      ["/test.ts", content]
    ]));
    
    // Parse the file
    const result = parseTypeScriptProgram({
      vfs,
      filePath: "/test.ts",
      compilerOptions
    });
    
    if (!isSuccess(result)) {
      console.error(`Failed to parse TypeScript file: ${result.error}`);
      return null;
    }
    
    const sourceFiles = result.value;
    const sourceFile = sourceFiles["/test.ts"];
    
    if (!sourceFile) {
      console.error(`Source file not found in parse result: ${filePath}`);
      return null;
    }
    
    // Generate file hash
    const hash = generateFileHash(content);
    
    return {
      filePath,
      content,
      hash,
      sourceFile
    };
    
  } catch (error) {
    console.error(`Error parsing TypeScript file: ${error}`);
    return null;
  }
};

/**
 * Check if file exists in Khala database
 */
const fileExistsInKhala = (fileHash: string, filesPath: string): boolean => {
  const { getSourceFilePath } = require("@i/ensureKhalaDatabase/filePathUtils");
  const sourceFilePath = getSourceFilePath(filesPath, fileHash);
  return existsSync(sourceFilePath);
};

export {
  loadCompilerOptionsForFile,
  parseTypeScriptProgramForFile,
  fileExistsInKhala,
  findTsConfig,
  loadTsConfig,
}; 