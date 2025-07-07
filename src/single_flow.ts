import { Worker } from "node:worker_threads";
import logger from "./lib/logger";
import { pipeStreamGenerator } from "./lib/pipe";
import { Checkpoint } from "./sui/checkpoint";
import { CheckpointData } from "./types/sui";
import { sleep } from "./lib/retry";

export default async function setup_single_flow(concurency: number, interval = 100) {
  let checkpoint_num = 163392923;
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
    await processCheckpoints(checkpoint_num, concurency, interval, async (data) => {
      logger.info("checkpoint: %s", data.checkpoint_summary.data.sequence_number)
      real_checkpoint_num++
    });

    checkpoint_num += concurency;
    await sleep(interval)
  }
}

async function processCheckpoints(
  checkpoint_num: number,
  concurency: number, interval = 100,
  callback: (data: CheckpointData) => Promise<void>
) {
  const reader = readCheckpoints(checkpoint_num, concurency, interval / 10);
  for await (const data of reader) {
    callback(data);
  }
}

async function* readCheckpoints(checkpoint_num: number, concurency: number, interval = 100) {
  const promises: (Promise<{
    data: CheckpointData;
    index: number;
  }> | null)[] = Array.from({ length: concurency }, async (_, i) => ({
    data: await Checkpoint.getCheckpoint(checkpoint_num + i),
    index: i,
  }));
  let length = concurency;

  while (length > 0) {
    let { data, index } = await Promise.race(promises.filter(t => t !== null));
    promises[index] = null
    length--;
    yield data;
    await sleep(interval)
  }
}