import type { AddOptions } from "@d/add/types";
import ensureKhalaDatabase from "@i/ensureKhalaDatabase";
import getKhalaRoot from "@i/khalaMain/getKhalaRoot";
import removeSourceFile from "@i/removeSourceFile";
import { removeEmptyDirectories } from "@i/directoryUtils";

/**
 * Remove a file from the Khala database by hash
 */
const removeFileByHash = (
  fileHash: string,
  options: AddOptions = {}
): { success: boolean; error?: string } => {
  try {
    if (options.verbose) {
      console.log(`Removing file with hash: ${fileHash}`);
    }
    
    // Ensure Khala database exists
    const khalaRoot = getKhalaRoot();
    const dbResult = ensureKhalaDatabase(khalaRoot);
    
    if (!dbResult.success) {
      return { 
        success: false, 
        error: `Failed to initialize Khala database: ${dbResult.error}` 
      };
    }
    
    // Remove the file and all related data
    removeSourceFile(fileHash, {
      filesPath: dbResult.filesPath!,
      sqlitePath: dbResult.sqlitePath!
    }, options);
    
    // Clean up empty directories
    if (options.verbose) {
      console.log(`Cleaning up empty directories`);
    }
    removeEmptyDirectories(dbResult.filesPath!, options);
    
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (options.verbose) {
      console.error(`Error removing file: ${errorMessage}`);
    }
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

export default removeFileByHash; 