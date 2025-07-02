import type { Result, Success } from "@d/common/result";

/**
 * Type guard to check if a Result is a Success
 */
const isSuccess = <Value, Error = string>(result: Result<Value, Error>): result is Success<Value> => {
  return result.success === true;
};

export default isSuccess; 