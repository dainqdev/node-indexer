import { deriveDynamicFieldID } from "@mysten/sui/utils";
import setupScanFlow from "./single_flow";
import { MemoryStorage, RedisStorage } from "./storage";
import { initTypes } from "./sui/types";
import { DlmmWorker } from "./workers";
import { inspect } from "util";

async function main() {
  await initTypes();

  const worker = new DlmmWorker();

  worker.on("pairs_changed", async (objects, tx) => {
    console.log("pairs_changed", objects, tx);
  });

  worker.on("positions_changed", async (objects, tx) => {
    console.log(
      "positions_changed",
      inspect(objects, { depth: null, colors: true }),
      tx
    );
  });

  setupScanFlow({
    concurency: 5,
    workers: [worker],
    inititalCheckpoint: 164929094,
    useLastCheckpoint: false,
  });

  // console.log(
  //   toBase58(new Uint8Array(Array.from({ length: 32 }, () => 99)))
  // );
}

require.main === module && main();
