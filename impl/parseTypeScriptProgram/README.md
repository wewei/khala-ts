# parseTypeScriptProgram

A TypeScript parsing module that uses `@typescript/vfs` to parse TypeScript files with a virtual file system and returns
a record mapping file paths to SourceFile nodes.

## Features

- Uses `@typescript/vfs` for virtual file system support
- Returns TypeScript AST SourceFile nodes directly
- Supports single file, multi-file, and tsconfig.json file list modes
- Automatically includes TypeScript standard library files
- Configurable compiler options
- Error handling with detailed error messages
- No file system dependencies

## Usage

### Single File Mode

```typescript
import parseTypeScriptProgram from "@i/parseTypeScriptProgram";
import { createSystem } from "@typescript/vfs";

// Create a virtual file system
const vfs = createSystem(new Map([
  ["/test.ts", `
    function hello(name: string): string {
      return \`Hello \${name}!\`;
    }
  `],
]));

// Parse a single TypeScript file
const result = parseTypeScriptProgram({
  vfs,
  filePath: "/test.ts",
});

if (result.success) {
  const sourceFiles = result.value;
  const mainFile = sourceFiles["/test.ts"];
  console.log("Parsed successfully:", mainFile);
} else {
  console.error("Parse failed:", result.error);
}
```

### Multi-File Mode

```typescript
// Parse multiple files with explicit list
const result = parseTypeScriptProgram({
  vfs,
  files: ["/src/main.ts", "/src/types.ts", "/src/utils.ts"],
});

if (result.success) {
  const sourceFiles = result.value;
  console.log("Parsed files:", Object.keys(sourceFiles));
  // sourceFiles = {
  //   "/src/main.ts": SourceFile,
  //   "/src/types.ts": SourceFile,
  //   "/src/utils.ts": SourceFile,
  // }
}
```

### tsconfig.json File List Mode

```typescript
// Parse files using include/exclude patterns
const result = parseTypeScriptProgram({
  vfs,
  include: ["src/**/*.ts"],
  exclude: ["**/*.test.ts", "node_modules/**"],
  baseDir: "/",
});

if (result.success) {
  const sourceFiles = result.value;
  console.log("Files matching patterns:", Object.keys(sourceFiles));
}
```

## API

### `parseTypeScriptProgram(options: ParseTypeScriptProgramOptions): Result<Record<string, SourceFile>>`

#### Options

- `vfs: System` - Virtual file system containing the TypeScript files
- `filePath?: string` - Path to a single TypeScript file to parse
- `files?: string[]` - List of files to parse (multi-file mode)
- `include?: string[]` - Include patterns from tsconfig.json
- `exclude?: string[]` - Exclude patterns from tsconfig.json
- `baseDir?: string` - Base directory for resolving relative paths
- `compilerOptions?: CompilerOptions` - Optional TypeScript compiler options
- `useTsConfigFileList?: boolean` - Whether to use tsconfig.json file list configuration

#### Result

- `success: boolean` - Whether parsing was successful
- `value?: Record<string, SourceFile>` - Record mapping file paths to SourceFile nodes (if successful)
- `error?: string` - Error message if parsing failed

## File List Calculation

The module supports three modes for determining which files to parse:

1. **Single File Mode**: When `filePath` is provided, only that file is parsed
2. **Explicit Files Mode**: When `files` array is provided, only those files are parsed
3. **tsconfig.json Mode**: When `include`/`exclude` patterns are provided, files are filtered based on glob patterns

### Glob Pattern Support

The file list calculator supports standard glob patterns:
- `**/*.ts` - All TypeScript files recursively
- `src/**/*.{ts,tsx}` - All TypeScript/TSX files in src directory
- `**/*.test.ts` - All test files
- `node_modules/**` - All files in node_modules directory

## Default Compiler Options

The module uses sensible defaults for TypeScript compilation:

- Target: ES2020
- Module: ESNext
- Module Resolution: NodeJs
- Allow Synthetic Default Imports: true
- ES Module Interop: true
- Skip Lib Check: true
- Strict: true
- No Implicit Any: true
- Strict Null Checks: true

## Standard Library Integration

The module automatically includes TypeScript standard library files using `createDefaultMapFromNodeModules` from `@typescript/vfs`. This ensures that all global types (Array, String, etc.) are available during parsing.

## Differences from parseTypeScriptFile

- **Virtual File System**: Uses `@typescript/vfs` instead of real file system
- **Multi-File Support**: Can parse multiple files in a single call
- **tsconfig.json Integration**: Supports include/exclude patterns
- **Standard Library**: Automatically includes TypeScript lib files
- **Return Type**: Returns a record of SourceFile nodes instead of SymbolInfo objects
- **No Symbol Extraction**: Focuses on AST parsing, not symbol extraction

## Error Handling

The module provides detailed error messages for various failure scenarios:

- Missing files
- Invalid TypeScript syntax
- Configuration errors
- File system errors

All errors are wrapped in a `Result` type for consistent error handling.
