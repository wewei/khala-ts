export type KhalaDatabaseConfig = {
  folder: string;
  filesPath: string;
  sqlitePath: string;
  semanticIndexPath: string;
};

export type DatabaseInitResult = {
  success: boolean;
  filesPath?: string;
  sqlitePath?: string;
  semanticIndexPath?: string;
  error?: string;
}; 