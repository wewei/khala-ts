import { resolve } from "node:path";
import type { AddSourceFileResult, AddOptions } from "@d/add/types";
import { loadCompilerOptionsForFile, parseTypeScriptProgramForFile, fileExistsInKhala } from "@i/fileProcessor";
import { processSourceFile } from "@i/sourceFileProcessor";
import storeSourceFile from "@i/storeSourceFile";
import { loadSymbolMap, updateExistingSymbols } from "@i/symbolMapUtils";

/**
 * Add a source file to the Khala database
 */
const addSourceFile = (
  sourceFilePath: string,
  config: {
    filesPath: string;
    sqlitePath: string;
  },
  symbolMap: Record<string, string> = {},
  options: AddOptions = {}
): AddSourceFileResult => {
  try {
    if (options.verbose) {
      console.log(`Processing file: ${sourceFilePath}`);
    }

    // Load compiler options
    const compilerOptions = loadCompilerOptionsForFile(sourceFilePath);
    if (options.verbose) {
      console.log(`Loaded compiler options from: ${compilerOptions.configFilePath}`);
    }

    // Parse TypeScript program
    const parsedFile = parseTypeScriptProgramForFile(sourceFilePath, compilerOptions);
    if (!parsedFile) {
      return { 
        success: false, 
        error: `Failed to parse TypeScript file: ${sourceFilePath}` 
      };
    }

    if (options.verbose) {
      console.log(`Successfully parsed TypeScript file`);
    }

    // Generate file hash
    const fileHash = parsedFile.hash;
    if (options.verbose) {
      console.log(`Generated file hash: ${fileHash}`);
    }
    
    // Check if file already exists
    if (fileExistsInKhala(fileHash, config.filesPath)) {
      if (options.verbose) {
        console.log(`File already exists in database, skipping`);
      }
      return { 
        success: true, 
        message: "File already exists in database" 
      };
    }

    if (options.verbose) {
      console.log(`Processing source file for AST and symbols`);
    }

    // Process source file to extract AST and symbols
    const { ast, symbols } = processSourceFile(parsedFile, options);
    
    if (options.verbose) {
      console.log(`Extracted ${ast.length} AST nodes and ${symbols.length} symbols`);
    }

    // Apply symbol mapping if provided
    let finalSymbols = symbols;
    if (Object.keys(symbolMap).length > 0) {
      if (options.verbose) {
        console.log(`Applying symbol mapping for ${Object.keys(symbolMap).length} symbols`);
      }
      finalSymbols = updateExistingSymbols(symbols, symbolMap);
    }

    // Store the file with all components
    storeSourceFile(fileHash, parsedFile.content, ast, finalSymbols, config, options);
    
    if (options.verbose) {
      console.log(`Successfully stored file in database`);
    }
    
    return { 
      success: true, 
      symbolsCount: finalSymbols.length 
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (options.verbose) {
      console.error(`Error processing file: ${errorMessage}`);
    }
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

export default addSourceFile; 