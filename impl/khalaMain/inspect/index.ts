import { Command } from "commander";
import { existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import type { InspectOptions } from "@d/cli/inspect";
import findTsConfig from "./findTsConfig";
import extractSymbols from "./extractSymbols";
import formatOutput from "./formatOutput";

/**
 * Register the inspect command with the CLI program
 */
const inspectCommand = (program: Command): void => {
  program
    .command("inspect")
    .description("Inspect code, dependencies, or metadata")
    .argument("<target>", "Target to inspect (file or directory)")
    .option("-d, --detailed", "Show detailed information")
    .option("-f, --format <format>", "Output format (table, json, tree)", "table")
    .option("--dependencies", "Show dependency information")
    .option("--metadata", "Show metadata information")
    .option("-v, --verbose", "Verbose output")
    .action(async (target: string, options: InspectOptions) => {
      try {
        const resolvedTarget = resolve(target);
        
        // Validate target exists
        if (!existsSync(resolvedTarget)) {
          console.error(`Error: Target does not exist: ${resolvedTarget}`);
          process.exit(1);
        }
        
        if (options.verbose) {
          console.log(`Inspecting: ${resolvedTarget}`);
        }
        
        // Find tsconfig.json in the target directory or its ancestors
        const tsConfigPath = findTsConfig(resolvedTarget);
        
        if (options.verbose) {
          console.log(`Using tsconfig: ${tsConfigPath}`);
        }
        
        // Extract symbols from the target
        const symbols = await extractSymbols(resolvedTarget, tsConfigPath, options);
        
        // Format and display the output
        formatOutput(symbols, options);
        
      } catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        process.exit(1);
      }
    });
};

export default inspectCommand; 