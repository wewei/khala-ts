import * as ts from "typescript";

/**
 * Check if a node has export modifier
 */
const hasExportModifier = (node: any): boolean => {
  return node.modifiers?.some((mod: any) => mod.kind === ts.SyntaxKind.ExportKeyword) || false;
};

export default hasExportModifier; 