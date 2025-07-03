/**
 * Get return type from function declaration
 */
const getReturnType = (node: any): string | undefined => {
  if (node.type) {
    return node.type.getText();
  }
  return undefined;
};

export default getReturnType; 