/**
 * Get type from variable declaration
 */
const getVariableType = (node: any): string | undefined => {
  if (node.type) {
    return node.type.getText();
  }
  return undefined;
};

export default getVariableType; 