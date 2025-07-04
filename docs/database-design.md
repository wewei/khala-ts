# Khala Database Design

## Overview

Khala uses a three-layer immutable database design that provides efficient semantic indexing and AST-based symbol tracking. The design is optimized for read-heavy operations with append-only semantics, supporting source file addition and symbol pruning for maintenance.

## Core Principles

### Immutable Design

- **Append-only operations**: No modification, only addition and pruning
- **Hash-based identification**: Source files identified by RIPEMD-160 hash (40位16进制字符串)
- **Position-based AST nodes**: AST nodes represented as position segments
- **Definition-Reference pattern**: Symbols have one definition and multiple references

### Semantic Indexing

- **Symbol-focused indexing**: Only symbols are indexed for semantic search
- **Efficient pruning**: Remove unused symbols and their dependencies
- **Hash-based deduplication**: Prevent duplicate source files automatically using RIPEMD-160

### AST Segment Tree

- **Position-based nodes**: AST nodes as <hash, start, end> tuples
- **Efficient traversal**: Segment tree for fast node lookup
- **Attribute extraction**: Key attributes stored for quick access

## Three-Layer Architecture

### 1. SourceFile Layer

```typescript
type SourceFile = {
  key: string;                    // RIPEMD-160 hash (40位16进制字符串)
  description?: string;           // Semantic description for human/AI understanding
  content: string;                // Original file content
  size: number;                   // File size in bytes
  createdAt: Date;                // When file was added
};

// Example:
{
  key: "a1b2c3d4e5f6...",
  description: "String utility functions for formatting and manipulation",
  content: "export function formatString(str: string): string { ... }",
  size: 1024,
  createdAt: "2024-01-01T00:00:00Z"
}
```

### 2. AST Node Layer

```typescript
type ASTNode = {
  sourceFileKey: string;          // Reference to source file (RIPEMD-160 hash)
  startPos: number;               // Start position in source file
  endPos: number;                 // End position in source file
  kind: string;                   // Node kind (FunctionDeclaration, etc.)
  attributes: Record<string, any>; // Extracted attributes for quick access
};

type ASTNodeKey = {
  sourceFileKey: string;          // RIPEMD-160 hash
  startPos: number;
  endPos: number;
};

// Example:
{
  sourceFileKey: "a1b2c3d4e5f6...",
  startPos: 0,
  endPos: 150,
  kind: "FunctionDeclaration",
  attributes: {
    name: "formatString",
    isExported: true,
    isDefault: false,
    parameterCount: 1,
    returnType: "string"
  }
}
```

### 3. Symbol Layer

```typescript
type SymbolKind = 
  | "function"
  | "class" 
  | "interface"
  | "type"
  | "enum"
  | "variable"
  | "namespace"
  | "module";

type Symbol = {
  key: string;                    // 40位16进制字符串 (时间戳+随机函数生成)
  sourceFileKey: string;          // Source file containing definition (RIPEMD-160 hash)
  startPos: number;               // Start position of defining AST node
  endPos: number;                 // End position of defining AST node
  name: string;                   // Symbol name
  kind: SymbolKind;               // Symbol kind
  description?: string;           // Semantic description for indexing
  dependencies: string[];         // Symbol keys this definition depends on
};

type SymbolRef = {
  sourceFileKey: string;          // Source file containing reference (RIPEMD-160 hash)
  startPos: number;               // Start position of referencing AST node
  endPos: number;                 // End position of referencing AST node
  definitionKey: string;          // Reference to symbol definition key (40位16进制字符串)
  referenceType: "import" | "usage" | "export";
};

// Example Symbol Definition:
{
  key: "12345678-1234-1234-1234-123456789abc",
  sourceFileKey: "a1b2c3d4e5f6...",
  startPos: 0,
  endPos: 150,
  name: "formatString",
  kind: "function",
  description: "Formats a string according to specified pattern",
  dependencies: [
    "87654321-4321-4321-4321-cba987654321" // helper function key
  ]
}

// Note: Symbol properties like visibility, modifiers, etc. are stored in the corresponding AST node
// and can be queried using the symbol's position range:
const getSymbolProperties = async (symbolDef: Symbol) => {
  const astNode = await getASTNode({
    sourceFileKey: symbolDef.sourceFileKey,
    startPos: symbolDef.startPos,
    endPos: symbolDef.endPos
  });
  return astNode.attributes; // Contains: isExported, isDefault, modifiers, etc.
};

// Example Symbol Reference:
{
  sourceFileKey: "b2c3d4e5f6a1...",
  startPos: 10,
  endPos: 25,
  definitionKey: "12345678-1234-1234-1234-123456789abc",
  referenceType: "import"
}
```

## Operations

### High Level Operations (User Operations)

#### Source File Operations
```typescript
// 1. Add a source file (自动生成 AST 和符号索引)
addSourceFile(content: string, description?: string): Promise<SourceFile>

// 2. Get a source file
getSourceFile(key: string): Promise<SourceFile | null>
```

