/**
 * Get documentation from JSDoc comments
 */
const getDocumentation = (node: any): string | undefined => {
  if (node.jsDoc && node.jsDoc.length > 0) {
    return node.jsDoc[0].comment;
  }
  return undefined;
};

export default getDocumentation; 