// retry.ts - Minimal retry library

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly lastError: Error,
    public readonly attempts: number
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  maxDelay?: number;
  factor?: number;
  randomize?: boolean;
  onRetry?: (error: Error, attempt: number, delay: number) => void;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const calculateDelay = (attempt: number, options: Required<RetryOptions>): number => {
  let delay = Math.min(
    options.delay * Math.pow(options.factor, attempt - 1),
    options.maxDelay
  );
  
  if (options.randomize) {
    delay += (Math.random() - 0.5) * delay;
  }
  
  return Math.round(delay);
};

export async function retry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = {
    maxAttempts: 3,
    delay: 1000,
    maxDelay: 30000,
    factor: 2,
    randomize: false,
    onRetry: () => {},
    shouldRetry: () => true,
    ...options
  };
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error as Error;
      
      if (!config.shouldRetry(lastError, attempt) || attempt === config.maxAttempts) {
        throw new RetryError(
          `Failed after ${attempt} attempts`,
          lastError,
          attempt
        );
      }
      
      const delay = calculateDelay(attempt, config);
      config.onRetry(lastError, attempt, delay);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

export function Retry(options: RetryOptions = {}) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      return retry(
        async (_) => {
          return originalMethod.apply(this, args);
        },
        options
      );
    };
    
    return descriptor;
  };
}
