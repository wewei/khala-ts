import { describe, it, expect } from "bun:test";
import { filterFilesByTsConfig } from '../filterFiles';
import { createSystem } from '@typescript/vfs';
import type { TsConfigFileList } from '@d/parseTypeScriptProgram/calculateFileList';

describe('filterFilesByTsConfig', () => {
  const mockVfs = createSystem(new Map([]));

  it('should filter by explicit files list', () => {
    const allFiles = ['/src/main.ts', '/src/types.ts', '/src/utils.ts', '/test/test.ts'];
    const tsConfig: TsConfigFileList = {
      files: ['/src/main.ts', '/src/types.ts'],
      baseDir: '/'
    };

    const result = filterFilesByTsConfig(allFiles, tsConfig, mockVfs);
    
    expect(result).toContain('/src/main.ts');
    expect(result).toContain('/src/types.ts');
    expect(result).not.toContain('/src/utils.ts');
    expect(result).not.toContain('/test/test.ts');
    expect(result).toHaveLength(2);
  });

  it('should filter by include patterns', () => {
    const allFiles = ['/src/main.ts', '/src/types.ts', '/src/utils.ts', '/test/test.ts'];
    const tsConfig: TsConfigFileList = {
      include: ['src/**/*.ts'],
      baseDir: '/'
    };

    const result = filterFilesByTsConfig(allFiles, tsConfig, mockVfs);
    
    expect(result).toContain('/src/main.ts');
    expect(result).toContain('/src/types.ts');
    expect(result).toContain('/src/utils.ts');
    expect(result).not.toContain('/test/test.ts');
    expect(result).toHaveLength(3);
  });

  it('should filter by exclude patterns', () => {
    const allFiles = ['/src/main.ts', '/src/types.ts', '/src/main.test.ts', '/src/temp.ts'];
    const tsConfig: TsConfigFileList = {
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/temp.ts'],
      baseDir: '/'
    };

    const result = filterFilesByTsConfig(allFiles, tsConfig, mockVfs);
    
    expect(result).toContain('/src/main.ts');
    expect(result).toContain('/src/types.ts');
    expect(result).not.toContain('/src/main.test.ts');
    expect(result).not.toContain('/src/temp.ts');
    expect(result).toHaveLength(2);
  });

  it('should handle complex glob patterns', () => {
    const allFiles = [
      '/src/components/Button.tsx',
      '/src/components/Input.tsx',
      '/src/utils/helpers.ts',
      '/src/utils/constants.ts',
      '/src/pages/Home.tsx',
      '/src/pages/About.tsx',
      '/src/styles/global.css'
    ];
    const tsConfig: TsConfigFileList = {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/styles/**'],
      baseDir: '/'
    };

    const result = filterFilesByTsConfig(allFiles, tsConfig, mockVfs);
    
    expect(result).toContain('/src/components/Button.tsx');
    expect(result).toContain('/src/components/Input.tsx');
    expect(result).toContain('/src/utils/helpers.ts');
    expect(result).toContain('/src/utils/constants.ts');
    expect(result).toContain('/src/pages/Home.tsx');
    expect(result).toContain('/src/pages/About.tsx');
    expect(result).not.toContain('/src/styles/global.css');
    expect(result).toHaveLength(6);
  });

  it('should filter by file extensions', () => {
    const allFiles = ['/src/main.ts', '/src/types.ts', '/src/utils.js', '/docs/README.md'];
    const tsConfig: TsConfigFileList = {
      include: ['**/*'],
      baseDir: '/'
    };

    const result = filterFilesByTsConfig(allFiles, tsConfig, mockVfs);
    
    expect(result).toContain('/src/main.ts');
    expect(result).toContain('/src/types.ts');
    expect(result).toContain('/src/utils.js');
    expect(result).not.toContain('/docs/README.md');
    expect(result).toHaveLength(3);
  });

  it('should handle empty configuration', () => {
    const allFiles = ['/src/main.ts', '/src/types.ts'];
    const tsConfig: TsConfigFileList = {
      baseDir: '/'
    };

    const result = filterFilesByTsConfig(allFiles, tsConfig, mockVfs);
    
    expect(result).toContain('/src/main.ts');
    expect(result).toContain('/src/types.ts');
    expect(result).toHaveLength(2);
  });
}); 