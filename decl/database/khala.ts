export type KhalaDatabaseConfig = {
  folder: string;
  sourceFilesPath: string;
  astFilesPath: string;
  sqlitePath: string;
  semanticIndexPath: string;
};

export type DatabaseInitResult = {
  success: boolean;
  sourceFilesPath?: string;
  astFilesPath?: string;
  sqlitePath?: string;
  semanticIndexPath?: string;
  error?: string;
}; 