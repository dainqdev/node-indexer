/**
 * Promise Pipe Stream với Concurrency Control
 * Xử lý danh sách promise với giới hạn số lượng promise chạy đồng thời
 */

interface PipeStreamOptions {
  concurrency: number;
}

class PromisePipeStream<T> {
  private concurrency: number;
  private running: number = 0;
  private queue: (() => Promise<T>)[] = [];
  private results: T[] = [];
  private errors: Error[] = [];

  constructor(options: PipeStreamOptions) {
    this.concurrency = options.concurrency;
  }

  /**
   * Xử lý danh sách promise với concurrency control
   */
  async process(promises: (() => Promise<T>)[]): Promise<T[]> {
    this.queue = [...promises];
    this.results = [];
    this.errors = [];

    // Khởi động các promise ban đầu theo concurrency limit
    const initialPromises = [];
    for (let i = 0; i < Math.min(this.concurrency, this.queue.length); i++) {
      initialPromises.push(this.runNext());
    }

    // Đợi tất cả promise hoàn thành
    await Promise.all(initialPromises);

    if (this.errors.length > 0) {
      throw new Error(`${this.errors.length} promises failed`);
    }

    return this.results;
  }

  /**
   * Chạy promise tiếp theo trong queue
   */
  private async runNext(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    const promiseFn = this.queue.shift()!;
    this.running++;

    try {
      const result = await promiseFn();
      this.results.push(result);
    } catch (error) {
      this.errors.push(error as Error);
    } finally {
      this.running--;
      // Khi một promise hoàn thành, chạy promise tiếp theo
      if (this.queue.length > 0) {
        await this.runNext();
      }
    }
  }
}

/**
 * Helper function để tạo pipe stream
 */
export function createPipeStream<T>(
  promises: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const stream = new PromisePipeStream<T>({ concurrency });
  return stream.process(promises);
}

/**
 * Alternative implementation sử dụng async generator
 */
export async function* pipeStreamGenerator<T>(
  promises: (() => Promise<T>)[],
  concurrency: number
): AsyncGenerator<T, void, unknown> {
  const executing = new Map<number, Promise<{ index: number; result: T }>>();
  let currentIndex = 0;
  
  // Helper function để xử lý promise và cleanup
  const handlePromise = async (index: number) => {
    const result = await promises[index]();
    return { index, result };
  };

  // Khởi tạo các promise ban đầu
  while (currentIndex < promises.length && executing.size < concurrency) {
    const promiseIndex = currentIndex++;
    executing.set(promiseIndex, handlePromise(promiseIndex));
  }

  // Xử lý cho đến khi hết promise
  while (executing.size > 0) {
    // Race để lấy promise hoàn thành sớm nhất
    const completed = await Promise.race(executing.values());
    
    // Xóa promise đã hoàn thành
    executing.delete(completed.index);
    
    // Yield kết quả
    yield completed.result;
    
    // Nếu còn promise trong queue, thêm vào executing
    if (currentIndex < promises.length) {
      const promiseIndex = currentIndex++;
      executing.set(promiseIndex, handlePromise(promiseIndex));
    }
  }
}

/**
 * Cách implementation khác sử dụng callback style
 */
export function pipeStream<T>(
  promises: (() => Promise<T>)[],
  concurrency: number,
  onResult?: (result: T, index: number) => void,
  onError?: (error: Error, index: number) => void
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = new Array(promises.length);
    const errors: Error[] = [];
    let completed = 0;
    let currentIndex = 0;
    const executing = new Set<Promise<void>>();

    const runNext = async () => {
      if (currentIndex >= promises.length) {
        return;
      }

      const index = currentIndex++;
      
      const promise = promises[index]()
        .then(result => {
          results[index] = result;
          if (onResult) onResult(result, index);
        })
        .catch(error => {
          errors.push(error);
          if (onError) onError(error, index);
        })
        .finally(() => {
          completed++;
          executing.delete(promise);
          
          if (completed === promises.length) {
            if (errors.length > 0) {
              reject(new Error(`${errors.length} promises failed`));
            } else {
              resolve(results);
            }
          } else if (currentIndex < promises.length) {
            runNext();
          }
        });

      executing.add(promise);
    };

    // Khởi động các promise ban đầu
    const initialCount = Math.min(concurrency, promises.length);
    for (let i = 0; i < initialCount; i++) {
      runNext();
    }
  });
}

/**
 * Ví dụ sử dụng
 */
async function example() {
  // Tạo danh sách các promise functions
  const promiseFunctions = Array.from({ length: 10 }, (_, i) => {
    return () => new Promise<number>((resolve) => {
      console.log(`Starting promise ${i}`);
      setTimeout(() => {
        console.log(`Completed promise ${i}`);
        resolve(i);
      }, Math.random() * 2000);
    });
  });

  // Cách 1: Sử dụng class
  console.log('=== Using PromisePipeStream class ===');
  const results1 = await createPipeStream(promiseFunctions, 3);
  console.log('Results:', results1);

  // Cách 2: Sử dụng generator
  console.log('\n=== Using async generator ===');
  const results2: number[] = [];
  for await (const result of pipeStreamGenerator(promiseFunctions, 3)) {
    console.log('Received result:', result);
    results2.push(result);
  }
  console.log('All results:', results2);
}

/**
 * Utility function với error handling chi tiết
 */
export async function processBatch<T>(
  items: T[],
  processor: (item: T) => Promise<any>,
  concurrency: number,
  onError?: (error: Error, item: T) => void
): Promise<{ successful: any[]; failed: { item: T; error: Error }[] }> {
  const successful: any[] = [];
  const failed: { item: T; error: Error }[] = [];

  const promiseFunctions = items.map((item) => {
    return async () => {
      try {
        const result = await processor(item);
        successful.push(result);
        return result;
      } catch (error) {
        const err = error as Error;
        failed.push({ item, error: err });
        if (onError) {
          onError(err, item);
        }
        throw err;
      }
    };
  });

  try {
    await createPipeStream(promiseFunctions, concurrency);
  } catch {
    // Errors are already handled individually
  }

  return { successful, failed };
}

// Run example
// example().catch(console.error);