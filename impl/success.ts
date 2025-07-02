import type { Success } from "@d/common/result";

/**
 * Create a Success result
 */
const success = <Value>(value: Value): Success<Value> => {
  return {
    success: true,
    value,
  };
};

export default success; 