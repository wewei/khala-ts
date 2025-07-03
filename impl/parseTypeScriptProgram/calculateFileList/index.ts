import type { CompilerOptions } from "typescript";
import type { Result } from "@d/common/result";
import success from "@i/success";
import fail from "@i/fail";
import { discoverFilesInVfs } from "./discoverFiles";
import { filterFilesByTsConfig } from "./filterFiles";
import type { TsConfigFileList, FileListCalculatorOptions } from "@d/parseTypeScriptProgram/calculateFileList";

/**
 * 计算要包含在 TypeScript 程序中的文件列表
 * 基于 tsconfig.json 的 files、include 和 exclude 模式
 */
export function calculateFileList(options: FileListCalculatorOptions): Result<string[]> {
  const { vfs, tsConfig, compilerOptions = {} } = options;
  
  try {
    // 导入 TypeScript 以避免循环依赖
    const ts = require("typescript");
    
    // 文件发现的默认编译器选项
    const defaultOptions: CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      skipLibCheck: true,
    };
    
    const mergedOptions = { ...defaultOptions, ...compilerOptions };
    
    // 对于虚拟文件系统，我们需要手动发现文件
    // 因为程序不会自动找到它们
    const allFilePaths = discoverFilesInVfs(vfs, tsConfig.baseDir);
    
    // 根据 tsconfig.json 配置过滤文件
    const filteredFiles = filterFilesByTsConfig(allFilePaths, tsConfig, vfs);
    
    return success(filteredFiles);
    
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error));
  }
}

/**
 * 解析 tsconfig.json 内容以提取文件列表配置
 */
export function parseTsConfigFileList(tsConfigContent: string, baseDir: string): TsConfigFileList {
  try {
    const config = JSON.parse(tsConfigContent);
    
    return {
      files: config.files,
      include: config.include,
      exclude: config.exclude,
      baseDir,
    };
  } catch (error) {
    // 如果解析失败，返回默认配置
    return {
      baseDir,
    };
  }
}

// 重新导出类型
export type { TsConfigFileList, FileListCalculatorOptions }; 