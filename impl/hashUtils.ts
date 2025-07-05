import { createHash } from "node:crypto";

/**
 * Generate RIPEMD-160 hash from input string
 * Returns a 40-character hexadecimal string
 */
const generateRipemd160Hash = (input: string): string => {
  return createHash("ripemd160").update(input, "utf8").digest("hex");
};

/**
 * Generate file hash for source file storage
 * Uses only file content for deterministic hash
 */
const generateFileHash = (content: string): string => {
  return generateRipemd160Hash(content);
};

/**
 * Generate symbol key (40-digit hex)
 * Based on timestamp + random function as per design
 */
const generateSymbolKey = (name: string, kind: string): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString();
  const input = `${name}:${kind}:${timestamp}:${random}`;
  
  return generateRipemd160Hash(input);
};

export {
  generateRipemd160Hash,
  generateFileHash,
  generateSymbolKey,
}; 