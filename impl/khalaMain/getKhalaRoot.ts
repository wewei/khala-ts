import { join } from "node:path";
import { homedir } from "node:os";

const getKhalaRoot = (): string => {
  const khalaRoot = process.env.KHALA_ROOT;
  if (khalaRoot) {
    return khalaRoot;
  }
  
  return join(homedir(), ".khala");
};

export default getKhalaRoot; 