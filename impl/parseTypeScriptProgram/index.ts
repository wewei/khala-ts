import type { SourceFile, CompilerOptions, System } from "typescript";
import { createVirtualTypeScriptEnvironment, createDefaultMapFromNodeModules } from "@typescript/vfs";
import type { Result } from "@d/common/result";
import success from "@i/success";
import fail from "@i/fail";
import { calculateFileList, parseTsConfigFileList, type TsConfigFileList } from "./calculateFileList";

type ParseTypeScriptProgramOptions = {
  /** Virtual file system containing the TypeScript files */
  vfs: System;
  /** Path to the TypeScript file to parse (single file mode) */
  filePath?: string;
  /** List of files to parse (multi-file mode) */
  files?: string[];
  /** Include patterns from tsconfig.json */
  include?: string[];
  /** Exclude patterns from tsconfig.json */
  exclude?: string[];
  /** Base directory for resolving relative paths */
  baseDir?: string;
  /** Compiler options for TypeScript parsing */
  compilerOptions?: CompilerOptions;
  /** Whether to use tsconfig.json file list configuration */
  useTsConfigFileList?: boolean;
};

/**
 * Parse TypeScript files using a virtual file system and return a record mapping file paths to SourceFile nodes
 * 
 * This function uses @typescript/vfs to parse TypeScript files without accessing the real file system.
 * It supports single file mode, multi-file mode, and tsconfig.json file list configuration.
 * 
 * @param options - Configuration options for parsing
 * @returns Parse result containing a record mapping file paths to SourceFile nodes or error information
 */
const parseTypeScriptProgram = (options: ParseTypeScriptProgramOptions): Result<Record<string, SourceFile>> => {
  const { 
    vfs, 
    filePath, 
    files, 
    include, 
    exclude, 
    baseDir = "/", 
    compilerOptions = {},
    useTsConfigFileList = false
  } = options;
  
  try {
    // Import TypeScript dynamically to avoid circular dependencies
    const ts = require("typescript");
    
    // Default compiler options
    const defaultOptions: CompilerOptions = {
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
    
    // Merge provided options with defaults
    const mergedOptions = { ...defaultOptions, ...compilerOptions };
    
    // Load TypeScript standard library files
    const libFiles = createDefaultMapFromNodeModules(mergedOptions, ts);
    
    // Create enhanced VFS with lib files
    const enhancedVfs = {
      ...vfs,
      readFile: (path: string) => {
        // First try to read from lib files, then from original VFS
        const libContent = libFiles.get(path);
        if (libContent) {
          return libContent;
        }
        return vfs.readFile(path);
      },
      fileExists: (path: string) => {
        return libFiles.has(path) || vfs.fileExists(path);
      },
    };
    
    // Determine which files to parse
    let filesToParse: string[] = [];
    
    if (filePath) {
      // Single file mode
      filesToParse = [filePath];
    } else if (files && files.length > 0) {
      // Explicit files list mode
      filesToParse = files;
    } else if (useTsConfigFileList || include || exclude) {
      // tsconfig.json file list mode
      const tsConfig: TsConfigFileList = {
        files,
        include,
        exclude,
        baseDir,
      };
      
      const fileListResult = calculateFileList({ vfs: enhancedVfs, tsConfig });
      if (!fileListResult.success) {
        return fail(fileListResult.error);
      }
      
      filesToParse = fileListResult.value;
    } else {
      return fail("No files specified for parsing. Provide filePath, files, or include patterns.");
    }
    
    if (filesToParse.length === 0) {
      return fail("No files found to parse based on the provided configuration.");
    }
    
    // Create a virtual TypeScript environment with all files
    const env = createVirtualTypeScriptEnvironment(enhancedVfs, filesToParse, ts, mergedOptions);
    
    // Get all source files from the environment
    const program = env.languageService.getProgram();
    if (!program) {
      return fail("Failed to create TypeScript program");
    }
    
    const sourceFiles: Record<string, SourceFile> = {};
    
    // Collect all source files
    for (const filePath of filesToParse) {
      const sourceFile = program.getSourceFile(filePath);
      if (sourceFile) {
        sourceFiles[filePath] = sourceFile;
      }
    }
    
    // Check for parsing errors
    const diagnostics = program.getSyntacticDiagnostics();
    if (diagnostics.length > 0) {
      const errorMessages = diagnostics.map(d => d.messageText).join("\n");
      console.warn(`TypeScript parsing warnings:\n${errorMessages}`);
    }
    
    if (Object.keys(sourceFiles).length === 0) {
      return fail("No source files could be parsed successfully");
    }
    
    return success(sourceFiles);
    
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error));
  }
};

export default parseTypeScriptProgram;
export type { ParseTypeScriptProgramOptions }; 