#### AST Node Operations
```typescript
// 1. Get the root node of a source file
getRootNode(sourceFileKey: string): Promise<ASTNode | null>

// 2. Get the children of an AST node
getChildren(parentNode: ASTNode): Promise<ASTNode[]>

// 3. Get the parent of an AST node
getParent(childNode: ASTNode): Promise<ASTNode | null>
```

#### Symbol Operations
```typescript
// 1. Semantic search of symbols
searchSymbols(query: string, limit?: number): Promise<Symbol[]>

// 2. Query symbols in a certain source file
getSymbolsInFile(sourceFileKey: string): Promise<Symbol[]>

// 3. Query symbol references
getSymbolReferences(symbolKey: string): Promise<SymbolRef[]>

// 4. Remove a symbol (blocked if has dependants)
removeSymbol(symbolKey: string): Promise<{ success: boolean, dependants?: Symbol[] }>

// 5. Cascade remove a symbol and all its dependants
cascadeRemoveSymbol(symbolKey: string): Promise<void>

// 6. Get all direct and indirect dependant symbols
getDependantSymbols(symbolKey: string): Promise<Symbol[]>
```

### Low Level Operations (Internal Storage Operations)

基于 High Level 操作的需求分析，需要以下底层操作：

#### File System Operations
```typescript
// 源文件存储
storeSourceFile(content: string, key: string): Promise<void>
getSourceFileContent(key: string): Promise<string | null>
removeSourceFile(key: string): Promise<void>

// AST 存储
storeAST(key: string, nodes: ASTNode[]): Promise<void>
getAST(key: string): Promise<ASTNode[] | null>
removeAST(key: string): Promise<void>
```

#### Database Operations
```typescript
// 符号存储
storeSymbols(symbols: Symbol[]): Promise<void>
getSymbol(key: string): Promise<Symbol | null>
getSymbolsByFile(sourceFileKey: string): Promise<Symbol[]>
removeSymbol(key: string): Promise<void>

// 符号引用存储
storeSymbolRefs(refs: SymbolRef[]): Promise<void>
getSymbolRefs(symbolKey: string): Promise<SymbolRef[]>
removeSymbolRefs(symbolKey: string): Promise<void>
```

#### Semantic Index Operations
```typescript
// 语义索引
indexSymbol(symbol: Symbol): Promise<void>
searchSymbols(query: string, limit?: number): Promise<Symbol[]>
removeSymbolFromIndex(symbolKey: string): Promise<void>
```

## Semantic Indexing

```typescript
type SemanticIndex = {
  symbolKey: string;              // Reference to symbol definition key
  embeddings: number[];           // Vector representation
  keywords: string[];             // Extracted keywords
  description: string;            // Human-readable description
  lastIndexed: Date;
};

// 语义索引接口
indexSymbol(symbol: Symbol): Promise<void>
searchSymbols(query: string, limit?: number): Promise<Symbol[]>
removeSymbol(symbolKey: string): Promise<void>
```

## Hybrid Storage Implementation

Khala uses a hybrid storage approach that optimizes for different data types:

- **File System**: Source files and AST data (large, immutable content)
- **SQLite**: Symbol definitions and references (structured, relational data)
- **LanceDB**: Semantic indexing (vector embeddings for similarity search)

### File System Storage

#### Source File Storage

Source files are stored in the file system using a hash-based directory structure:

```typescript
type FileSystemStorage = {
  basePath: string;               // Base directory for all storage
  sourceFilesPath: string;        // Path to source files directory
  astFilesPath: string;           // Path to AST files directory
};

// File path structure: {basePath}/source/{first2chars}/{rest}.ts
// Example: /data/khala/source/a1/b2c3d4e5f6.ts (RIPEMD-160 hash: a1b2c3d4e5f6...)
// 使用 RIPEMD-160 hash 的前2位字符作为目录名

const getSourceFilePath = (hash: string): string => {
  const first2Chars = hash.substring(0, 2);  // RIPEMD-160 hash 前2位
  const rest = hash.substring(2);            // 剩余38位
  return path.join(basePath, 'source', first2Chars, `${rest}.ts`);
};

const getASTFilePath = (hash: string): string => {
  const first2Chars = hash.substring(0, 2);  // RIPEMD-160 hash 前2位
  const rest = hash.substring(2);            // 剩余38位
  return path.join(basePath, 'ast', first2Chars, `${rest}.ast.json`);
};
```

#### Source File Operations

