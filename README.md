# Khala - Shared TypeScript Code Database

> **En aru'din Khala** - StarCraft High Templar
> ![Protoss Khala Network Illustration](docs/assets/Khala.webp)
> *Illustration: The Khala, the psychic network connecting every Protoss warrior (StarCraft)*

Inspired by the Protoss Khala network from StarCraft. Khala is a shared TypeScript code database that stores and indexes
functions and types. It provides literal indexing, code graph (dependency) indexing, and semantic indexing capabilities.
The system is accessed through the CLI tool `khala`.

## 🎯 Vision

Khala aims to create a global network of reusable TypeScript code, enabling developers to discover, share, and reuse
high-quality functions and types across projects. Think of it as a "GitHub for functions" with semantic search capabilities.

## 🏗️ Architecture

### Core Components

```text
khala-ts/
├── /decl/           # Type definitions (type namespaces, no index.ts)
│   ├── core/
│   ├── cli/
│   ├── indexer/
│   └── api/
├── /impl/           # Implementation code (structure to be discussed)
```

*Note: The structure of `/impl` will be discussed and refined later. All tests should be colocated in the `/impl` folder
using `-test` suffix folders. There is no separate `/tests/` folder.*

### Indexing System

1. **Literal Index**: Direct code search and matching
2. **Dependency Graph**: Function/type relationships and dependencies
3. **Semantic Index**: AI-powered semantic understanding of code purpose

## 🚀 CLI Commands

### `khala connect`

Connect current Bun codebase with Khala, enabling access to stored functions and types.

```bash
khala connect [--workspace <path>] [--config <config-file>]
```

**Features:**

- Auto-discovery of project structure
- Type resolution and dependency mapping
- Integration with existing TypeScript projects

### `khala search`

Perform semantic search to find relevant functions and types based on descriptions.

```bash
khala search "function to validate email addresses"
khala search --type "User authentication utilities"
khala search --limit 10 --sort-by relevance
```

**Features:**

- Natural language queries
- Semantic similarity matching
- Filtering by type, language, tags
- Relevance scoring

### `khala add`

Send TypeScript files to Khala for analysis and indexing.

```bash
khala add src/utils/validation.ts
khala add --recursive src/
khala add --exclude "**/*.test.ts" src/
```

**Features:**

- Automatic function and type extraction
- Dependency analysis
- Metadata generation (tags, descriptions)
- Version control integration

### `khala update`

Update existing functions or types in Khala.

```bash
khala update --id "validation-utils" src/utils/validation.ts
khala update --name "validateEmail" --version "2.0.0"
```

**Features:**

- Version management
- Change tracking
- Backward compatibility checking
- Dependency impact analysis

### `khala delete`

Remove functions or types from Khala.

```bash
khala delete --id "validation-utils"
khala delete --name "validateEmail" --version "1.0.0"
```

**Features:**

- Safe deletion with dependency checks
- Archive functionality
- Bulk operations

### `khala bundle`

Create Bun packages from Khala functions and types with dependencies.

```bash
khala bundle --functions "validateEmail,formatName" --output ./my-package
khala bundle --types "User,ApiResponse" --include-deps
```

**Features:**

- Dependency resolution
- Package.json generation
- TypeScript declarations
- Tree-shaking optimization

### `khala inspect`

Inspect code structure and metadata in Khala.

```bash
khala inspect --function "validateEmail"
khala inspect --dependencies "validation-utils"
khala inspect --graph --output graph.json
khala inspect --stats
```

**Subcommands:**

- `inspect function` - Function details and metadata
- `inspect type` - Type definitions and usage
- `inspect dependencies` - Dependency relationships
- `inspect graph` - Visualize code graph
- `inspect stats` - Database statistics

## 🛠️ Development Setup

### Prerequisites

- [Bun](https://bun.sh) (latest version)
- [TypeScript](https://www.typescriptlang.org/) 5.0+
- [Node.js](https://nodejs.org/) 18+ (for some tools)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd khala-ts

# Install dependencies
bun install

# Build the project
bun run build

# Run tests
bun test
```

### Code Quality

This project uses [Biome](https://biomejs.dev/) for linting and formatting, configured to match the TypeScript coding
conventions defined in `.cursor/typescript.mdc`.

#### Available Scripts

- `bun run lint` - Check for linting issues
- `bun run lint:fix` - Fix linting issues automatically
- `bun run format` - Check code formatting
- `bun run format:fix` - Fix formatting automatically
- `bun run check` - Run both linting and formatting checks
- `bun run check:fix` - Fix both linting and formatting issues

#### Key Configuration

The Biome configuration enforces:

- **TypeScript Conventions**: Uses `type` instead of `interface`, no `enum` or `class`
- **Naming**: camelCase for variables/functions, PascalCase for types, UPPER_SNAKE_CASE for constants
- **Imports**: `node:` prefix for Node.js built-ins, `import type` for types, organized grouping
- **Code Style**: Double quotes, semicolons, trailing commas when appropriate
- **Architecture**: Respects `/decl` and `/impl` folder structure

### VS Code Integration

For the best experience, install the Biome extension for VS Code to get real-time linting and formatting.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Follow the TypeScript conventions in `.cursor/typescript.mdc`
4. Write tests for new functionality
5. Run `bun run check:fix` before committing
6. Submit a pull request

## 📄 License

[License information to be added]

## 🎉 Acknowledgments

- Built with Bun for fast TypeScript development
- Uses Biome for code quality and formatting
