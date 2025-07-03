import { Command } from "commander";
import addCommand from "./add";
import inspectCommand from "./inspect";

/**
 * Main entry point for the Khala CLI.
 * Sets up the CLI framework and routes to subcommands.
 */
const khalaMain = (): void => {
  const program = new Command();

  program
    .name("khala")
    .description("Khala: Shared TypeScript code database CLI")
    .version("0.1.0");

  // Import and register subcommands
  addCommand(program);
  inspectCommand(program);
  
  // TODO: Import and register other subcommands when implemented
  // import searchCommand from "./search";
  // import bundleCommand from "./bundle";
  // import updateCommand from "./update";
  // import connectCommand from "./connect";
  // import deleteCommand from "./delete";

  // TODO: Register other subcommands
  // searchCommand(program);
  // bundleCommand(program);
  // updateCommand(program);
  // connectCommand(program);
  // deleteCommand(program);

  program.parse(process.argv);
};

export default khalaMain;