```typescript
// 文件系统存储接口
type SourceFileStore = {
  add: (content: string, description?: string) => Promise<SourceFile>;
  get: (key: string) => Promise<SourceFile | null>;
  exists: (key: string) => Promise<boolean>;
  remove: (key: string) => Promise<void>;
};

// 文件路径生成
type FilePathGenerator = {
  getSourceFilePath: (hash: string) => string;
  getASTFilePath: (hash: string) => string;
};

// 示例路径结构
// 源文件: /data/khala/source/a1/b2c3d4e5f6.ts (RIPEMD-160 hash: a1b2c3d4e5f6...)
// AST文件: /data/khala/ast/a1/b2c3d4e5f6.ast.json (RIPEMD-160 hash: a1b2c3d4e5f6...)
```

#### AST Storage

AST data is stored as JSON files alongside source files:

```typescript
type ASTFile = {
  version: number;                // AST version for compatibility
  nodes: ASTNodeWithoutSourceFileKey[];
};

type ASTNodeWithoutSourceFileKey = Omit<ASTNode, 'sourceFileKey'>;

// Example AST file: /data/khala/ast/a1/b2c3d4e5f6.ast.json (RIPEMD-160 hash: a1b2c3d4e5f6...)
{
  "version": 1,
  "nodes": [
    {
      "startPos": 0,
      "endPos": 150,
      "kind": "FunctionDeclaration",
      "attributes": {
        "name": "formatString",
        "isExported": true,
        "isDefault": false,
        "parameterCount": 1,
        "returnType": "string"
      }
    }
  ]
}

// AST存储接口
type ASTStore = {
  storeAST: (sourceFileKey: string, nodes: ASTNode[]) => Promise<void>;
  getAST: (sourceFileKey: string) => Promise<ASTNode[] | null>;
  getASTNodesInRange: (sourceFileKey: string, startPos: number, endPos: number) => Promise<ASTNode[]>;
  removeAST: (sourceFileKey: string) => Promise<void>;
};
```

### SQLite Database Schema

SQLite用于存储符号定义和引用，支持关系型查询：

```sql
-- 源文件元数据表（用于快速查询，避免读取文件）
CREATE TABLE source_file_metadata (
  key TEXT PRIMARY KEY,
  description TEXT,
  size INTEGER NOT NULL,
  created_at DATETIME NOT NULL
);

-- 符号定义表
CREATE TABLE symbol_definitions (
  key TEXT PRIMARY KEY,
  source_file_key TEXT NOT NULL,
  start_pos INTEGER NOT NULL,
  end_pos INTEGER NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  description TEXT,
  dependencies TEXT, -- JSON数组，存储依赖的符号key
  created_at DATETIME NOT NULL,
  FOREIGN KEY (source_file_key) REFERENCES source_file_metadata(key)
);

-- 符号引用表
CREATE TABLE symbol_references (
  source_file_key TEXT NOT NULL,
  start_pos INTEGER NOT NULL,
  end_pos INTEGER NOT NULL,
  definition_key TEXT NOT NULL,
  reference_type TEXT NOT NULL, -- 'import', 'usage', 'export'
  created_at DATETIME NOT NULL,
  PRIMARY KEY (source_file_key, start_pos, end_pos),
  FOREIGN KEY (source_file_key) REFERENCES source_file_metadata(key),
  FOREIGN KEY (definition_key) REFERENCES symbol_definitions(key)
);

-- 性能索引
CREATE INDEX idx_symbol_definitions_source_file 
  ON symbol_definitions(source_file_key);
CREATE INDEX idx_symbol_definitions_name 
  ON symbol_definitions(name);
CREATE INDEX idx_symbol_references_definition 
  ON symbol_references(definition_key);
CREATE INDEX idx_symbol_references_source_file 
  ON symbol_references(source_file_key);
```

```typescript
// 符号存储接口
type SymbolStore = {
  storeSymbolDefinitions: (sourceFileKey: string, symbols: Symbol[]) => Promise<void>;
  getSymbolDefinition: (key: string) => Promise<Symbol | null>;
  getSymbolReferences: (definitionKey: string) => Promise<SymbolRef[]>;
  removeSymbolDefinition: (key: string) => Promise<void>;
  removeSymbolReferences: (definitionKey: string) => Promise<void>;
  findOrphanedSourceFiles: () => Promise<string[]>;
};
```

### LanceDB Semantic Indexing

```typescript
type SemanticIndexEntry = {
  symbol_key: string;             // Reference to symbol definition
  embeddings: number[];           // Vector representation
  keywords: string[];             // Extracted keywords
  description: string;            // Human-readable description
  last_indexed: Date;
};

type SemanticIndexStore = {
  indexSymbol: (symbol: Symbol) => Promise<void>;
  searchSymbols: (query: string, limit?: number) => Promise<Symbol[]>;
  removeSymbol: (symbolKey: string) => Promise<void>;
};
```

## Query Patterns

```typescript
getSymbolDefinition(key: string): Promise<Symbol | null>
getSymbolReferences(definitionKey: string): Promise<SymbolRef[]>
getASTNodesInRange(sourceFileKey: string, startPos: number, endPos: number): Promise<ASTNode[]>
getSymbolDependencies(symbolKey: string): Promise<Symbol[]>
```