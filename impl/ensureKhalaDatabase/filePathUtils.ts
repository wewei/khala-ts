import { join } from "node:path";

/**
 * Generate source file path based on RIPEMD-160 hash
 * Path structure: {basePath}/source/{first2chars}/{rest}.ts
 * Example: /data/khala/source/a1/b2c3d4e5f6.ts (RIPEMD-160 hash: a1b2c3d4e5f6...)
 */
const getSourceFilePath = (basePath: string, hash: string): string => {
  const first2Chars = hash.substring(0, 2);  // RIPEMD-160 hash 前2位
  const rest = hash.substring(2);            // 剩余38位
  return join(basePath, 'source', first2Chars, `${rest}.ts`);
};

/**
 * Generate AST file path based on RIPEMD-160 hash
 * Path structure: {basePath}/ast/{first2chars}/{rest}.ast.json
 * Example: /data/khala/ast/a1/b2c3d4e5f6.ast.json (RIPEMD-160 hash: a1b2c3d4e5f6...)
 */
const getASTFilePath = (basePath: string, hash: string): string => {
  const first2Chars = hash.substring(0, 2);  // RIPEMD-160 hash 前2位
  const rest = hash.substring(2);            // 剩余38位
  return join(basePath, 'ast', first2Chars, `${rest}.ast.json`);
};

/**
 * Extract hash from source file path
 */
const getHashFromSourceFilePath = (filePath: string): string => {
  const fileName = filePath.split('/').pop() || '';
  const hashPart = fileName.replace('.ts', '');
  const dirName = filePath.split('/').slice(-2, -1)[0] || '';
  return dirName + hashPart;
};

/**
 * Extract hash from AST file path
 */
const getHashFromASTFilePath = (filePath: string): string => {
  const fileName = filePath.split('/').pop() || '';
  const hashPart = fileName.replace('.ast.json', '');
  const dirName = filePath.split('/').slice(-2, -1)[0] || '';
  return dirName + hashPart;
};

export {
  getSourceFilePath,
  getASTFilePath,
  getHashFromSourceFilePath,
  getHashFromASTFilePath
}; 