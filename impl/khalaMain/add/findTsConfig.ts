import { join, dirname, resolve } from "node:path";
import { existsSync } from "node:fs";

const findTsConfig = (filePath: string): string => {
  let currentDir = dirname(resolve(filePath));
  const rootDir = resolve("/");
  
  // Walk up the directory tree looking for tsconfig.json
  while (currentDir !== rootDir) {
    const tsConfigPath = join(currentDir, "tsconfig.json");
    if (existsSync(tsConfigPath)) {
      return tsConfigPath;
    }
    currentDir = dirname(currentDir);
  }
  
  // Return default config if none found
  return join(process.cwd(), "tsconfig.json");
};

export default findTsConfig; 