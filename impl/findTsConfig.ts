import { existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";

/**
 * Find tsconfig.json in the given path or its ancestor directories
 */
const findTsConfig = (targetPath: string): string => {
  let currentDir = resolve(targetPath);
  
  // If target is a file, start from its directory
  if (!existsSync(currentDir) || !statSync(currentDir).isDirectory()) {
    currentDir = dirname(currentDir);
  }
  
  // Search up the directory tree for tsconfig.json
  while (currentDir !== dirname(currentDir)) {
    const tsConfigPath = resolve(currentDir, "tsconfig.json");
    if (existsSync(tsConfigPath)) {
      return tsConfigPath;
    }
    currentDir = dirname(currentDir);
  }
  
  // If no tsconfig.json found, return a default path
  // This will be handled by the TypeScript compiler with default options
  return resolve(targetPath, "tsconfig.json");
};

export default findTsConfig; 