# Khala Add Command Implementation

## Overview

The `khala add` command is responsible for adding TypeScript source files to the Khala database. It implements the three-layer architecture by processing source files, extracting AST nodes, and storing symbols with their references.

## Command Interface

```bash
khala add <path> [options]
```

### Arguments
- `<path>` - Path to TypeScript file or directory to add

### Options
- `-r, --recursive` - Recursively process directories
- `-f, --force` - Force add even if file already exists
- `-v, --verbose` - Verbose output
- `--symbol-map <file>` - Path to symbol mapping file for updating existing symbols

## Core Algorithm

### Main Function
```typescript
function addSourceFile(
  sourceFilePath: string, 
  symbolMap: Record<string, string> = {} // Optional symbol map from symbol name to UUID
) {
  const compilerOptions = loadCompilerOptionsForFile(sourceFilePath);
  const sourceFile = parseTypeScriptProgram({ 
    filePath: sourceFilePath, 
    compilerOptions 
  });

  // Reject if the file doesn't parse
  if (!sourceFile.success) {
    return { success: false, error: sourceFile.error };
  }

  const fileName = getFileHash(sourceFile);
  
  if (fileExistsInKhala(fileName)) {
    return { success: true, message: "File already exists in database" };
  }

  const { ast, symbols } = processSourceFile(sourceFile);
  storeSourceFile(fileName, ast, symbols);
  
  return { success: true, symbolsCount: symbols.length };
}
```

## Implementation Components

### 1. File Processing Pipeline

#### 1.1 Load Compiler Options
```typescript
const loadCompilerOptionsForFile = (filePath: string): CompilerOptions => {
  // Find tsconfig.json in parent directories
  const tsConfigPath = findTsConfig(filePath);
  
  // Load and parse tsconfig.json
  const config = loadTsConfig(tsConfigPath);
  
  // Merge with default options
  return mergeCompilerOptions(config, defaultOptions);
};
```

#### 1.2 Parse TypeScript Program
```typescript
const parseTypeScriptProgram = (params: {
  filePath: string;
  compilerOptions: CompilerOptions;
}): ParseResult => {
  // Use existing parseTypeScriptProgram implementation
  // This should return success/error with parsed source files
};
```

#### 1.3 Generate File Hash
```typescript
const getFileHash = (sourceFile: ParsedSourceFile): string => {
  // Generate RIPEMD-160 hash from file content
  // This will be used as the source file key
  const content = sourceFile.content;
  const timestamp = Date.now().toString();
  const random = Math.random().toString();
  
  return generateRipemd160Hash(content + timestamp + random);
};
```

#### 1.4 Check File Existence
```typescript
const fileExistsInKhala = (fileHash: string): boolean => {
  // Check if source file exists in database
  const sourceFilePath = getSourceFilePath(khalaConfig.sourceFilesPath, fileHash);
  return existsSync(sourceFilePath);
};
```

### 2. Source File Processing

#### 2.1 Process Source File
```typescript
const processSourceFile = (sourceFile: ParsedSourceFile): {
  ast: ASTNode[];
  symbols: Symbol[];
} => {
  // Extract AST nodes from source file
  const astNodes = extractASTNodes(sourceFile);
  
  // Extract symbols from AST nodes
  const symbols = extractSymbolsFromAST(astNodes, sourceFile.filePath);
  
  // Generate symbol keys (40-digit hex)
  const symbolsWithKeys = symbols.map(symbol => ({
    ...symbol,
    key: generateSymbolKey(symbol.name, symbol.kind)
  }));
  
  return { ast: astNodes, symbols: symbolsWithKeys };
};
```

#### 2.2 Extract AST Nodes
```typescript
const extractASTNodes = (sourceFile: ParsedSourceFile): ASTNode[] => {
  // Use existing extractSymbolsFromSourceFile implementation
  // Convert to AST node format with position information
  const symbols = extractSymbolsFromSourceFile(sourceFile, sourceFile.filePath);
  
  return symbols.map(symbol => ({
    sourceFileKey: sourceFile.hash,
    startPos: symbol.startPos,
    endPos: symbol.endPos,
    kind: symbol.kind,
    attributes: {
      name: symbol.name,
      isExported: symbol.isExported,
      isDefault: symbol.isDefault,
      modifiers: symbol.modifiers,
      // ... other attributes
    }
  }));
};
```

#### 2.3 Extract Symbols
```typescript
const extractSymbolsFromAST = (
  astNodes: ASTNode[], 
  sourceFilePath: string
): Symbol[] => {
  return astNodes
    .filter(node => isSymbolDefinition(node))
    .map(node => ({
      key: generateSymbolKey(node.attributes.name, node.kind),
      sourceFileKey: node.sourceFileKey,
      startPos: node.startPos,
      endPos: node.endPos,
      name: node.attributes.name,
      kind: mapNodeKindToSymbolKind(node.kind),
      description: generateSymbolDescription(node),
      dependencies: extractDependencies(node, astNodes)
    }));
};
```

### 3. Storage Operations

