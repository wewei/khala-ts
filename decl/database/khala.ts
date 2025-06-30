export type KhalaDatabaseConfig = {
  folder: string;
  sqlitePath: string;
  semanticIndexPath: string;
};

export type DatabaseInitResult = {
  success: boolean;
  sqlitePath?: string;
  semanticIndexPath?: string;
  error?: string;
}; 