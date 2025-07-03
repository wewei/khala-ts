# calculateFileList

根据 `@typescript/mdc` 风格重构的文件列表计算模块，用于解析 TypeScript 项目的文件配置。

## 模块结构

```
calculateFileList/
├── globMatch.ts            # Glob 模式匹配实现
├── globMatch-test/         # Glob 匹配测试
│   └── index.test.ts      # 测试文件
├── discoverFiles.ts        # 文件发现实现
├── discoverFiles-test/     # 文件发现测试
│   └── index.test.ts      # 测试文件
├── filterFiles.ts          # 文件过滤实现
├── filterFiles-test/       # 文件过滤测试
│   └── index.test.ts      # 测试文件
├── index.ts               # 主入口文件
└── README.md              # 本文档
```

## 类型定义

类型定义位于 `decl/parseTypeScriptProgram/calculateFileList.ts`，遵循项目的命名空间组织方式：

```typescript
// 从 decl 文件夹导入类型
import type { TsConfigFileList, FileListCalculatorOptions } from '@d/parseTypeScriptProgram/calculateFileList';
```

## 模块说明

### globMatch.ts
- **功能**: 使用 `glob-to-regexp` 包处理 glob 模式匹配
- **导出**: `globToRegex`, `globMatch`
- **支持**: `*`, `?`, `**`, `{a,b}` 语法

### discoverFiles.ts
- **功能**: 在虚拟文件系统中递归发现 TypeScript 文件
- **导出**: `discoverFilesInVfs`
- **支持**: 递归扫描目录，过滤 `.ts` 和 `.tsx` 文件

### filterFiles.ts
- **功能**: 根据 tsconfig.json 配置过滤文件列表
- **导出**: `filterFilesByTsConfig`
- **支持**: `files`, `include`, `exclude` 配置

### 主入口
- **功能**: 组合各个模块，提供完整的文件列表计算功能
- **导出**: `calculateFileList`, `parseTsConfigFileList`

## 使用示例

```typescript
import { calculateFileList } from './calculateFileList';
import type { FileListCalculatorOptions } from '@d/parseTypeScriptProgram/calculateFileList';

const options: FileListCalculatorOptions = {
  vfs: virtualFileSystem,
  tsConfig: {
    include: ['src/**/*.ts'],
    exclude: ['**/*.test.ts'],
    baseDir: '/'
  }
};

const result = calculateFileList(options);
```

## 测试

每个模块都有对应的测试文件夹，遵循 `@typescript/mdc` 的测试组织方式：

```bash
# 运行所有测试
bun test impl/parseTypeScriptProgram/calculateFileList/

# 运行特定模块测试
bun test impl/parseTypeScriptProgram/calculateFileList/globMatch-test/
bun test impl/parseTypeScriptProgram/calculateFileList/discoverFiles-test/
bun test impl/parseTypeScriptProgram/calculateFileList/filterFiles-test/
```

## 设计原则

1. **类型分离**: 类型定义在 `decl` 文件夹中，按命名空间组织
2. **模块化**: 每个功能独立成文件，职责单一
3. **测试分离**: 测试文件在 `-test` 文件夹中，与实现文件同级
4. **清晰导入**: 使用 `@d/` 别名导入类型定义 