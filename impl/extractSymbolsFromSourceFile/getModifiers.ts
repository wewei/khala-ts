import * as ts from "typescript";

/**
 * Get modifiers from a node
 */
const getModifiers = (node: any): string[] | undefined => {
  if (!node.modifiers) return undefined;
  
  return node.modifiers.map((mod: any) => {
    switch (mod.kind) {
      case ts.SyntaxKind.ExportKeyword: return "export";
      case ts.SyntaxKind.DefaultKeyword: return "default";
      case ts.SyntaxKind.PublicKeyword: return "public";
      case ts.SyntaxKind.PrivateKeyword: return "private";
      case ts.SyntaxKind.ProtectedKeyword: return "protected";
      case ts.SyntaxKind.StaticKeyword: return "static";
      case ts.SyntaxKind.AbstractKeyword: return "abstract";
      case ts.SyntaxKind.AsyncKeyword: return "async";
      case ts.SyntaxKind.ConstKeyword: return "const";
      case ts.SyntaxKind.LetKeyword: return "let";
      case ts.SyntaxKind.VarKeyword: return "var";
      default: return "unknown";
    }
  });
};

export default getModifiers; 