import setupScanFlow from "./single_flow";
import { RedisStorage } from "./storage";
import { initTypes } from "./sui/types";
import { DlmmWorker } from "./workers";

async function main() {
  await initTypes();

  const worker = new DlmmWorker();

  worker.on("pairs_changed", async (objects, tx) => {
    console.log("pairs_changed", objects, tx);
  });

  setupScanFlow({
    concurency: 5,
    workers: [worker],
    storage: new RedisStorage(),
    useLastCheckpoint: false
  });

  // console.log(
  //   toBase58(new Uint8Array(Array.from({ length: 32 }, () => 99)))
  // );
}

require.main === module && main();