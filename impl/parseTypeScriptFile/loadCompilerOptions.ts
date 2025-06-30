import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { CompilerOptions } from "typescript";

const loadCompilerOptions = (tsConfigPath: string): CompilerOptions => {
  // Default compiler options
  const defaultOptions: CompilerOptions = {
    target: 4, // ES2020
    module: 99, // ESNext
    moduleResolution: 2, // NodeJs
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    skipLibCheck: true,
  };
  
  if (existsSync(tsConfigPath)) {
    try {
      const tsConfigContent = readFileSync(tsConfigPath, "utf-8");
      const ts = require("typescript");
      const tsConfig = ts.parseConfigFileTextToJson(tsConfigPath, tsConfigContent);
      
      if (tsConfig.config) {
        const parsedConfig = ts.parseJsonConfigFileContent(
          tsConfig.config,
          ts.sys,
          resolve(tsConfigPath, ".."),
          defaultOptions
        );
        return { ...defaultOptions, ...parsedConfig.options };
      }
    } catch (error) {
      console.warn(`Warning: Could not parse tsconfig.json at ${tsConfigPath}, using defaults`);
    }
  }
  
  return defaultOptions;
};

export default loadCompilerOptions; 