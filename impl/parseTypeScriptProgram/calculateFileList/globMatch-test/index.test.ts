import { describe, it, expect } from "bun:test";
import { globToRegex, globMatch } from '../globMatch';

describe('globToRegex', () => {
  it('should match simple * patterns', () => {
    expect(globMatch('foo.ts', '*.ts')).toBe(true);
    expect(globMatch('foo.js', '*.ts')).toBe(false);
    expect(globMatch('bar/foo.ts', '*.ts')).toBe(false);
    expect(globMatch('bar/foo.ts', 'bar/*.ts')).toBe(true);
  });

  it('should match ? patterns', () => {
    expect(globMatch('a.ts', '?.ts')).toBe(true);
    expect(globMatch('ab.ts', '?.ts')).toBe(false);
    expect(globMatch('ab.ts', 'a?.ts')).toBe(true);
  });

  it('should match ** patterns', () => {
    expect(globMatch('src/foo.ts', 'src/**/*.ts')).toBe(true);
    expect(globMatch('src/bar/foo.ts', 'src/**/*.ts')).toBe(true);
    expect(globMatch('src/foo/bar/baz.ts', 'src/**/*.ts')).toBe(true);
    expect(globMatch('src/foo.ts', '**/*.ts')).toBe(true);
    expect(globMatch('foo.ts', '**/*.ts')).toBe(true);
  });

  it('should match {a,b} patterns', () => {
    expect(globMatch('foo.ts', '*.ts')).toBe(true);
    expect(globMatch('foo.ts', '*.{ts,js}')).toBe(true);
    expect(globMatch('foo.js', '*.{ts,js}')).toBe(true);
    expect(globMatch('foo.jsx', '*.{ts,js}')).toBe(false);
    expect(globMatch('src/foo.ts', 'src/*.{ts,js}')).toBe(true);
  });

  it('should match absolute and relative paths', () => {
    expect(globMatch('/src/foo.ts', 'src/**/*.ts')).toBe(true);
    expect(globMatch('src/foo.ts', 'src/**/*.ts')).toBe(true);
    expect(globMatch('foo.ts', '/foo.ts')).toBe(true);
  });

  it('should not match if pattern does not fit', () => {
    expect(globMatch('foo/bar.ts', 'baz/*.ts')).toBe(false);
    expect(globMatch('foo/bar.ts', 'foo/*.js')).toBe(false);
  });

  it('should match ** patterns with zero intermediate directories', () => {
    expect(globMatch('/foo/bar.ts', '/foo/**/bar.ts')).toBe(true);
    expect(globMatch('/foo/baz/bar.ts', '/foo/**/bar.ts')).toBe(true);
    expect(globMatch('/foo/baz/qux/bar.ts', '/foo/**/bar.ts')).toBe(true);
    expect(globMatch('foo/bar.ts', 'foo/**/bar.ts')).toBe(true);
    expect(globMatch('foo/baz/bar.ts', 'foo/**/bar.ts')).toBe(true);
  });
}); 