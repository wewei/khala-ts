import type { System } from "typescript";

/**
 * 在虚拟文件系统中递归发现所有 TypeScript 文件
 */
export function discoverFilesInVfs(vfs: System, baseDir: string): string[] {
  const files: string[] = [];
  
  const scanDirectory = (dir: string): void => {
    try {
      const entries = vfs.readDirectory(dir, [".ts", ".tsx"], undefined, undefined, 1);
      console.log(`Scanning directory ${dir}, found entries:`, entries);
      for (const entry of entries) {
        console.log(`Checking entry: ${entry}, exists: ${vfs.fileExists(entry)}`);
        if (vfs.fileExists(entry)) {
          if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
            files.push(entry);
            console.log(`Added file: ${entry}`);
          }
        } else {
          // It's a directory, scan it recursively
          scanDirectory(entry);
        }
      }
    } catch (error) {
      console.log(`Error scanning directory ${dir}:`, error);
      // Directory doesn't exist or can't be read, skip it
    }
  };
  
  scanDirectory(baseDir);
  console.log(`Total files discovered:`, files);
  return files;
} 