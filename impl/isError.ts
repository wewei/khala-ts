import type { Result, Fail } from "@d/common/result";

/**
 * Type guard to check if a Result is a Fail
 */
const isError = <Value, Error = string>(result: Result<Value, Error>): result is Fail<Error> => {
  return result.success === false;
};

export default isError; 