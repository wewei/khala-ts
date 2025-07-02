/**
 * Common Result type for handling success/failure scenarios
 */

type Result<Value, Error = string> = Success<Value> | Fail<Error>;

type Success<Value> = { 
  success: true; 
  value: Value; 
};

type Fail<Error> = { 
  success: false; 
  error: Error; 
};

export type { Result, Success, Fail }; 