import { Command } from "commander";
import { existsSync, statSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { AddArguments, AddOptions } from "@d/cli/add";
import ensureKhalaDatabase from "@i/ensureKhalaDatabase";
import getKhalaRoot from "../getKhalaRoot";
import findTsConfig from "@i/findTsConfig";
import parseTypeScriptFile from "@i/parseTypeScriptFile";
import storeSymbols from "./storeSymbols";

/**
 * Register the add command with the CLI program
 */
const addCommand = (program: Command): void => {
  program
    .command("add")
    .description("Add files or projects to the Khala database")
    .argument("<path>", "Path to file or directory to add")
    .option("-r, --recursive", "Recursively add directories")
    .option("-f, --force", "Force add even if already exists")
    .option("-v, --verbose", "Verbose output")
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
        
        // 1. Ensure Khala database exists
        const khalaRoot = getKhalaRoot();
        const dbResult = ensureKhalaDatabase(khalaRoot);
        
        if (!dbResult.success) {
          console.error(`Error: Failed to initialize Khala database: ${dbResult.error}`);
          process.exit(1);
        }
        
        if (options.verbose) {
          console.log(`Database ready: ${dbResult.sqlitePath}`);
        }
        
        // 2. Find tsconfig.json
        const tsConfigPath = findTsConfig(resolvedPath);
        
        if (options.verbose) {
          console.log(`Using tsconfig: ${tsConfigPath}`);
        }
        
        // 3. Process the file/directory
        const stats = statSync(resolvedPath);
        
        if (stats.isFile()) {
          // Process single file
          if (resolvedPath.endsWith(".ts") || resolvedPath.endsWith(".tsx")) {
            await processFile(resolvedPath, tsConfigPath, dbResult.sqlitePath!, options);
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
        
        console.log("✅ File processed successfully");
        
      } catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        process.exit(1);
      }
    });
};

const processFile = async (
  filePath: string, 
  tsConfigPath: string, 
  dbPath: string, 
  options: AddOptions
): Promise<void> => {
  if (options.verbose) {
    console.log(`Parsing TypeScript file: ${filePath}`);
  }
  
  // 4. Parse the file using tsconfig
  const symbols = parseTypeScriptFile(filePath, tsConfigPath);
  
  if (options.verbose) {
    console.log(`Found ${symbols.length} symbols`);
  }
  
  // 5. Store symbols in database
  storeSymbols(dbPath, symbols);
  
  if (options.verbose) {
    console.log(`Stored ${symbols.length} symbols in database`);
  }
};

export default addCommand; 