# Khala Add Command

## Overview

Add TypeScript files to the Khala database with full TypeScript compiler integration. Extracts top-level symbols, tracks dependencies, and stores them in a SQLite database for semantic analysis.

## Command Usage

```bash
khala add <path> [options]
```

## Parameters

### Required

- **`<path>`** - Path to TypeScript file or directory

### Options

- `--recursive, -r` - Recursively add directories (planned)
- `--force, -f` - Force add even if exists (planned)
- `--verbose, -v` - Verbose output with detailed processing information

## Features

### ✅ **Implemented Features**

#### **Database Management**
- Automatic Khala database creation in `$KHALA_ROOT` or `~/.khala`
- SQLite database with optimized schema and indexes
- Transaction support for data integrity
- Semantic index directory structure for future LanceDB integration

#### **TypeScript Compiler Integration**
- Full TypeScript compiler API usage (no regex parsing)
- Automatic tsconfig.json detection and parsing
- Project-specific compiler options support
- Graceful fallback to defaults if tsconfig.json is missing

#### **Symbol Extraction**
- **Functions**: Function declarations with parameters and return types
- **Variables**: Const, let, and var declarations
- **Types**: Type aliases and type definitions
- **Interfaces**: Interface declarations with properties
- **Classes**: Class declarations with methods and properties
- **Enums**: Enum declarations with members
- **Modules**: Namespace and module declarations

#### **Dependency Tracking**
- Import statement analysis
- Type reference tracking
- Qualified name resolution (e.g., `Utils.functionName`)
- Cross-symbol dependency relationships

#### **Error Handling & Validation**
- Comprehensive error handling with descriptive messages
- File existence validation
- TypeScript file type detection
- Graceful handling of parsing errors

### 🚧 **Planned Features**

#### **Directory Processing**
- Recursive directory traversal
- Batch file processing
- Progress reporting for large directories

#### **Advanced Features**
- Symbol deduplication
- Incremental updates
- Dependency graph visualization
- Semantic search integration

## Architecture

### **File Structure**

```text
impl/khalaMain/add/
├── index.ts                    # Main command orchestrator
├── getKhalaRoot.ts            # Database location management
├── findTsConfig.ts            # tsconfig.json detection
├── parseTypeScriptFile.ts     # TypeScript compiler integration
├── storeSymbols.ts            # Database storage operations
└── README.md                  # This documentation
```

### **Data Flow**

1. **Path Validation** → Check file/directory exists
2. **Database Setup** → Ensure Khala database exists
3. **Config Detection** → Find and parse tsconfig.json
4. **File Processing** → Parse TypeScript with compiler API
5. **Symbol Extraction** → Extract top-level symbols and dependencies
6. **Database Storage** → Store symbols and relationships in SQLite

## Usage Examples

### **Basic Usage**
```bash
# Add a single TypeScript file
khala add src/utils.ts

# Add with verbose output
khala add src/utils.ts --verbose
```

### **Environment Configuration**
```bash
# Set custom database location
export KHALA_ROOT=/path/to/khala/db
khala add src/utils.ts

# Use default location (~/.khala)
khala add src/utils.ts
```

## Database Schema

### **Symbols Table**
```sql
CREATE TABLE symbols (
  qualified_name TEXT PRIMARY KEY,
  namespace TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  description TEXT NOT NULL,
  ast TEXT NOT NULL,           -- JSON serialized TypeScript AST
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Dependencies Table**
```sql
CREATE TABLE dependencies (
  from_qualified_name TEXT NOT NULL,
  to_qualified_name TEXT NOT NULL,
  dependency_type TEXT DEFAULT 'reference',
  context TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (from_qualified_name, to_qualified_name)
);
```

## Testing

Comprehensive test suite covering:
- TypeScript parsing functionality
- Symbol extraction accuracy
- Database storage operations
- Error handling scenarios
- tsconfig.json integration

Run tests with:
```bash
bun test impl/khalaMain/add-test/
```

## Error Handling

The command handles various error scenarios gracefully:

- **File not found**: Clear error message with path
- **Invalid TypeScript**: Detailed parsing error information
- **Database errors**: Transaction rollback with error details
- **Missing tsconfig.json**: Warning with fallback to defaults
- **Permission issues**: Clear access error messages

## Performance

- **Efficient parsing**: Uses TypeScript compiler API for accurate results
- **Database optimization**: Indexed queries and transaction support
- **Memory management**: Processes files individually to minimize memory usage
- **Fast symbol lookup**: Optimized database schema with proper indexes

## Future Enhancements

1. **Recursive Directory Processing**
2. **Symbol Deduplication**
3. **Incremental Updates**
4. **Dependency Graph Analysis**
5. **Semantic Search Integration**
6. **Cross-Project Dependencies**
7. **Symbol Evolution Tracking**
