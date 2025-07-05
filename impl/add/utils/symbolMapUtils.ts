import { existsSync, readFileSync } from "node:fs";
import type { Symbol } from "@d/add/types";

/**
 * Load symbol map from file
 */
const loadSymbolMap = (mapFilePath?: string): Record<string, string> => {
  if (!mapFilePath) return {};
  
  if (!existsSync(mapFilePath)) {
    throw new Error(`Symbol map file not found: ${mapFilePath}`);
  }
  
  const content = readFileSync(mapFilePath, 'utf-8');
  return JSON.parse(content);
};

/**
 * Update existing symbols with symbol map
 */
const updateExistingSymbols = (
  symbols: Symbol[], 
  symbolMap: Record<string, string>
): Symbol[] => {
  return symbols.map(symbol => {
    const existingKey = symbolMap[symbol.name];
    if (existingKey) {
      return { ...symbol, key: existingKey };
    }
    return symbol;
  });
};

export {
  loadSymbolMap,
  updateExistingSymbols
}; 