import { Command } from "commander";
import type { AddArguments, AddOptions } from "@d/cli/add";

/**
 * Register the add command with the CLI program (MVP)
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
      // TODO: Implement basic add functionality
      console.log(`Adding: ${path}`);
      console.log("Options:", options);
      
      // MVP: Just validate the path exists
      // TODO: Add file processing in next iteration
    });
};

export default addCommand; 