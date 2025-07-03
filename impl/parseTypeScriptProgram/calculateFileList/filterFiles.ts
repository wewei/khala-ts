import type { System } from "typescript";
import type { TsConfigFileList } from "@d/parseTypeScriptProgram/calculateFileList";
import { globMatch } from "./globMatch";

/**
 * 根据 tsconfig.json 配置过滤文件列表
 */
export function filterFilesByTsConfig(
  allFiles: string[],
  tsConfig: TsConfigFileList,
  vfs: System
): string[] {
  const { files, include, exclude, baseDir } = tsConfig;
  
  let filteredFiles = allFiles;
  
  // 如果指定了明确的文件列表，只使用这些文件
  if (files && files.length > 0) {
    filteredFiles = files.filter(file => {
      const fullPath = resolvePath(file, baseDir);
      return allFiles.includes(fullPath);
    });
  }
  // 否则使用 include 模式
  else if (include && include.length > 0) {
    filteredFiles = allFiles.filter(file => {
      const matches = include.some(pattern => globMatch(file, pattern));
      return matches;
    });
  }
  
  // 应用 exclude 模式
  if (exclude && exclude.length > 0) {
    filteredFiles = filteredFiles.filter(file => {
      return !exclude.some(pattern => globMatch(file, pattern));
    });
  }
  
  // 过滤 TypeScript 文件扩展名
  filteredFiles = filteredFiles.filter(file => {
    return file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx');
  });
  
  return filteredFiles;
}

/**
 * 解析相对路径为绝对路径
 */
function resolvePath(path: string, baseDir: string): string {
  if (path.startsWith('/') || path.startsWith('\\')) {
    return path;
  }
  return `${baseDir}/${path}`.replace(/[\/\\]+/g, '/');
} 