// globMatch.ts
// 负责 glob pattern 到正则的转换和匹配

import globToRegExp from 'glob-to-regexp';

/**
 * 将 glob pattern 转换为正则表达式
 * 使用 glob-to-regexp 包，支持 *, ?, **, {a,b} 语法
 */
export function globToRegex(pattern: string): RegExp {
  return globToRegExp(pattern, {
    extended: true, // 支持 {a,b} 语法
    globstar: true, // 支持 ** 语法
    flags: 'i' // 忽略大小写
  });
}

/**
 * 判断文件路径是否匹配 glob pattern
 */
export function globMatch(filePath: string, pattern: string): boolean {
  // 统一路径分隔符，但保留前导 /
  const normalizedPath = filePath.replace(/\\/g, '/');
  const normalizedPattern = pattern.replace(/\\/g, '/');
  const regex = globToRegex(normalizedPattern);
  return regex.test(normalizedPath);
} 