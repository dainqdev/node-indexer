import logger from "./lib/logger";
import { Checkpoint } from "./sui/checkpoint";
import { CheckpointData } from "./types/checkpoint";
import { sleep } from "./lib/retry";
import IndexerWorker from "./types/worker";
import DataProxy from "./lib/proxy";
import { suiClient } from "./lib/sui";
import { asyncForEach } from "./lib/js_core";
import { Storage, MemoryStorage } from "./storage";
import { checkUpdateTask, requireInitialed } from "./sui/types";

export type ScanSetupParams<T extends IndexerWorker> = {
  concurency: number;
  interval?: number;
  inititalCheckpoint?: number;
  workers: T[];
  storage?: Storage;
  useLastCheckpoint?: boolean;
};

interface ScanConfig {
  concurency: number;
  interval: number;
  workers: IndexerWorker[];
  storage: Storage;
}

export default async function setupScanFlow<T extends IndexerWorker>({
  concurency,
  interval = 100,
  workers,
  inititalCheckpoint,
  storage = new MemoryStorage(),
  useLastCheckpoint,
}: ScanSetupParams<T>) {
  await requireInitialed()
  checkUpdateTask()

  const config: ScanConfig = {
    concurency,
    interval,
    workers,
    storage,
  };

  let checkpoint_num = await getCheckpointSequence(
    storage,
    inititalCheckpoint,
    useLastCheckpoint
  );
  let last_checkpoint_num = checkpoint_num;
  let real_checkpoint_num = checkpoint_num;


  const _ = setInterval(() => {
    logger.info(
      "Scaned after 10s: %s",
      real_checkpoint_num - last_checkpoint_num
    );
    last_checkpoint_num = real_checkpoint_num;
  }, 10000);

  while (true) {
    await processCheckpoints(
      checkpoint_num,
      config,
      () => real_checkpoint_num++
    );
    //@ts-ignore
    if (typeof bun !== undefined) {
      logger.info(
        "Process checkpoint from %s to %s done",
        checkpoint_num,
        checkpoint_num + concurency
      );
    }
    checkpoint_num += concurency;
    await sleep(interval);
  }
}

async function processCheckpoints(
  checkpoint_num: number,
  config: ScanConfig,
  onDone?: () => void
) {
  const { concurency, interval, workers, storage } = config;
  const reader = readCheckpoints(checkpoint_num, concurency, interval / 10);
  for await (let data of reader) {
    {
      const checkpoint = DataProxy.from(data);
      data = free();
      await asyncForEach(workers, async (worker) => {
        await worker.processCheckpoint(checkpoint).catch((error) => {
          logger.error(
            error,
            "[Process worker %s failed with checkpoint %s]",
            worker.constructor.name,
            checkpoint_num
          );
        });
      });

      checkpoint.free();
      await updateLatestCheckpoint(storage, checkpoint_num);
      global.gc?.();
    }
    onDone?.();
  }
}

async function* readCheckpoints(
  checkpoint_num: number,
  concurency: number,
  interval = 100
) {
  const promises = readMultipleCheckpoints(concurency, checkpoint_num);
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

async function getCheckpointSequence(
  storage: Storage,
  inititalCheckpoint: number | undefined,
  useLastCheckpoint?: boolean
) {
  if (useLastCheckpoint) {
    const lastest = await getLatestCheckpoint(storage);
    const sequence_number = parseInt(`${lastest}`);
    if (!isNaN(sequence_number)) {
      return sequence_number;
    }
    logger.warn("Cannot find latest-checkpoint in storage")
  }

  if (!!inititalCheckpoint) {
    return inititalCheckpoint;
  }

  return Number(await suiClient.getLatestCheckpointSequenceNumber());
}

type ReadCheckpointsResponse = (Promise<{
  data: CheckpointData;
  index: number;
}> | null)[];

function readMultipleCheckpoints(
  concurency: number,
  checkpoint_num: number
): ReadCheckpointsResponse {
  return Array.from({ length: concurency }, async (_, i) => ({
    data: await Checkpoint.getCheckpoint(checkpoint_num + i),
    index: i,
  }));
}

function updateLatestCheckpoint(storage: Storage, checkpoint: number) {
  return storage.set("latest-checkpoint", checkpoint);
}

function getLatestCheckpoint(storage: Storage) {
  return storage.get("latest-checkpoint");
}

function free(): any {
  return null;
}
