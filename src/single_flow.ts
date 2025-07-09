import { Worker } from "node:worker_threads";
import logger from "./lib/logger";
import { Checkpoint } from "./sui/checkpoint";
import { CheckpointData } from "./types/checkpoint";
import { sleep } from "./lib/retry";
import IndexerWorker from "./types/worker";
import DataProxy, { Proxy } from "./lib/proxy";
import { suiClient } from "./lib/sui";
import { asyncForEach } from "./lib/js_core";

export type ScanSetupParams<T extends IndexerWorker> = {
  concurency: number;
  interval?: number;
  inititalCheckpoint?: number;
  workers: T[];
};

export default async function setupScanFlow<T extends IndexerWorker>({
  concurency,
  interval = 100,
  workers,
  inititalCheckpoint,
}: ScanSetupParams<T>) {
  let checkpoint_num =
    inititalCheckpoint ??
    Number(await suiClient.getLatestCheckpointSequenceNumber());
  let last_checkpoint_num = checkpoint_num;
  let real_checkpoint_num = checkpoint_num;

  const minitor = setInterval(() => {
    logger.info(
      "scaned after 10s: %s",
      real_checkpoint_num - last_checkpoint_num
    );
    last_checkpoint_num = real_checkpoint_num;
  }, 10000);

  while (true) {
    await processCheckpoints(
      checkpoint_num,
      concurency,
      interval,
      workers,
      () => real_checkpoint_num++
    );

    checkpoint_num += concurency;
    await sleep(interval);
  }
}

async function processCheckpoints<T extends IndexerWorker>(
  checkpoint_num: number,
  concurency: number,
  interval = 100,
  workers: T[],
  onDone?: () => void
) {
  const reader = readCheckpoints(checkpoint_num, concurency, interval / 10);
  for await (let data of reader) {
    {
      const checkpoint = DataProxy.from(data);
      data = free(data);
      await asyncForEach(workers, async (worker) => {
        await worker.processCheckpoint(checkpoint)
      })
      checkpoint.free();
      gc?.();
    }
    onDone?.();
  }
}

async function* readCheckpoints(
  checkpoint_num: number,
  concurency: number,
  interval = 100
) {
  const promises: (Promise<{
    data: CheckpointData;
    index: number;
  }> | null)[] = Array.from({ length: concurency }, async (_, i) => ({
    data: await Checkpoint.getCheckpoint(checkpoint_num + i),
    index: i,
  }));
  let length = concurency;

  while (length > 0) {
    let { data, index } = await Promise.race(
      promises.filter((t) => t !== null)
    );
    promises[index] = null;
    length--;
    yield data;
    await sleep(interval);
  }
}

function free<T>(value: T) {
  return null as T;
}
