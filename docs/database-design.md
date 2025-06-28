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

### Base Symbol

```typescript
type BaseSymbol = {
  id: string;                    // Unique identifier
  name: string;                  // Symbol name
  namespace: string;             // Module-based namespace
  description: string;           // For semantic indexing
  content: string;               // Full symbol content
  dependencies: string[];        // IDs of symbols this depends on
  dependents: string[];          // IDs of symbols that depend on this
  fingerprints: {
    content: string;             // Content hash
  };
  createdAt: Date;
  updatedAt: Date;
};
```

### Symbol Types

#### Function Symbol

```typescript
type FunctionSymbol = BaseSymbol & {
  kind: "function";
  signature: string;             // Function signature
  parameters: Array<{
    name: string;
    type: string;
    optional: boolean;
  }>;
  returnType: string;
  fingerprints: {
    content: string;
    signature: string;           // Signature hash
  };
};
```

#### Type Symbol

```typescript
type TypeSymbol = BaseSymbol & {
  kind: "type";
  typeDefinition: string;        // Type definition
  isUnion: boolean;              // Whether it's a union type
  isGeneric: boolean;            // Whether it has type parameters
  typeParameters?: string[];     // Generic type parameters
};
```

#### Interface Symbol

```typescript
type InterfaceSymbol = BaseSymbol & {
  kind: "interface";
  properties: Array<{
    name: string;
    type: string;
    optional: boolean;
    readonly: boolean;
  }>;
  extends?: string[];            // Extended interfaces
  isGeneric: boolean;
  typeParameters?: string[];
};
```

#### Class Symbol

```typescript
type ClassSymbol = BaseSymbol & {
  kind: "class";
  properties: Array<{
    name: string;
    type: string;
    access: "public" | "private" | "protected";
    static: boolean;
  }>;
  methods: Array<{
    name: string;
    signature: string;
    access: "public" | "private" | "protected";
    static: boolean;
  }>;
  extends?: string;              // Parent class
  implements?: string[];         // Implemented interfaces
  isGeneric: boolean;
  typeParameters?: string[];
};
```

#### Variable Symbol

```typescript
type VariableSymbol = BaseSymbol & {
  kind: "variable";
  type: string;                  // Variable type
  isConst: boolean;              // Whether it's const
  isLet: boolean;                // Whether it's let
};
```

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
  name: "formatString",
  namespace: "Utils",
  kind: "function"
}

{
  name: "StringFormat", 
  namespace: "Utils",
  kind: "type"
}
```

### Default Namespace

For files without explicit namespaces:

```typescript
{
  name: "formatString",
  namespace: "global",
  kind: "function"
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
  name: "format",
  namespace: "Utils.String",
  kind: "function"
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

// Dependencies:
// - User (type reference)
// - ProcessOptions (type reference) 
// - Result (type reference)
// - createValidator (function call)
// - validator.validate (method call)
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
// Signature: (str: string, format: string): string
// Content: function formatString(str: string, format: string): string { ... }

// Generated description:
"Formats a string using the specified format pattern"
```

## Database Schema (MVP)

### Symbols Table

```sql
CREATE TABLE symbols (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  namespace TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  signature TEXT,
  type_definition TEXT,
  content_hash TEXT NOT NULL,
  signature_hash TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Dependencies Table

```sql
CREATE TABLE dependencies (
  from_id TEXT NOT NULL,
  to_id TEXT NOT NULL,
  dependency_type TEXT DEFAULT 'reference',
  context TEXT,
  PRIMARY KEY (from_id, to_id),
  FOREIGN KEY (from_id) REFERENCES symbols(id),
  FOREIGN KEY (to_id) REFERENCES symbols(id)
);
```

### Namespaces Table

```sql
CREATE TABLE namespaces (
  name TEXT PRIMARY KEY,
  description TEXT,
  parent_namespace TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Strategy

### Phase 1: Basic Symbol Extraction (MVP)

- Extract functions and types from TypeScript files
- Generate unique IDs for each symbol
- Use TypeScript namespaces or default to "global"
- Basic dependency tracking

### Phase 2: Advanced Features

- Comprehensive dependency analysis
- JSDoc extraction
- LLM integration for descriptions
- Namespace management tools

### Phase 3: Optimization

- Efficient symbol lookup
- Dependency graph optimization
- Semantic search integration
- Performance monitoring

## Benefits

### Flexibility

- Symbols can move between files without losing history
- Dependencies tracked at symbol level, not file level
- Easy to find all usages of a specific function/type

### Efficiency

- No redundant storage of file content
- Precise dependency graphs
- Better search and indexing

### Maintainability

- Changes to one symbol don't affect others
- Easier to track symbol evolution
- Better support for refactoring tools

### Semantic Understanding

- Rich descriptions for AI-powered search
- Comprehensive dependency analysis
- Better code understanding and documentation

## Future Considerations

### Symbol Evolution

- Track symbol changes over time
- Version history for symbols
- Migration paths for symbol changes

### Cross-Project Dependencies

- Handle external dependencies
- Package-level symbol organization
- Version compatibility tracking

### Advanced Analysis

- Code complexity metrics
- Usage pattern analysis
- Refactoring suggestions
- Impact analysis for changes
