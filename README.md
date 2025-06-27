# khala-ts

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Code Quality

This project uses [Biome](https://biomejs.dev/) for linting and formatting, configured to match the TypeScript coding conventions defined in `.cursor/typescript.mdc`.

### Available Scripts

- `bun run lint` - Check for linting issues
- `bun run lint:fix` - Fix linting issues automatically
- `bun run format` - Check code formatting
- `bun run format:fix` - Fix formatting automatically
- `bun run check` - Run both linting and formatting checks
- `bun run check:fix` - Fix both linting and formatting issues

### Key Configuration

The Biome configuration enforces:

- **TypeScript Conventions**: Uses `type` instead of `interface`, no `enum` or `class`
- **Naming**: camelCase for variables/functions, PascalCase for types, UPPER_SNAKE_CASE for constants
- **Imports**: `node:` prefix for Node.js built-ins, `import type` for types, organized grouping
- **Code Style**: Double quotes, semicolons, trailing commas when appropriate
- **Architecture**: Respects `/decl` and `/impl` folder structure

### VS Code Integration

For the best experience, install the Biome extension for VS Code to get real-time linting and formatting.

This project was created using `bun init` in bun v1.2.7. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
