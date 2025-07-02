import type { SourceFile, CompilerOptions, System } from "typescript";
import { createVirtualTypeScriptEnvironment } from "@typescript/vfs";
import type { Result } from "@d/common/result";
import success from "@i/success";
import fail from "@i/fail";

type ParseTypeScriptProgramOptions = {
  /** Virtual file system containing the TypeScript files */
  vfs: System;
  /** Path to the TypeScript file to parse */
  filePath: string;
  /** Compiler options for TypeScript parsing */
  compilerOptions?: CompilerOptions;
};

/**
 * Parse a TypeScript file using a virtual file system and return the semantic tree node
 * 
 * This function uses @typescript/vfs to parse TypeScript files without accessing the real file system.
 * It returns the TypeScript AST SourceFile node without generating SymbolInfo objects.
 * 
 * @param options - Configuration options for parsing
 * @returns Parse result containing the source file node or error information
 */
const parseTypeScriptProgram = (options: ParseTypeScriptProgramOptions): Result<SourceFile> => {
  const { vfs, filePath, compilerOptions = {} } = options;
  
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
    
    // Create a virtual TypeScript environment
    const env = createVirtualTypeScriptEnvironment(vfs, [filePath], ts, mergedOptions);
    
    // Get the source file from the environment
    const sourceFile = env.languageService.getProgram()?.getSourceFile(filePath);
    
    if (!sourceFile) {
      // Collect diagnostics for more informative error messages
      const diagnostics = env.languageService.getProgram()?.getSyntacticDiagnostics() || [];
      const errorMessages = diagnostics.map(d => d.messageText).join("\n");
      return fail(`Could not parse source file: ${filePath}${errorMessages ? `\n${errorMessages}` : ""}`);
    }
    
    return success(sourceFile);
    
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error));
  }
};

export default parseTypeScriptProgram;
export type { ParseTypeScriptProgramOptions }; 