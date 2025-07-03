import { existsSync, statSync, readFileSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { createSystem } from "@typescript/vfs";
import parseTypeScriptProgram from "@i/parseTypeScriptProgram";
import isSuccess from "@i/isSuccess";
import extractSymbolsFromSourceFile from "@i/extractSymbolsFromSourceFile";
import type { InspectOptions, SymbolInfo, InspectSymbolsResult } from "@d/cli/inspect";
import isTypeScriptFile from "./isTypeScriptFile";
import findTypeScriptFiles from "./findTypeScriptFiles";

/**
 * Create a virtual file system from real files
 */
const createVfsFromRealFiles = (files: string[], baseDir: string): { vfs: any; vfsPaths: string[] } => {
  const fileMap = new Map<string, string>();
  const vfsPaths: string[] = [];
  
  for (const filePath of files) {
    try {
      const content = readFileSync(filePath, "utf-8");
      const fileName = basename(filePath);
      const vfsPath = `/${fileName}`;
      
      fileMap.set(vfsPath, content);
      vfsPaths.push(vfsPath);
    } catch (error) {
      // Skip files that can't be read
      console.warn(`Warning: Could not read file ${filePath}: ${error}`);
    }
  }
  
  return {
    vfs: createSystem(fileMap),
    vfsPaths
  };
};

/**
 * Extract symbols from a file or directory using parseTypeScriptProgram
 */
const extractSymbols = async (
  targetPath: string, 
): Promise<InspectSymbolsResult> => {
  const startTime = Date.now();
  const resolvedTarget = resolve(targetPath);
  
  // Check if the target exists
  if (!existsSync(resolvedTarget)) {
    return {
      symbols: [],
      totalCount: 0,
      filesProcessed: 0,
      processingTime: Date.now() - startTime,
      errors: [`Target path does not exist: ${resolvedTarget}`]
    };
  }
  
  const stats = statSync(resolvedTarget);
  let filesToProcess: string[] = [];
  
  if (stats.isFile()) {
    // Single file mode
    if (isTypeScriptFile(resolvedTarget)) {
      filesToProcess = [resolvedTarget];
    } else {
      return {
        symbols: [],
        totalCount: 0,
        filesProcessed: 0,
        processingTime: Date.now() - startTime,
        errors: [`File is not a TypeScript file: ${resolvedTarget}`]
      };
    }
  } else if (stats.isDirectory()) {
    // Directory mode - find all TypeScript files
    filesToProcess = findTypeScriptFiles(resolvedTarget);
    
    if (filesToProcess.length === 0) {
      return {
        symbols: [],
        totalCount: 0,
        filesProcessed: 0,
        processingTime: Date.now() - startTime,
        errors: [`No TypeScript files found in directory: ${resolvedTarget}`]
      };
    }
  } else {
    return {
      symbols: [],
      totalCount: 0,
      filesProcessed: 0,
      processingTime: Date.now() - startTime,
      errors: [`Target is neither a file nor a directory: ${resolvedTarget}`]
    };
  }
  
  // Create VFS from real files
  const { vfs, vfsPaths } = createVfsFromRealFiles(filesToProcess, resolvedTarget);
  
  if (vfsPaths.length === 0) {
    return {
      symbols: [],
      totalCount: 0,
      filesProcessed: 0,
      processingTime: Date.now() - startTime,
      errors: ["No files could be read from the file system"]
    };
  }
  
  // Parse the files using parseTypeScriptProgram
  const parseResult = parseTypeScriptProgram({
    vfs,
    files: vfsPaths,
    baseDir: "/"
  });
  
  if (!isSuccess(parseResult)) {
    return {
      symbols: [],
      totalCount: 0,
      filesProcessed: 0,
      processingTime: Date.now() - startTime,
      errors: [parseResult.error]
    };
  }
  
  // Extract symbols from the parsed source files
  const allSymbols: SymbolInfo[] = [];
  const sourceFiles = parseResult.value;
  
  for (const [filePath, sourceFile] of Object.entries(sourceFiles)) {
    const fileSymbols = extractSymbolsFromSourceFile(sourceFile, filePath);
    allSymbols.push(...fileSymbols);
  }
  
  return {
    symbols: allSymbols,
    totalCount: allSymbols.length,
    filesProcessed: Object.keys(sourceFiles).length,
    processingTime: Date.now() - startTime
  };
};

export default extractSymbols; 