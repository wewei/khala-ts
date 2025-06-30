import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import * as ts from "typescript";

// Note: We'll use Bun's built-in TypeScript support
// For now, this is a placeholder that will be implemented with actual TypeScript parsing
type SymbolInfo = {
  qualifiedName: string;
  kind: string;
  description: string;
  ast: any; // TypeScript AST node
  dependencies: string[];
};

const extractSymbolsFromNode = (node: ts.Node, sourceFile: ts.SourceFile): SymbolInfo[] => {
  const symbols: SymbolInfo[] = [];
  
  // Only process top-level nodes
  if (node.parent && node.parent.kind !== ts.SyntaxKind.SourceFile) {
    return symbols;
  }
  
  switch (node.kind) {
    case ts.SyntaxKind.FunctionDeclaration: {
      const funcDecl = node as ts.FunctionDeclaration;
      if (funcDecl.name) {
        symbols.push({
          qualifiedName: funcDecl.name.text,
          kind: "FunctionDeclaration",
          description: `Function ${funcDecl.name.text}`,
          ast: funcDecl,
          dependencies: extractDependencies(funcDecl, sourceFile),
        });
      }
      break;
    }
    
    case ts.SyntaxKind.VariableStatement: {
      const varStmt = node as ts.VariableStatement;
      varStmt.declarationList.declarations.forEach(decl => {
        if (ts.isIdentifier(decl.name)) {
          symbols.push({
            qualifiedName: decl.name.text,
            kind: "VariableDeclaration",
            description: `Variable ${decl.name.text}`,
            ast: decl,
            dependencies: extractDependencies(decl, sourceFile),
          });
        }
      });
      break;
    }
    
    case ts.SyntaxKind.TypeAliasDeclaration: {
      const typeDecl = node as ts.TypeAliasDeclaration;
      symbols.push({
        qualifiedName: typeDecl.name.text,
        kind: "TypeAliasDeclaration",
        description: `Type ${typeDecl.name.text}`,
        ast: typeDecl,
        dependencies: extractDependencies(typeDecl, sourceFile),
      });
      break;
    }
    
    case ts.SyntaxKind.InterfaceDeclaration: {
      const interfaceDecl = node as ts.InterfaceDeclaration;
      symbols.push({
        qualifiedName: interfaceDecl.name.text,
        kind: "InterfaceDeclaration",
        description: `Interface ${interfaceDecl.name.text}`,
        ast: interfaceDecl,
        dependencies: extractDependencies(interfaceDecl, sourceFile),
      });
      break;
    }
    
    case ts.SyntaxKind.ClassDeclaration: {
      const classDecl = node as ts.ClassDeclaration;
      if (classDecl.name) {
        symbols.push({
          qualifiedName: classDecl.name.text,
          kind: "ClassDeclaration",
          description: `Class ${classDecl.name.text}`,
          ast: classDecl,
          dependencies: extractDependencies(classDecl, sourceFile),
        });
      }
      break;
    }
    
    case ts.SyntaxKind.EnumDeclaration: {
      const enumDecl = node as ts.EnumDeclaration;
      symbols.push({
        qualifiedName: enumDecl.name.text,
        kind: "EnumDeclaration",
        description: `Enum ${enumDecl.name.text}`,
        ast: enumDecl,
        dependencies: extractDependencies(enumDecl, sourceFile),
      });
      break;
    }
    
    case ts.SyntaxKind.ModuleDeclaration: {
      const moduleDecl = node as ts.ModuleDeclaration;
      if (ts.isIdentifier(moduleDecl.name)) {
        symbols.push({
          qualifiedName: moduleDecl.name.text,
          kind: "ModuleDeclaration",
          description: `Module ${moduleDecl.name.text}`,
          ast: moduleDecl,
          dependencies: extractDependencies(moduleDecl, sourceFile),
        });
      }
      break;
    }
  }
  
  return symbols;
};

const extractDependencies = (node: ts.Node, sourceFile: ts.SourceFile): string[] => {
  const dependencies: string[] = [];
  
  const visitNode = (n: ts.Node) => {
    // Look for import statements
    if (ts.isImportDeclaration(n)) {
      const importClause = n.importClause;
      if (importClause && importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
        importClause.namedBindings.elements.forEach(element => {
          dependencies.push(element.name.text);
        });
      }
    }
    
    // Look for type references
    if (ts.isTypeReferenceNode(n) && ts.isIdentifier(n.typeName)) {
      dependencies.push(n.typeName.text);
    }
    
    // Look for qualified names (e.g., Utils.functionName)
    if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression)) {
      dependencies.push(`${n.expression.text}.${n.name.text}`);
    }
    
    n.forEachChild(visitNode);
  };
  
  visitNode(node);
  return dependencies;
};

const parseTypeScriptFile = (filePath: string, tsConfigPath: string): SymbolInfo[] => {
  const resolvedPath = resolve(filePath);
  const resolvedTsConfigPath = resolve(tsConfigPath);
  
  // Check if tsconfig.json exists and parse it
  let compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    skipLibCheck: true,
  };
  
  if (existsSync(resolvedTsConfigPath)) {
    try {
      const tsConfigContent = readFileSync(resolvedTsConfigPath, "utf-8");
      const tsConfig = ts.parseConfigFileTextToJson(resolvedTsConfigPath, tsConfigContent);
      
      if (tsConfig.config) {
        const parsedConfig = ts.parseJsonConfigFileContent(
          tsConfig.config,
          ts.sys,
          resolve(tsConfigPath, ".."),
          compilerOptions
        );
        compilerOptions = { ...compilerOptions, ...parsedConfig.options };
      }
    } catch (error) {
      console.warn(`Warning: Could not parse tsconfig.json at ${resolvedTsConfigPath}, using defaults`);
    }
  }
  
  // Create a program with the source file and parsed compiler options
  const program = ts.createProgram([resolvedPath], compilerOptions);
  
  const sourceFile = program.getSourceFile(resolvedPath);
  if (!sourceFile) {
    throw new Error(`Could not parse source file: ${resolvedPath}`);
  }
  
  const symbols: SymbolInfo[] = [];
  
  // Visit all top-level nodes
  sourceFile.forEachChild(node => {
    const nodeSymbols = extractSymbolsFromNode(node, sourceFile);
    symbols.push(...nodeSymbols);
  });
  
  return symbols;
};

export default parseTypeScriptFile; 