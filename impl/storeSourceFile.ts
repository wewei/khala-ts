import type { ASTNode, Symbol } from "@d/add/types";
import storeSourceFileContent from "@i/storeSourceFileContent";
import storeASTNodes from "@i/storeASTNodes";
import storeSymbolDefinitions from "@i/storeSymbolDefinitions";
import extractSymbolReferences from "@i/extractSymbolReferences";
import storeSymbolReferences from "@i/storeSymbolReferences";
import indexSymbols from "@i/indexSymbols";

/**
 * Store source file with all components
 */
const storeSourceFile = (
  fileHash: string, 
  content: string,
  ast: ASTNode[], 
  symbols: Symbol[],
  config: {
    filesPath: string;
    sqlitePath: string;
  },
  options: { verbose?: boolean } = {}
): void => {
  if (options.verbose) {
    console.log(`Storing source file with hash: ${fileHash}`);
  }
  
  // Store source file content
  if (options.verbose) {
    console.log(`Storing source file content`);
  }
  storeSourceFileContent(fileHash, content, config.filesPath, config.sqlitePath, options);
  
  // Store AST nodes
  if (options.verbose) {
    console.log(`Storing ${ast.length} AST nodes`);
  }
  storeASTNodes(fileHash, ast, config.filesPath, options);
  
  // Store symbol definitions
  if (options.verbose) {
    console.log(`Storing ${symbols.length} symbol definitions`);
  }
  storeSymbolDefinitions(symbols, config.sqlitePath, options);
  
  // Extract and store symbol references
  const references = extractSymbolReferences(ast, symbols);
  storeSymbolReferences(references, config.sqlitePath, options);
  
  // Update semantic index
  indexSymbols(symbols, options);
  
  if (options.verbose) {
    console.log(`Successfully stored file in database`);
  }
};

export default storeSourceFile; 