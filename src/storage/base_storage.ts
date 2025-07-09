export abstract class Storage {
  abstract get<T>(key: string): Promise<T | null>;
  abstract set<T>(key: string, value: T, ttl?: number): Promise<void>;
  abstract delete(key: string): Promise<boolean>;
  abstract has(key: string): Promise<boolean>;
  abstract clear(): Promise<void>;
  abstract keys(): Promise<string[]>;
}