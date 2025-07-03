import { describe, it, expect } from "bun:test";
import { discoverFilesInVfs } from '../discoverFiles';
import { createSystem } from '@typescript/vfs';

describe('discoverFilesInVfs', () => {
  it('should discover TypeScript files in flat structure', () => {
    const vfs = createSystem(new Map([
      ["/src/main.ts", "export function main() {}"],
      ["/src/types.ts", "export type User = { name: string };"],
      ["/src/utils.ts", "export function helper() {}"],
      ["/docs/README.md", "# Documentation"],
    ]));

    const files = discoverFilesInVfs(vfs, "/");
    
    expect(files).toContain("/src/main.ts");
    expect(files).toContain("/src/types.ts");
    expect(files).toContain("/src/utils.ts");
    expect(files).not.toContain("/docs/README.md");
    expect(files).toHaveLength(3);
  });

  it('should discover TypeScript files in nested structure', () => {
    const vfs = createSystem(new Map([
      ["/src/components/Button.tsx", "export function Button() {}"],
      ["/src/components/Input.tsx", "export function Input() {}"],
      ["/src/utils/helpers.ts", "export function helper() {}"],
      ["/src/pages/Home.tsx", "export function Home() {}"],
      ["/src/styles/global.css", "body { margin: 0; }"],
    ]));

    const files = discoverFilesInVfs(vfs, "/");
    
    expect(files).toContain("/src/components/Button.tsx");
    expect(files).toContain("/src/components/Input.tsx");
    expect(files).toContain("/src/utils/helpers.ts");
    expect(files).toContain("/src/pages/Home.tsx");
    expect(files).not.toContain("/src/styles/global.css");
    expect(files).toHaveLength(4);
  });

  it('should handle empty directory', () => {
    const vfs = createSystem(new Map([]));
    
    const files = discoverFilesInVfs(vfs, "/");
    
    expect(files).toHaveLength(0);
  });

  it('should handle non-existent base directory', () => {
    const vfs = createSystem(new Map([
      ["/src/main.ts", "export function main() {}"],
    ]));
    
    const files = discoverFilesInVfs(vfs, "/nonexistent");
    
    expect(files).toHaveLength(0);
  });
}); 