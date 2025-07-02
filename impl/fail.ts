import type { Fail } from "@d/common/result";

/**
 * Create a Fail result
 */
const fail = <Error = string>(error: Error): Fail<Error> => {
  return {
    success: false,
    error,
  };
};

export default fail; 