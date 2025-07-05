import { existsSync, mkdirSync, rmdirSync, readdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Ensure directory exists, create if it doesn't
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
 * Remove file and cleanup empty directories recursively
 */
const removeFileAndCleanup = (filePath: string, options: { verbose?: boolean } = {}): void => {
  if (options.verbose) {
    console.log(`Removing file: ${filePath}`);
  }
  
  try {
    // Remove the file
    const { unlinkSync } = require("node:fs");
    unlinkSync(filePath);
    
    // Clean up empty directories recursively
    cleanupEmptyDirectories(dirname(filePath), options);
  } catch (error) {
    if (options.verbose) {
      console.log(`File not found or already removed: ${filePath}`);
    }
  }
};

/**
 * Recursively remove empty directories
 */
const cleanupEmptyDirectories = (dirPath: string, options: { verbose?: boolean } = {}): void => {
  try {
    const entries = readdirSync(dirPath);
    
    // If directory is empty, remove it
    if (entries.length === 0) {
      if (options.verbose) {
        console.log(`Removing empty directory: ${dirPath}`);
      }
      rmdirSync(dirPath);
      
      // Recursively clean up parent directory
      const parentDir = dirname(dirPath);
      if (parentDir !== dirPath) {
        cleanupEmptyDirectories(parentDir, options);
      }
    }
  } catch (error) {
    // Directory might not exist or be inaccessible
    if (options.verbose) {
      console.log(`Could not access directory: ${dirPath}`);
    }
  }
};

/**
 * Remove empty directories from a given path
 */
const removeEmptyDirectories = (basePath: string, options: { verbose?: boolean } = {}): void => {
  if (options.verbose) {
    console.log(`Cleaning up empty directories in: ${basePath}`);
  }
  
  try {
    const entries = readdirSync(basePath);
    
    for (const entry of entries) {
      const entryPath = `${basePath}/${entry}`;
      const stat = require("node:fs").statSync(entryPath);
      
      if (stat.isDirectory()) {
        cleanupEmptyDirectories(entryPath, options);
      }
    }
  } catch (error) {
    if (options.verbose) {
      console.log(`Could not access base path: ${basePath}`);
    }
  }
};

export {
  ensureDirectory,
  removeFileAndCleanup,
  cleanupEmptyDirectories,
  removeEmptyDirectories,
}; 