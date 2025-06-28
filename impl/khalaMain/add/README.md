# Khala Add Command (MVP)

## Overview

Add TypeScript files to the Khala database. Start simple, iterate fast.

## Command Usage

```bash
khala add <path> [options]
```

## MVP Parameters

### Required

- **`<path>`** - Path to file or directory

### Options

- `--recursive, -r` - Recursively add directories
- `--force, -f` - Force add even if exists
- `--verbose, -v` - Verbose output

## MVP Implementation Plan

### Step 1: Path Validation (15 min)

- [ ] Check if path exists
- [ ] Determine if file or directory
- [ ] Basic error handling

### Step 2: File Collection (15 min)

- [ ] Collect TypeScript files
- [ ] Handle recursive option
- [ ] Basic file filtering

### Step 3: Basic Processing (15 min)

- [ ] Read file content
- [ ] Generate simple hash
- [ ] Store basic metadata

### Step 4: Results (15 min)

- [ ] Count processed files
- [ ] Show simple summary
- [ ] Handle errors gracefully

## File Structure (MVP)

```text
impl/khalaMain/add/
├── index.ts              # Main command
├── README.md             # This file
├── validatePath.ts       # Path validation
├── collectFiles.ts       # File collection
└── processFiles.ts       # Basic processing
```

## Next Iterations (After MVP Works)

- AST extraction
- Advanced filtering
- Database integration
- Progress reporting
- Multiple output formats

## Questions for Discussion

1. What's the minimal file processing needed?
2. How should we handle errors initially?
3. What's the simplest storage approach?
