import { Command } from "commander";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import type { AddOptions } from "@d/add/types";
import ensureKhalaDatabase from "@i/ensureKhalaDatabase";
import getKhalaRoot from "../getKhalaRoot";
import addSourceFile from "@i/addSourceFile";
import { loadSymbolMap } from "@i/symbolMapUtils";

/**
 * TODO: Implement new add command based on design document
 * 
 * The new implementation should:
 * 1. Follow the three-layer architecture (SourceFile → AST Node → Symbol)
 * 2. Use hash-based file storage with RIPEMD-160
 * 3. Support verbose logging with --verbose option
 * 4. Handle symbol mapping for updating existing symbols
 * 5. Implement proper error handling and rollback
 * 
 * See docs/khala-add-command.md for complete implementation plan
 */
const addCommand = (program: Command): void => {
  program
    .command("add")
    .description("Add files or projects to the Khala database")
    .argument("<path>", "Path to file or directory to add")
    .option("-r, --recursive", "Recursively add directories")
    .option("-f, --force", "Force add even if already exists")
    .option("-v, --verbose", "Verbose output")
    .option("--symbol-map <file>", "Path to symbol mapping file for updating existing symbols")
    .action(async (path: string, options: AddOptions) => {
      try {
        const resolvedPath = resolve(path);
        
        // Validate path exists
        if (!existsSync(resolvedPath)) {
          console.error(`Error: Path does not exist: ${resolvedPath}`);
          process.exit(1);
        }
        
        if (options.verbose) {
          console.log(`Processing: ${resolvedPath}`);
        }
        
        // Ensure Khala database exists
        const khalaRoot = getKhalaRoot();
        const dbResult = ensureKhalaDatabase(khalaRoot);
        
        if (!dbResult.success) {
          console.error(`Error: Failed to initialize Khala database: ${dbResult.error}`);
          process.exit(1);
        }
        
        if (options.verbose) {
          console.log(`Database ready: ${dbResult.sqlitePath}`);
        }
        
        // Load symbol map if provided
        let symbolMap: Record<string, string> = {};
        if (options.symbolMap) {
          try {
            symbolMap = loadSymbolMap(options.symbolMap);
            if (options.verbose) {
              console.log(`Loaded symbol map with ${Object.keys(symbolMap).length} mappings`);
            }
          } catch (error) {
            console.error(`Error: Failed to load symbol map: ${error}`);
            process.exit(1);
          }
        }
        
        // Process the file/directory
        const stats = statSync(resolvedPath);
        
        if (stats.isFile()) {
          // Process single file
          if (resolvedPath.endsWith(".ts") || resolvedPath.endsWith(".tsx")) {
                         const result = addSourceFile(
               resolvedPath,
               {
                 filesPath: dbResult.filesPath!,
                 sqlitePath: dbResult.sqlitePath!
               },
              symbolMap,
              options
            );
            
            if (result.success) {
              if (result.message) {
                console.log(`✅ ${result.message}`);
              } else {
                console.log(`✅ File processed successfully (${result.symbolsCount} symbols)`);
              }
            } else {
              console.error(`❌ Failed to process file: ${result.error}`);
              process.exit(1);
            }
          } else {
            console.log(`Skipping non-TypeScript file: ${resolvedPath}`);
          }
        } else if (stats.isDirectory()) {
          // Process directory
          if (options.recursive) {
            console.log("Recursive directory processing not yet implemented");
            // TODO: Implement recursive directory processing
          } else {
            console.log("Directory processing not yet implemented");
            // TODO: Implement directory processing
          }
        }
        
      } catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        process.exit(1);
      }
    });
};

export default addCommand; 