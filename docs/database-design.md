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
  qualifiedName: string;         // namespace.name (e.g., "Utils.formatString")
  description: string;           // For semantic indexing
  content: string;               // Full symbol content
  dependencies: string[];        // Qualified names of symbols this depends on
  dependents: string[];          // Qualified names of symbols that depend on this
  fingerprints: {
    content: string;             // Content hash
  };
  createdAt: Date;
  updatedAt: Date;
};

// Helper functions to extract name and namespace
const getName = (qualifiedName: string): string => 
  qualifiedName.split('.').pop() || qualifiedName;

const getNamespace = (qualifiedName: string): string => 
  qualifiedName.includes('.') ? qualifiedName.substring(0, qualifiedName.lastIndexOf('.')) : 'global';
```

### Declaration Symbols (Are Types Themselves)

#### Type Symbol

```typescript
type TypeSymbol = BaseSymbol & {
  kind: "type";
  typeDefinition: string;        // Type definition
  isUnion: boolean;              // Whether it's a union type
  isGeneric: boolean;            // Whether it has type parameters
  typeParameters?: string[];     // Generic type parameters
  // No type field - the symbol itself is the type
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
  // No type field - the symbol itself is the type
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
    type: string;                // Method type
    access: "public" | "private" | "protected";
    static: boolean;
  }>;
  extends?: string;              // Parent class
  implements?: string[];         // Implemented interfaces
  isGeneric: boolean;
  typeParameters?: string[];
  // No type field - the symbol itself is the type
};
```

#### Enum Symbol

```typescript
type EnumSymbol = BaseSymbol & {
  kind: "enum";
  members: Array<{
    name: string;
    value?: string | number;     // Explicit value if provided
  }>;
  isConst: boolean;              // Whether it's a const enum
  // No type field - the symbol itself is the type
};
```

### Implementation Symbols (Have Types)

#### Function Symbol

```typescript
type FunctionSymbol = BaseSymbol & {
  kind: "function";
  type: string;                  // Function type (e.g., "(str: string): string")
  parameters: Array<{
    name: string;
    type: string;
    optional: boolean;
  }>;
  returnType: string;
  fingerprints: {
    content: string;
    type: string;                // Type hash
  };
};
```

#### Variable Symbol

```typescript
type VariableSymbol = BaseSymbol & {
  kind: "variable";
  type: string;                  // Variable type (e.g., "string")
  isConst: boolean;              // Whether it's const
  isLet: boolean;                // Whether it's let
  fingerprints: {
    content: string;
    type: string;                // Type hash
  };
};
```

#### Constant Symbol

```typescript
type ConstantSymbol = BaseSymbol & {
  kind: "constant";
  type: string;                  // Constant type (e.g., "string")
  value?: string;                // Literal value if available
  fingerprints: {
    content: string;
    type: string;                // Type hash
  };
};
```

### Union Type

```typescript
type Symbol = 
  | TypeSymbol 
  | InterfaceSymbol 
  | ClassSymbol 
  | EnumSymbol
  | FunctionSymbol 
  | VariableSymbol 
  | ConstantSymbol;

type DeclarationSymbol = TypeSymbol | InterfaceSymbol | ClassSymbol | EnumSymbol;
type ImplementationSymbol = FunctionSymbol | VariableSymbol | ConstantSymbol;
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
  qualifiedName: "Utils.formatString",
  kind: "function",
  type: "(str: string): string"
}

{
  qualifiedName: "Utils.StringFormat", 
  kind: "type"
  // No type field - this symbol IS the type
}
```

### Default Namespace

For files without explicit namespaces:

```typescript
{
  qualifiedName: "global.formatString",
  kind: "function",
  type: "(str: string): string"
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
  kind: "function",
  type: "(): void"
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
// - "types.User" (type reference)
// - "types.ProcessOptions" (type reference) 
// - "types.Result" (type reference)
// - "utils.createValidator" (function call)
// - "utils.Validator.validate" (method call)
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

## Database Schema (MVP)

### Symbols Table

```sql
CREATE TABLE symbols (
  qualified_name TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT,                     -- NULL for declaration symbols
  content_hash TEXT NOT NULL,
  type_hash TEXT,                -- NULL for declaration symbols
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Dependencies Table

```sql
CREATE TABLE dependencies (
  from_qualified_name TEXT NOT NULL,
  to_qualified_name TEXT NOT NULL,
  dependency_type TEXT DEFAULT 'reference',
  context TEXT,
  PRIMARY KEY (from_qualified_name, to_qualified_name),
  FOREIGN KEY (from_qualified_name) REFERENCES symbols(qualified_name),
  FOREIGN KEY (to_qualified_name) REFERENCES symbols(qualified_name)
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
