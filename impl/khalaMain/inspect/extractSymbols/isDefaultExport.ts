import * as ts from "typescript";

/**
 * Check if a node is exported as default
 */
const isDefaultExport = (node: any): boolean => {
  return node.modifiers?.some((mod: any) => mod.kind === ts.SyntaxKind.DefaultKeyword) || false;
};

export default isDefaultExport; 