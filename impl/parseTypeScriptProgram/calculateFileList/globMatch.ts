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
  
  // 如果 pattern 以 / 开头，进行精确匹配
  if (normalizedPattern.startsWith('/')) {
    const regex = globToRegex(normalizedPattern);
    // 如果路径不以 / 开头，添加前导 /
    const pathToTest = normalizedPath.startsWith('/') ? normalizedPath : '/' + normalizedPath;
    return regex.test(pathToTest);
  }
  
  // 如果 pattern 不以 / 开头，但包含 /，匹配路径后缀
  // 例如: "src/**/*.ts" 应该匹配 "/project/src/main.ts"
  if (normalizedPattern.includes('/')) {
    const regex = globToRegex(normalizedPattern);
    
    // 检查路径的任何后缀是否匹配
    const pathSegments = normalizedPath.split('/');
    for (let i = 0; i < pathSegments.length; i++) {
      const suffix = pathSegments.slice(i).join('/');
      if (regex.test(suffix)) {
        return true;
      }
    }
    return false;
  }
  
  // 如果 pattern 不包含 /，只匹配没有目录分隔符的文件
  // 例如: "*.ts" 只匹配当前目录的文件，不匹配 "bar/foo.ts"
  if (normalizedPath.includes('/')) {
    return false;
  }
  
  const regex = globToRegex(normalizedPattern);
  return regex.test(normalizedPath);
} 