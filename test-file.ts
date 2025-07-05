export function formatString(str: string): string {
  return str.trim().toLowerCase();
}

export const DEFAULT_CONFIG = {
  maxLength: 100,
  allowEmpty: false
};

export type Config = typeof DEFAULT_CONFIG; 