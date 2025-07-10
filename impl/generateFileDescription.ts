/**
 * Generate file description from content
 */
const generateFileDescription = (content: string): string => {
  // Extract first few lines for description
  const lines = content.split('\n').slice(0, 3);
  const preview = lines.join(' ').substring(0, 100);
  return preview + (preview.length === 100 ? '...' : '');
};

export default generateFileDescription; 