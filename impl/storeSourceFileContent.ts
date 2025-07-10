import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { SourceFileMetadata } from "@d/add/types";
import { getSourceFilePath } from "@i/ensureKhalaDatabase/filePathUtils";
import { ensureDirectory } from "@i/directoryUtils";
import generateFileDescription from "@i/generateFileDescription";
import insertSourceFileMetadata from "@i/insertSourceFileMetadata";

/**
 * Store source file content
 */
const storeSourceFileContent = (
  fileHash: string, 
  content: string, 
  filesPath: string,
  sqlitePath: string,
  options: { verbose?: boolean } = {}
): void => {
  const filePath = getSourceFilePath(filesPath, fileHash);
  const dir = dirname(filePath);
  
  if (options.verbose) {
    console.log(`Writing source file to: ${filePath}`);
  }
  
  // Ensure directory exists
  ensureDirectory(dir, options);
  
  // Write file content
  writeFileSync(filePath, content, 'utf-8');
  
  if (options.verbose) {
    console.log(`Wrote ${content.length} bytes to source file`);
  }
  
  // Store metadata in SQLite
  const metadata: SourceFileMetadata = {
    key: fileHash,
    description: generateFileDescription(content),
    size: content.length,
    createdAt: new Date().toISOString(),
  };
  
  if (options.verbose) {
    console.log(`Storing metadata: ${metadata.description} (${metadata.size} bytes)`);
  }
  
  insertSourceFileMetadata(metadata, sqlitePath);
};

export default storeSourceFileContent; 