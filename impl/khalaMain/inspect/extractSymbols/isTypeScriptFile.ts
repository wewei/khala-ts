import { extname } from "node:path";

/**
 * Check if a file is a TypeScript file
 */
const isTypeScriptFile = (filePath: string): boolean => {
  const ext = extname(filePath).toLowerCase();
  return ext === ".ts" || ext === ".tsx";
};

export default isTypeScriptFile; 