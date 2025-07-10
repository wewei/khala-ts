import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { ASTNode, ASTFile } from "@d/add/types";
import { getASTFilePath } from "@i/ensureKhalaDatabase/filePathUtils";
import { ensureDirectory } from "@i/directoryUtils";

/**
 * Store AST nodes
 */
const storeASTNodes = (
  fileHash: string, 
  astNodes: ASTNode[], 
  filesPath: string,
  options: { verbose?: boolean } = {}
): void => {
  const astFilePath = getASTFilePath(filesPath, fileHash);
  const dir = dirname(astFilePath);
  
  if (options.verbose) {
    console.log(`Writing AST file to: ${astFilePath}`);
  }
  
  // Ensure directory exists
  ensureDirectory(dir, options);
  
  // Store AST as JSON
  const astFile: ASTFile = {
    version: 1,
    nodes: astNodes.map(node => ({
      startPos: node.startPos,
      endPos: node.endPos,
      kind: node.kind,
      attributes: node.attributes,
    })),
  };
  
  writeFileSync(astFilePath, JSON.stringify(astFile, null, 2), 'utf-8');
  
  if (options.verbose) {
    console.log(`Wrote AST file with ${astNodes.length} nodes`);
  }
};

export default storeASTNodes; 