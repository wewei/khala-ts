import { Command } from "commander";
import getKhalaRoot from "./getKhalaRoot";

const rootCommand = (program: Command): void => {
  program
    .command("root")
    .description("Show the Khala root directory path")
    .action(() => {
      const rootPath = getKhalaRoot();
      console.log(rootPath);
    });
};

export default rootCommand; 