# Khala Database Design

## Overview

Khala uses an atom-based database design where individual symbols (functions, types, classes, etc.) are stored as
independent entities rather than whole files. This approach reflects how code actually works - symbols can move between
files, have dependencies on each other, and exist independently.

## Core Principles

### Atom-Based Storage

- Store individual symbols, not files
- Each symbol is a self-contained entity
- Symbols can move between files without losing history
- No redundant storage of file content

### Module-Based Namespaces

- Use TypeScript namespaces for organization
- Virtual module concept independent of file system
- Flexible implementation (file-based, in-memory, or hybrid)
- Respect existing TypeScript namespace declarations

### Comprehensive Dependencies

- Track all symbol references, not just imports
- Dependencies = what's needed for compiler to understand a symbol
- Proper dependency direction (functions can depend on types, not vice versa)
- Enable accurate impact analysis and refactoring

## Symbol Structure

### Symbol Type

```typescript
type Symbol = {
  qualifiedName: string;         // Primary key - namespace.name (e.g., "Utils.formatString")
  description: string;           // Purpose/description for semantic indexing
  ast: ts.Node;                  // TypeScript AST node - contains all symbol details
  dependencies: string[];        // Qualified names of symbols this depends on
  dependents: string[];          // Qualified names of symbols that depend on this
  createdAt: Date;
  updatedAt: Date;
};

// Helper functions to extract name and namespace
const getName = (qualifiedName: string): string => 
  qualifiedName.split('.').pop() || qualifiedName;

const getNamespace = (qualifiedName: string): string => 
  qualifiedName.includes('.') ? qualifiedName.substring(0, qualifiedName.lastIndexOf('.')) : '';
```

### Why Single Symbol Type?

The AST already contains all the information we need:
- **Kind**: Available via `ast.kind` (FunctionDeclaration, ClassDeclaration, etc.)
- **Properties**: Available by traversing the AST
- **Types**: Available in the AST structure
- **Structure**: The AST preserves all syntactic and semantic relationships

This approach is:
- **Simpler**: One type instead of many specialized types
- **More flexible**: AST can represent any TypeScript construct
- **More accurate**: AST is the authoritative source of truth
- **Easier to maintain**: No need to keep multiple type definitions in sync

## Namespace Strategy

### TypeScript Namespace Integration

Khala respects existing TypeScript namespace declarations:

```typescript
// TypeScript code
namespace Utils {
  export function formatString(str: string): string { }
  export type StringFormat = "uppercase" | "lowercase";
}

// In Khala database:
{
  qualifiedName: "Utils.formatString",
  namespace: "Utils",
  name: "formatString",
  kind: "FunctionDeclaration",
  description: "Formats a string according to the specified format pattern",
  ast: /* TypeScript AST node */,
  dependencies: [],
  dependents: []
}

{
  qualifiedName: "Utils.StringFormat", 
  namespace: "Utils",
  name: "StringFormat",
  kind: "TypeAliasDeclaration",
  description: "String format options",
  ast: /* TypeScript AST node */,
  dependencies: [],
  dependents: []
}
```

### Default Namespace

For files without explicit namespaces:

```typescript
{
  qualifiedName: "formatString",
  namespace: "",
  name: "formatString",
  kind: "FunctionDeclaration",
  description: "Formats a string according to the specified format pattern",
  ast: /* TypeScript AST node */,
  dependencies: [],
  dependents: []
}
```

### Nested Namespaces

Support for nested namespace structures:

```typescript
namespace Utils.String {
  export function format() { }
}

// In database:
{
  qualifiedName: "Utils.String.format",
  namespace: "Utils.String",
  name: "format",
  kind: "FunctionDeclaration",
  description: "Formats a string",
  ast: /* TypeScript AST node */,
  dependencies: [],
  dependents: []
}
```

## Dependency Rules

### Allowed Dependencies

- **Function → Type**: Functions can use types
- **Function → Interface**: Functions can implement interfaces
- **Class → Interface**: Classes can implement interfaces
- **Interface → Interface**: Interfaces can extend interfaces
- **Function → Function**: Functions can call other functions

### Forbidden Dependencies

- **Type → Function**: Types cannot depend on functions
- **Type → Class**: Types cannot depend on classes
- **Interface → Function**: Interfaces cannot depend on functions

### Dependency Examples

```typescript
// Function using types and calling other functions
function processUser(user: User, options: ProcessOptions): Result {
  const validator = createValidator(options);
  return validator.validate(user);
}

// Dependencies (using qualified names):
// - "User" (type reference - root namespace)
// - "ProcessOptions" (type reference - root namespace) 
// - "Result" (type reference - root namespace)
// - "Utils.createValidator" (function call)
// - "Utils.Validator.validate" (method call)
```

