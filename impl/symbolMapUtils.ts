import { existsSync, readFileSync } from "node:fs";
import type { Symbol } from "@d/add/types";
import { generateSymbolKey } from "@i/hashUtils";

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
    if (existingKey && typeof existingKey === "string") {
      return { ...symbol, key: existingKey };
    }
    return symbol;
  });
};

/**
 * Generate a unique key for a symbol
 */
const generateSymbolKeyFromMap = (name: string, kind: string): string => {
  return generateSymbolKey(name, kind);
};

/**
 * Check if a symbol exists in the symbol map
 */
const symbolExistsInMap = (symbolMap: Record<string, string>, name: string, kind: string): boolean => {
  const key = `${name}:${kind}`;
  return key in symbolMap;
};

/**
 * Get symbol key from map or generate new one
 */
const getOrCreateSymbolKey = (symbolMap: Record<string, string>, name: string, kind: string): string => {
  const key = `${name}:${kind}`;
  
  if (key in symbolMap) {
    const existingKey = symbolMap[key];
    if (existingKey && typeof existingKey === "string") {
      return existingKey;
    }
  }
  
  const newKey = generateSymbolKey(name, kind);
  symbolMap[key] = newKey;
  return newKey;
};

export {
  loadSymbolMap,
  updateExistingSymbols,
  generateSymbolKeyFromMap,
  symbolExistsInMap,
  getOrCreateSymbolKey,
}; 