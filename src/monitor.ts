export class MemoryMonitor {
  baseline: NodeJS.MemoryUsage;
  history: {
    timestamp: number;
    memory: NodeJS.MemoryUsage;
    diff: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
  }[];

  constructor() {
    this.baseline = process.memoryUsage();
    this.history = [];
  }

  check() {
    const current = process.memoryUsage();
    const diff = {
      rss: current.rss - this.baseline.rss,
      heapTotal: current.heapTotal - this.baseline.heapTotal,
      heapUsed: current.heapUsed - this.baseline.heapUsed,
      external: current.external - this.baseline.external,
    };

    this.history.push({
      timestamp: Date.now(),
      memory: current,
      diff: diff,
    });

    // Giữ lại 100 lần đo gần nhất
    if (this.history.length > 100) {
      this.history.shift();
    }

    // Cảnh báo nếu heap used tăng liên tục
    if (this.isMemoryLeaking()) {
      console.warn("⚠️ Possible memory leak detected!");
    }

    return current;
  }

  isMemoryLeaking() {
    if (this.history.length < 10) return false;

    // Kiểm tra 10 lần đo gần nhất
    const recent = this.history.slice(-10);
    let increasingCount = 0;

    for (let i = 1; i < recent.length; i++) {
      if (recent[i].memory.heapUsed > recent[i - 1].memory.heapUsed) {
        increasingCount++;
      }
    }

    return increasingCount >= 8; // 80% tăng liên tục
  }
}

const monitor = new MemoryMonitor();
setInterval(() => {
  monitor.check();
}, 10000);
