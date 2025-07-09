import { createClientPool, RedisClientPoolType, RedisClientType } from "redis";
import { Storage } from "./base_storage";

export class RedisStorage extends Storage {
  private client: RedisClientPoolType;
  private prefix: string;
  private isConnected: boolean = false;

  constructor(options?: {
    url?: string;
    prefix?: string;
    host?: string;
    port?: number;
    password?: string;
  }) {
    super();
    this.prefix = options?.prefix || '';
    
    this.client = createClientPool({
      url: options?.url,
      socket: {
        host: options?.host || 'localhost',
        port: options?.port || 6379
      },
      password: options?.password
    });

    // Handle errors
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.close();
      this.isConnected = false;
    }
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  async get<T>(key: string): Promise<T | null> {
    await this.connect();
    const fullKey = this.getKey(key);
    const value = await this.client.get(fullKey);
    
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      // If not JSON, return as string
      return value as T;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.connect();
    const fullKey = this.getKey(key);
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (ttl && ttl > 0) {
      await this.client.setEx(fullKey, ttl, serialized);
    } else {
      await this.client.set(fullKey, serialized);
    }
  }

  async delete(key: string): Promise<boolean> {
    await this.connect();
    const fullKey = this.getKey(key);
    const result = await this.client.del(fullKey);
    return result > 0;
  }

  async has(key: string): Promise<boolean> {
    await this.connect();
    const fullKey = this.getKey(key);
    const exists = await this.client.exists(fullKey);
    return exists > 0;
  }

  async clear(): Promise<void> {
    await this.connect();
    
    if (this.prefix) {
      // Clear only keys with prefix
      const keys = await this.client.keys(`${this.prefix}:*`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } else {
      // Clear all keys (use with caution!)
      await this.client.flushDb();
    }
  }

  async keys(): Promise<string[]> {
    await this.connect();
    const pattern = this.prefix ? `${this.prefix}:*` : '*';
    const keys = await this.client.keys(pattern);
    
    if (this.prefix) {
      // Remove prefix from keys
      const prefixLength = this.prefix.length + 1;
      return keys.map(key => key.substring(prefixLength));
    }
    
    return keys;
  }

  // Additional Redis-specific methods
  async ttl(key: string): Promise<number> {
    await this.connect();
    const fullKey = this.getKey(key);
    return await this.client.ttl(fullKey);
  }

  async expire(key: string, seconds: number): Promise<number> {
    await this.connect();
    const fullKey = this.getKey(key);
    return await this.client.expire(fullKey, seconds);
  }
}
