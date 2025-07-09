import { Storage } from "./base_storage";

export class MemoryStorage extends Storage {
  private store: Map<string, { value: any; expireAt?: number }>;

  constructor() {
    super();
    this.store = new Map();
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (item.expireAt && item.expireAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const item: { value: any; expireAt?: number } = { value };
    
    if (ttl && ttl > 0) {
      item.expireAt = Date.now() + ttl * 1000;
    }

    this.store.set(key, item);
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async keys(): Promise<string[]> {
    // Clean up expired keys first
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (item.expireAt && item.expireAt < now) {
        this.store.delete(key);
      }
    }
    
    return Array.from(this.store.keys());
  }

  // Additional method for memory storage
  size(): number {
    return this.store.size;
  }
}