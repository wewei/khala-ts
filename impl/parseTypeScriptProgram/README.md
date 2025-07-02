# parseTypeScriptProgram

A TypeScript parsing module that uses `@typescript/vfs` to parse TypeScript files with a virtual file system and returns
the semantic tree node without generating SymbolInfo objects.

## Features

- Uses `@typescript/vfs` for virtual file system support
- Returns TypeScript AST SourceFile nodes directly
- Configurable compiler options
- Error handling with detailed error messages
- No file system dependencies

## Usage

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

// Parse the TypeScript file
const result = parseTypeScriptProgram({
  vfs,
  filePath: "/test.ts",
});

if (result.success) {
  console.log("Parsed successfully:", result.sourceFile);
} else {
  console.error("Parse failed:", result.error);
}
```

## API

### `parseTypeScriptProgram(options: ParseTypeScriptProgramOptions): ParseTypeScriptProgramResult`

#### Options

- `vfs: System` - Virtual file system containing the TypeScript files
- `filePath: string` - Path to the TypeScript file to parse
- `compilerOptions?: CompilerOptions` - Optional TypeScript compiler options

#### Result

- `success: boolean` - Whether parsing was successful
- `sourceFile?: SourceFile` - The parsed TypeScript source file node (if successful)
- `error?: string` - Error message if parsing failed

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

## Differences from parseTypeScriptFile

- Uses virtual file system instead of real file system
- Returns AST nodes directly instead of SymbolInfo objects
- No dependency extraction or symbol processing
- More focused on pure TypeScript parsing
