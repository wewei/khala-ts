import type { InspectOptions, InspectSymbolsResult } from "@d/cli/inspect";

/**
 * Format and display the inspection results
 */
const formatOutput = (result: InspectSymbolsResult, options: InspectOptions): void => {
  const { format = "table", detailed = false } = options;
  
  switch (format) {
    case "json":
      formatJson(result, detailed);
      break;
    case "tree":
      formatTree(result, detailed);
      break;
    case "table":
    default:
      formatTable(result, detailed);
      break;
  }
};

/**
 * Format output as JSON
 */
const formatJson = (result: InspectSymbolsResult, detailed: boolean): void => {
  const output = detailed ? result : {
    symbols: result.symbols.map(symbol => ({
      name: symbol.name,
      kind: symbol.kind,
      filePath: symbol.filePath,
      line: symbol.line,
      exported: symbol.exported
    })),
    totalCount: result.totalCount,
    filesProcessed: result.filesProcessed,
    processingTime: result.processingTime
  };
  
  console.log(JSON.stringify(output, null, 2));
};

/**
 * Format output as a tree structure
 */
const formatTree = (result: InspectSymbolsResult, detailed: boolean): void => {
  console.log(`📁 Symbols found: ${result.totalCount} (${result.filesProcessed} files, ${result.processingTime}ms)\n`);
  
  // Group symbols by file
  const symbolsByFile = groupSymbolsByFile(result.symbols);
  
  for (const [filePath, symbols] of Object.entries(symbolsByFile)) {
    console.log(`📄 ${filePath} (${symbols.length} symbols)`);
    
    for (const symbol of symbols) {
      const exportIcon = symbol.exported ? "📤" : "📄";
      const defaultIcon = symbol.isDefaultExport ? "⭐" : "";
      const kindIcon = getKindIcon(symbol.kind);
      const lineInfo = detailed ? `:${symbol.line}:${symbol.column}` : `:${symbol.line}`;
      
      console.log(`  ${exportIcon}${defaultIcon} ${kindIcon} ${symbol.name}${lineInfo}`);
      
      if (detailed && symbol.documentation) {
        console.log(`    📝 ${symbol.documentation.substring(0, 60)}${symbol.documentation.length > 60 ? "..." : ""}`);
      }
      
      if (detailed && symbol.type) {
        console.log(`    🏷️  ${symbol.type}`);
      }
      
      if (detailed && symbol.modifiers && symbol.modifiers.length > 0) {
        console.log(`    🔧 ${symbol.modifiers.join(", ")}`);
      }
    }
    console.log("");
  }
};

/**
 * Format output as a table
 */
const formatTable = (result: InspectSymbolsResult, detailed: boolean): void => {
  console.log(`📊 Symbols found: ${result.totalCount} (${result.filesProcessed} files, ${result.processingTime}ms)\n`);
  
  if (result.symbols.length === 0) {
    console.log("No symbols found.");
    return;
  }
  
  // Create table headers
  const headers = ["Name", "Kind", "File", "Line", "Exported", "Default"];
  if (detailed) {
    headers.push("Type", "Modifiers");
  }
  
  // Calculate column widths
  const columnWidths = calculateColumnWidths(result.symbols, headers, detailed);
  
  // Print header
  printTableRow(headers, columnWidths);
  printTableSeparator(columnWidths);
  
  // Print rows
  for (const symbol of result.symbols) {
    const row = [
      symbol.name || "-",
      symbol.kind || "-",
      symbol.filePath || "-",
      (symbol.line || 0).toString(),
      symbol.exported ? "✓" : "✗",
      symbol.isDefaultExport ? "✓" : "✗"
    ];
    
    if (detailed) {
      row.push(symbol.type || "-", symbol.modifiers?.join(", ") || "-");
    }
    
    printTableRow(row, columnWidths);
  }
  
  console.log("");
};

/**
 * Group symbols by file path
 */
const groupSymbolsByFile = (symbols: any[]): Record<string, any[]> => {
  const grouped: Record<string, any[]> = {};
  
  for (const symbol of symbols) {
    if (!grouped[symbol.filePath]) {
      grouped[symbol.filePath] = [];
    }
    grouped[symbol.filePath]!.push(symbol);
  }
  
  return grouped;
};

/**
 * Get icon for symbol kind
 */
const getKindIcon = (kind: string): string => {
  switch (kind) {
    case "function": return "🔧";
    case "class": return "🏗️";
    case "interface": return "📋";
    case "type": return "🏷️";
    case "enum": return "📊";
    case "variable": return "📦";
    default: return "📄";
  }
};

/**
 * Calculate column widths for table formatting
 */
const calculateColumnWidths = (symbols: any[], headers: string[], detailed: boolean): number[] => {
  const widths = headers.map(header => header.length);
  
  for (const symbol of symbols) {
    const row = [
      symbol.name || "-",
      symbol.kind || "-",
      symbol.filePath || "-",
      (symbol.line || 0).toString(),
      symbol.exported ? "✓" : "✗",
      symbol.isDefaultExport ? "✓" : "✗"
    ];
    
    if (detailed) {
      row.push(symbol.type || "-", symbol.modifiers?.join(", ") || "-");
    }
    
    for (let i = 0; i < row.length && i < widths.length; i++) {
      widths[i] = Math.max(widths[i] || 0, (row[i] || "").length);
    }
  }
  
  return widths;
};

/**
 * Print a table row
 */
const printTableRow = (row: string[], widths: number[]): void => {
  const formattedRow = row.map((cell, i) => (cell || "-").padEnd(widths[i] || 0));
  console.log(`| ${formattedRow.join(" | ")} |`);
};

/**
 * Print table separator
 */
const printTableSeparator = (widths: number[]): void => {
  const separator = widths.map(width => "-".repeat(width));
  console.log(`| ${separator.join(" | ")} |`);
};

export default formatOutput; 