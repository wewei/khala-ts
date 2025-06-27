# Contributing to Khala

Thank you for your interest in contributing to Khala! This guide will help you get started with the development process.

## 🚀 Quick Start

### Prerequisites

- **Bun**: Latest version (1.0+)
- **TypeScript**: 5.0+
- **Git**: For version control
- **VS Code**: Recommended (with Biome extension)

### Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/khala-ts.git
   cd khala-ts
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Verify setup**
   ```bash
   bun run check
   ```

## 📋 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/improvements

### 2. Follow TypeScript Conventions

All code must follow the conventions defined in `.cursor/typescript.mdc`:

- Use `type` instead of `interface`
- Never use `enum` or `class`
- Follow naming conventions (camelCase, PascalCase, etc.)
- Use proper import/export patterns
- Keep functions under 50 lines

### 3. Project Structure

```
khala-ts/
├── decl/           # Type definitions only
│   ├── core/       # Core entity types
│   ├── cli/        # CLI command types
│   └── ...
├── impl/           # Implementation code only
│   ├── cli/        # CLI implementation
│   ├── indexer/    # Indexing engine
│   ├── semantic/   # Semantic search
│   └── ...
├── decl-*/         # Test folders for decl
└── impl-*/         # Test folders for impl
```

### 4. Development Process

1. **Plan your changes**
   - Review the project plan in `PROJECT_PLAN.md`
   - Check existing issues and discussions
   - Create an issue if needed

2. **Write code**
   - Follow the established patterns
   - Add proper type annotations
   - Write self-documenting code

3. **Add tests**
   - Each implementation file needs corresponding tests
   - Test both success and error cases
   - Use Bun's built-in test framework

4. **Check code quality**
   ```bash
   bun run check:fix
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### 5. Submit a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a PR**
   - Use the PR template
   - Describe your changes clearly
   - Link related issues

3. **Wait for review**
   - Address feedback promptly
   - Keep commits clean and focused

## 🧪 Testing

### Running Tests

```bash
# Run all tests
bun test

# Run tests for specific module
bun test impl/cli/

# Run tests with coverage
bun test --coverage
```

### Test Structure

```
impl/cli/
├── index.ts
└── cli-test/
    ├── index.test.ts
    └── parser.test.ts
```

### Writing Tests

```typescript
import { describe, it, expect } from "bun:test";
import createUser from "@i/createUser";
import type { User } from "@d/user/auth";

describe("createUser", () => {
  it("should create user with valid data", () => {
    const result = createUser({ name: "John", email: "john@example.com" });
    expect(result.name).toBe("John");
  });

  it("should throw for invalid email", () => {
    expect(() => createUser({ name: "John", email: "invalid" })).toThrow();
  });
});
```

## 🔧 Code Quality

### Pre-commit Checklist

- [ ] Code follows TypeScript conventions
- [ ] All tests pass
- [ ] No linting errors
- [ ] Code is properly formatted
- [ ] Documentation is updated
- [ ] No console.log statements (unless intentional)

### Quality Commands

```bash
# Check everything
bun run check

# Fix formatting and linting
bun run check:fix

# Type check only
bun run tsc --noEmit

# Lint only
bun run lint
```

## 📝 Documentation

### Code Documentation

- Use JSDoc for complex functions
- Document type parameters for generics
- Provide usage examples
- Keep comments up to date

```typescript
/**
 * Creates a new user with the provided data
 * @param userData - The user data to create
 * @returns A new user object with generated ID
 * @throws {Error} When email is invalid
 */
const createUser = (userData: CreateUserData): User => {
  // implementation
};
```

### Documentation Updates

- Update README.md for user-facing changes
- Update PROJECT_PLAN.md for architectural changes
- Add inline documentation for complex logic
- Update type definitions with examples

## 🐛 Bug Reports

### Before Reporting

1. Check existing issues
2. Try the latest version
3. Reproduce the issue
4. Check the documentation

### Bug Report Template

```markdown
**Description**
Brief description of the issue

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Windows 10]
- Bun version: [e.g., 1.0.0]
- TypeScript version: [e.g., 5.0.0]

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Before Requesting

1. Check if it's already planned
2. Consider the project scope
3. Think about implementation complexity
4. Consider user impact

### Feature Request Template

```markdown
**Problem**
Description of the problem this feature would solve

**Proposed Solution**
Description of the proposed solution

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Any other relevant information
```

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the project conventions

### Communication

- Use clear, descriptive language
- Be patient with newcomers
- Ask questions when unsure
- Share knowledge and experiences

## 🏆 Recognition

### Contributors

All contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

### Types of Contributions

- **Code**: New features, bug fixes, refactoring
- **Documentation**: Guides, examples, API docs
- **Testing**: Test cases, test infrastructure
- **Design**: UI/UX improvements, architecture
- **Community**: Support, mentoring, outreach

## 📞 Getting Help

### Resources

- **Documentation**: Check README.md and PROJECT_PLAN.md
- **Issues**: Search existing issues on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Code**: Review existing code for patterns

### Contact

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Pull Requests**: For code contributions

## 🎯 Contribution Ideas

### Good First Issues

- Documentation improvements
- Test coverage additions
- Code formatting fixes
- Simple bug fixes
- Type definition improvements

### Advanced Contributions

- New CLI commands
- Performance optimizations
- Database integrations
- API implementations
- Advanced features

Thank you for contributing to Khala! Your help makes this project better for everyone. 🚀 