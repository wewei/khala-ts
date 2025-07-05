import { existsSync, mkdirSync, rmdirSync, readdirSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Ensure a directory exists, creating it if necessary
 */
const ensureDirectory = (dirPath: string, options: { verbose?: boolean } = {}): void => {
  if (!existsSync(dirPath)) {
    if (options.verbose) {
      console.log(`Creating directory: ${dirPath}`);
    }
    mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Remove a file and clean up empty parent directories
 */
const removeFileAndCleanup = (
  filePath: string, 
  options: { verbose?: boolean } = {}
): void => {
  if (!existsSync(filePath)) {
    if (options.verbose) {
      console.log(`File does not exist: ${filePath}`);
    }
    return;
  }

  // Remove the file
  if (options.verbose) {
    console.log(`Removing file: ${filePath}`);
  }
  unlinkSync(filePath);

  // Clean up empty parent directories
  let currentDir = dirname(filePath);
  const baseDir = dirname(dirname(filePath)); // Go up two levels to avoid removing the main storage dir

  while (currentDir !== baseDir && currentDir !== dirname(currentDir)) {
    if (existsSync(currentDir)) {
      const files = readdirSync(currentDir);
      if (files.length === 0) {
        if (options.verbose) {
          console.log(`Removing empty directory: ${currentDir}`);
        }
        rmdirSync(currentDir);
        currentDir = dirname(currentDir);
      } else {
        // Directory is not empty, stop cleanup
        break;
      }
    } else {
      // Directory doesn't exist, stop cleanup
      break;
    }
  }
};

/**
 * Check if a directory is empty
 */
const isDirectoryEmpty = (dirPath: string): boolean => {
  if (!existsSync(dirPath)) {
    return true;
  }
  
  const files = readdirSync(dirPath);
  return files.length === 0;
};

/**
 * Remove empty directories recursively
 */
const removeEmptyDirectories = (
  basePath: string,
  options: { verbose?: boolean } = {}
): void => {
  if (!existsSync(basePath)) {
    return;
  }

  const files = readdirSync(basePath);
  
  for (const file of files) {
    const filePath = `${basePath}/${file}`;
    const stats = require('node:fs').statSync(filePath);
    
    if (stats.isDirectory()) {
      // Recursively check subdirectories
      removeEmptyDirectories(filePath, options);
      
      // Check if this directory is now empty
      if (isDirectoryEmpty(filePath)) {
        if (options.verbose) {
          console.log(`Removing empty directory: ${filePath}`);
        }
        rmdirSync(filePath);
      }
    }
  }
};

export {
  ensureDirectory,
  removeFileAndCleanup,
  isDirectoryEmpty,
  removeEmptyDirectories
}; 