import { existsSync, statSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import isTypeScriptFile from "./isTypeScriptFile";

/**
 * Find all TypeScript files in a directory recursively
 */
const findTypeScriptFiles = (dirPath: string): string[] => {
  const files: string[] = [];
  
  const traverse = (currentPath: string): void => {
    try {
      const entries = readdirSync(currentPath);
      
      for (const entry of entries) {
        const fullPath = resolve(currentPath, entry);
        const stats = statSync(fullPath);
        
        if (stats.isDirectory()) {
          // Skip node_modules and .git directories
          if (entry !== "node_modules" && entry !== ".git") {
            traverse(fullPath);
          }
        } else if (stats.isFile() && isTypeScriptFile(fullPath)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  };
  
  traverse(dirPath);
  return files;
};

export default findTypeScriptFiles; 