#### 3.1 Store Source File
```typescript
const storeSourceFile = (
  fileHash: string, 
  ast: ASTNode[], 
  symbols: Symbol[]
): void => {
  // Store source file content
  storeSourceFileContent(fileHash, sourceFile.content);
  
  // Store AST nodes
  storeASTNodes(fileHash, ast);
  
  // Store symbol definitions
  storeSymbolDefinitions(symbols);
  
  // Store symbol references
  const references = extractSymbolReferences(ast, symbols);
  storeSymbolReferences(references);
  
  // Update semantic index
  indexSymbols(symbols);
};
```

#### 3.2 Store Source File Content
```typescript
const storeSourceFileContent = (fileHash: string, content: string): void => {
  const filePath = getSourceFilePath(khalaConfig.sourceFilesPath, fileHash);
  const dir = dirname(filePath);
  
  // Ensure directory exists
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  
  // Write file content
  writeFileSync(filePath, content, 'utf-8');
  
  // Store metadata in SQLite
  const metadata = {
    key: fileHash,
    description: generateFileDescription(content),
    size: content.length,
    createdAt: new Date().toISOString()
  };
  
  insertSourceFileMetadata(metadata);
};
```

#### 3.3 Store AST Nodes
```typescript
const storeASTNodes = (fileHash: string, astNodes: ASTNode[]): void => {
  const astFilePath = getASTFilePath(khalaConfig.astFilesPath, fileHash);
  const dir = dirname(astFilePath);
  
  // Ensure directory exists
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  
  // Store AST as JSON
  const astFile = {
    version: 1,
    nodes: astNodes.map(node => ({
      startPos: node.startPos,
      endPos: node.endPos,
      kind: node.kind,
      attributes: node.attributes
    }))
  };
  
  writeFileSync(astFilePath, JSON.stringify(astFile, null, 2), 'utf-8');
};
```

#### 3.4 Store Symbol Definitions
```typescript
const storeSymbolDefinitions = (symbols: Symbol[]): void => {
  const db = new Database(khalaConfig.sqlitePath);
  
  for (const symbol of symbols) {
    db.run(`
      INSERT INTO symbol_definitions (
        key, source_file_key, start_pos, end_pos, 
        name, kind, description, dependencies, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      symbol.key,
      symbol.sourceFileKey,
      symbol.startPos,
      symbol.endPos,
      symbol.name,
      symbol.kind,
      symbol.description,
      JSON.stringify(symbol.dependencies),
      new Date().toISOString()
    ]);
  }
  
  db.close();
};
```

### 4. Symbol Key Generation

#### 4.1 Generate Symbol Key
```typescript
const generateSymbolKey = (name: string, kind: string): string => {
  // Generate 40-digit hexadecimal string
  // Based on timestamp + random function as per design
  const timestamp = Date.now().toString();
  const random = Math.random().toString();
  const input = `${name}:${kind}:${timestamp}:${random}`;
  
  return generateRipemd160Hash(input);
};
```

### 5. Symbol Map Integration

#### 5.1 Load Symbol Map
```typescript
const loadSymbolMap = (mapFilePath?: string): Record<string, string> => {
  if (!mapFilePath) return {};
  
  if (!existsSync(mapFilePath)) {
    throw new Error(`Symbol map file not found: ${mapFilePath}`);
  }
  
  const content = readFileSync(mapFilePath, 'utf-8');
  return JSON.parse(content);
};
```

#### 5.2 Update Existing Symbols
```typescript
const updateExistingSymbols = (
  symbols: Symbol[], 
  symbolMap: Record<string, string>
): Symbol[] => {
  return symbols.map(symbol => {
    const existingKey = symbolMap[symbol.name];
    if (existingKey) {
      return { ...symbol, key: existingKey };
    }
    return symbol;
  });
};
```

## Error Handling

### 1. File Validation
- Check if file exists
- Validate file extension (.ts, .tsx)
- Check file permissions

### 2. Parsing Errors
- Handle TypeScript compilation errors
- Provide meaningful error messages
- Continue processing other files in batch mode

### 3. Storage Errors
- Handle file system errors
- Handle database errors
- Implement rollback mechanism

## Performance Considerations

### 1. Batch Processing
- Process multiple files in parallel
- Use worker threads for heavy computation
- Implement progress reporting

### 2. Memory Management
- Stream large files
- Clean up AST objects after processing
- Use database transactions for bulk operations

### 3. Caching
- Cache compiler options
- Cache parsed AST for repeated operations
- Implement incremental updates

## Testing Strategy

### 1. Unit Tests
- Test each component function
- Mock file system and database operations
- Test error conditions

### 2. Integration Tests
- Test complete add workflow
- Test with real TypeScript files
- Test database consistency

### 3. Performance Tests
- Test with large files
- Test batch processing
- Measure memory usage

## Migration from Current Implementation

### 1. Backward Compatibility
- Maintain existing CLI interface
- Support existing database format during transition
- Provide migration tools

### 2. Data Migration
- Migrate existing symbols to new format
- Update file paths to hash-based structure
- Rebuild semantic index

## Future Enhancements

### 1. Incremental Updates
- Detect file changes
- Update only modified symbols
- Preserve references

### 2. Dependency Resolution
- Resolve cross-file dependencies
- Handle circular dependencies
- Update dependent symbols

### 3. Advanced Symbol Mapping
- Fuzzy matching for symbol names
- Automatic symbol merging
- Conflict resolution strategies 