## Description Generation

### Priority Order

1. **JSDoc**: Extract from existing documentation
2. **LLM**: Generate using AI if API configured
3. **Manual**: Prompt for user input

### JSDoc Integration

```typescript
/**
 * Formats a string according to the specified format pattern
 * @param str - The string to format
 * @param format - The format pattern to apply
 * @returns The formatted string
 */
function formatString(str: string, format: string): string { }

// Extracted description:
"Formats a string according to the specified format pattern"
```

### LLM Generation

When JSDoc is not available and LLM API is configured:

```typescript
// Input to LLM:
// Symbol: formatString
// Kind: function
// Type: (str: string, format: string): string
// Content: function formatString(str: string, format: string): string { ... }

// Generated description:
"Formats a string using the specified format pattern"
```

## Database Schema (SQLite)

### Symbols Table

```sql
-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Symbols table with SQLite optimizations
CREATE TABLE symbols (
  qualified_name TEXT PRIMARY KEY,
  namespace TEXT NOT NULL,       -- Derived from qualified_name for faster queries (empty string for root)
  name TEXT NOT NULL,            -- Derived from qualified_name for faster queries
  kind TEXT NOT NULL,            -- For faster search (FunctionDeclaration, ClassDeclaration, etc.)
  description TEXT NOT NULL,
  ast TEXT NOT NULL,             -- JSON serialized TypeScript AST
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now'))
);

-- Indexes for common query patterns
CREATE INDEX idx_symbols_namespace ON symbols(namespace);
CREATE INDEX idx_symbols_name ON symbols(name);
CREATE INDEX idx_symbols_kind ON symbols(kind);
CREATE INDEX idx_symbols_namespace_kind ON symbols(namespace, kind);
CREATE INDEX idx_symbols_created_at ON symbols(created_at);
```

### Dependencies Table

```sql
CREATE TABLE dependencies (
  from_qualified_name TEXT NOT NULL,
  to_qualified_name TEXT NOT NULL,
  dependency_type TEXT DEFAULT 'reference',
  context TEXT,
  created_at DATETIME DEFAULT (datetime('now')),
  PRIMARY KEY (from_qualified_name, to_qualified_name),
  FOREIGN KEY (from_qualified_name) REFERENCES symbols(qualified_name) ON DELETE CASCADE,
  FOREIGN KEY (to_qualified_name) REFERENCES symbols(qualified_name) ON DELETE CASCADE
);

-- Indexes for dependency queries
CREATE INDEX idx_dependencies_from ON dependencies(from_qualified_name);
CREATE INDEX idx_dependencies_to ON dependencies(to_qualified_name);
CREATE INDEX idx_dependencies_type ON dependencies(dependency_type);
```

### Namespaces Table

```sql
CREATE TABLE namespaces (
  name TEXT PRIMARY KEY,
  description TEXT,
  parent_namespace TEXT,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (parent_namespace) REFERENCES namespaces(name) ON DELETE CASCADE
);

-- Index for parent namespace lookups
CREATE INDEX idx_namespaces_parent ON namespaces(parent_namespace);
```

### Triggers for Data Integrity

```sql
-- Update the updated_at timestamp when a symbol is modified
CREATE TRIGGER update_symbols_updated_at 
  AFTER UPDATE ON symbols
  FOR EACH ROW
BEGIN
  UPDATE symbols SET updated_at = datetime('now') WHERE qualified_name = NEW.qualified_name;
END;

-- Ensure namespace and name are derived from qualified_name
CREATE TRIGGER validate_symbol_qualified_name
  BEFORE INSERT ON symbols
  FOR EACH ROW
BEGIN
  SELECT CASE 
    WHEN NEW.qualified_name IS NULL OR NEW.qualified_name = '' 
    THEN RAISE(ABORT, 'qualified_name cannot be null or empty')
  END;
END;
```

### Common Queries

```sql
-- Find all functions in a specific namespace
SELECT * FROM symbols 
WHERE namespace = 'Utils' AND kind = 'FunctionDeclaration';

-- Find all symbols that depend on a specific symbol
SELECT s.* FROM symbols s
JOIN dependencies d ON s.qualified_name = d.from_qualified_name
WHERE d.to_qualified_name = 'Utils.formatString';

-- Find all symbols that a specific symbol depends on
SELECT s.* FROM symbols s
JOIN dependencies d ON s.qualified_name = d.to_qualified_name
WHERE d.from_qualified_name = 'Utils.formatString';

-- Find root-level symbols (no namespace)
SELECT * FROM symbols WHERE namespace = '';

-- Find all namespaces and their symbol counts
SELECT namespace, COUNT(*) as symbol_count 
FROM symbols 
GROUP BY namespace 
ORDER BY symbol_count DESC;
```
