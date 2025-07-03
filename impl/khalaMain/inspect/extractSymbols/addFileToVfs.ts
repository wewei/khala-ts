import { readFileSync } from "node:fs";

/**
 * Add a file to the virtual file system
 */
const addFileToVfs = (vfs: any, filePath: string, relativePath?: string): void => {
  try {
    const content = readFileSync(filePath, "utf-8");
    if (relativePath) {
      vfs.writeFile(relativePath, content);
    } else {
      vfs.writeFile(filePath, content);
    }
  } catch (error) {
    // Skip files that can't be read
  }
};

export default addFileToVfs; 