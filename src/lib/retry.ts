// retry.ts - Simple retry library with timeout support

export class RetryError extends Error {
  public readonly lastError: Error;
  public readonly attempts: number;

  constructor(message: string, lastError: Error, attempts: number) {
    super(message);
    this.name = 'RetryError';
    this.lastError = lastError;
    this.attempts = attempts;
    Object.setPrototypeOf(this, RetryError.prototype);
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Sleep for specified milliseconds
 */
export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute function with timeout
 */
export const withTimeout = async <T>(
  fn: () => Promise<T>,
  timeout: number
): Promise<T> => {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) => 
      setTimeout(
        () => reject(new TimeoutError(`Operation timed out after ${timeout}ms`)),
        timeout
      )
    )
  ]);
};

/**
 * Retry configuration options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay between retries in ms (default: 1000) */
  delay?: number;
  /** Maximum delay between retries in ms (default: 30000) */
  maxDelay?: number;
  /** Exponential backoff factor (default: 2) */
  factor?: number;
  /** Add randomization to delays (default: false) */
  randomize?: boolean;
  /** Timeout for each attempt in ms (default: 60000) */
  timeout?: number;
  /** Callback function called on each retry */
  onRetry?: (error: Error, attempt: number, delay: number) => void;
  /** Function to determine if should retry based on error */
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

/**
 * Function that can be retried
 */
export type RetryableFunction<T> = (attempt: number) => Promise<T>;

/**
 * Default retry options
 */
const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 100,
  delay: 1000,
  maxDelay: 30000,
  factor: 2,
  randomize: false,
  timeout: 60000, // 60 seconds
  onRetry: () => {},
  shouldRetry: () => true
};

/**
 * Calculate delay for next retry with exponential backoff
 */
const calculateDelay = (attempt: number, options: Required<RetryOptions>): number => {
  let delay = Math.min(
    options.delay * Math.pow(options.factor, attempt - 1),
    options.maxDelay
  );
  
  if (options.randomize) {
    const randomization = delay * 0.5;
    delay = delay + (Math.random() * randomization * 2 - randomization);
  }
  
  return Math.round(delay);
};

/**
 * Retry a function with configurable options
 */
export async function retry<T>(
  fn: RetryableFunction<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config: Required<RetryOptions> = { ...defaultOptions, ...options };
  let lastError: Error;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      // Execute function with timeout
      const result = await withTimeout(
        () => fn(attempt),
        config.timeout
      );
      return result;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on timeout errors
      if (error instanceof TimeoutError) {
        throw error;
      }
      
      // Check if should retry
      if (!config.shouldRetry(lastError, attempt)) {
        throw lastError;
      }
      
      // Don't retry if this was the last attempt
      if (attempt === config.maxAttempts) {
        throw new RetryError(
          `Failed after ${config.maxAttempts} attempts`,
          lastError,
          config.maxAttempts
        );
      }
      
      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, config);
      
      // Call onRetry callback if provided
      if (config.onRetry) {
        config.onRetry(lastError, attempt, delay);
      }
      
      // Wait before next attempt
      await sleep(delay);
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw new Error('Unexpected retry loop exit');
}

/**
 * Create a retry wrapper with preset options
 */
export function createRetry(defaultOptions: RetryOptions = {}) {
  return <T>(
    fn: RetryableFunction<T>,
    overrideOptions: RetryOptions = {}
  ): Promise<T> => {
    return retry(fn, { ...defaultOptions, ...overrideOptions });
  };
}

/**
 * Decorator for retrying class methods
 */
export function Retry(options: RetryOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      return retry(
        async (attempt) => {
          return originalMethod.apply(this, args);
        },
        options
      );
    };
    
    return descriptor;
  };
}

// Type guards
export const isRetryError = (error: unknown): error is RetryError => {
  return error instanceof RetryError;
};

export const isTimeoutError = (error: unknown): error is TimeoutError => {
  return error instanceof TimeoutError;
};