import type { System } from "typescript";

export type TsConfigFileList = {
  /** Explicitly listed files */
  files?: string[];
  /** Include patterns */
  include?: string[];
  /** Exclude patterns */
  exclude?: string[];
  /** Base directory for resolving relative paths */
  baseDir: string;
};

export type FileListCalculatorOptions = {
  /** Virtual file system */
  vfs: System;
  /** tsconfig.json configuration */
  tsConfig: TsConfigFileList;
}; 