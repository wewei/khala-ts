import { Command } from "commander";

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
  // TODO: Import subcommand modules when implemented
  // import addCommand from "./add";
  // import searchCommand from "./search";
  // import inspectCommand from "./inspect";
  // import bundleCommand from "./bundle";
  // import updateCommand from "./update";
  // import connectCommand from "./connect";
  // import deleteCommand from "./delete";

  // TODO: Register subcommands
  // addCommand(program);
  // searchCommand(program);
  // inspectCommand(program);
  // bundleCommand(program);
  // updateCommand(program);
  // connectCommand(program);
  // deleteCommand(program);

  program.parse();
};

export default khalaMain;
