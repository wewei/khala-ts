# Khala Database Initialization

This module initializes the Khala database with a three-layer architecture as specified in the database design document.

## Architecture Overview

The Khala database uses a three-layer immutable design:

1. **SourceFile Layer** - File system storage for source files and AST data
2. **AST Node Layer** - Position-based AST nodes stored in JSON files
3. **Symbol Layer** - SQLite database for symbol definitions and references

## Directory Structure

```
khala-database/
├── source/                    # Source files storage
│   ├── 00/                   # Hash-based subdirectories (00-ff)
│   ├── 01/
│   └── ...
├── ast/                      # AST files storage
│   ├── 00/                   # Hash-based subdirectories (00-ff)
│   ├── 01/
│   └── ...
├── semantic-index/           # LanceDB semantic indexing
│   ├── symbols/
│   └── embeddings/
└── khala.db                  # SQLite database
```

## File Path Structure

### Source Files
- Path: `{basePath}/source/{first2chars}/{rest}.ts`
- Example: `/data/khala/source/a1/b2c3d4e5f6.ts` (RIPEMD-160 hash: `a1b2c3d4e5f6...`)

### AST Files
- Path: `{basePath}/ast/{first2chars}/{rest}.ast.json`
- Example: `/data/khala/ast/a1/b2c3d4e5f6.ast.json` (RIPEMD-160 hash: `a1b2c3d4e5f6...`)

## Database Schema

### SQLite Tables

#### source_file_metadata
```sql
CREATE TABLE source_file_metadata (
  key TEXT PRIMARY KEY,           -- RIPEMD-160 hash
  description TEXT,               -- Semantic description
  size INTEGER NOT NULL,          -- File size in bytes
  created_at DATETIME NOT NULL    -- Creation timestamp
);
```

#### symbol_definitions
```sql
CREATE TABLE symbol_definitions (
  key TEXT PRIMARY KEY,           -- 40-digit hex symbol key
  source_file_key TEXT NOT NULL,  -- Reference to source file
  start_pos INTEGER NOT NULL,     -- Start position in source
  end_pos INTEGER NOT NULL,       -- End position in source
  name TEXT NOT NULL,             -- Symbol name
  kind TEXT NOT NULL,             -- Symbol kind (function, class, etc.)
  description TEXT,               -- Symbol description
  dependencies TEXT,              -- JSON array of dependency keys
  created_at DATETIME NOT NULL,   -- Creation timestamp
  FOREIGN KEY (source_file_key) REFERENCES source_file_metadata(key)
);
```

#### symbol_references
```sql
CREATE TABLE symbol_references (
  source_file_key TEXT NOT NULL,  -- Source file containing reference
  start_pos INTEGER NOT NULL,     -- Start position of reference
  end_pos INTEGER NOT NULL,       -- End position of reference
  definition_key TEXT NOT NULL,   -- Reference to symbol definition
  reference_type TEXT NOT NULL,   -- 'import', 'usage', or 'export'
  created_at DATETIME NOT NULL,   -- Creation timestamp
  PRIMARY KEY (source_file_key, start_pos, end_pos),
  FOREIGN KEY (source_file_key) REFERENCES source_file_metadata(key),
  FOREIGN KEY (definition_key) REFERENCES symbol_definitions(key)
);
```

## Usage

```typescript
import ensureKhalaDatabase from "@i/ensureKhalaDatabase";

const result = ensureKhalaDatabase("/path/to/khala-database");

if (result.success) {
  console.log("Database initialized successfully");
  console.log("Source files path:", result.sourceFilesPath);
  console.log("AST files path:", result.astFilesPath);
  console.log("SQLite database:", result.sqlitePath);
  console.log("Semantic index:", result.semanticIndexPath);
} else {
  console.error("Failed to initialize database:", result.error);
}
```

## Key Features

- **Immutable Design**: Append-only operations with hash-based identification
- **Hash-based Deduplication**: RIPEMD-160 hashes prevent duplicate source files
- **Position-based AST**: AST nodes represented as position segments
- **Semantic Indexing**: LanceDB integration for similarity search
- **Efficient Pruning**: Remove unused symbols and dependencies
- **Hybrid Storage**: File system for large content, SQLite for structured data 