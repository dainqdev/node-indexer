import setupScanFlow from "./single_flow";
import { initTypes } from "./sui/types";
import IndexerWorker, {
  WorkerCallback,
  WorkerListenerIdentifier,
  WorkerParsedObject,
  WorkerTransactionDetail,
} from "./types/worker";
import { Proxy } from "./lib/proxy";
import { asyncForEach, forEach } from "./lib/js_core";
import { CheckpointData } from "./types/checkpoint";
import { TransactionHelper } from "./structure/checkpoint_data";
import { isLBPair, LbPairTokenStruct, StructTag } from "./generator";
import SuiObject, { ObjectChangeStatus } from "./structure/object";
import { LbPairToken } from "./types/dlmm";

type WPO<T> = WorkerParsedObject<T>;
type TxDetail = WorkerTransactionDetail;
type Identifier = WorkerListenerIdentifier;
type PairChangeCallback = (
  pairs: WPO<LbPairToken>[],
  tx: TxDetail
) => Promise<void>;

class DlmmWorker extends IndexerWorker {
  async processCheckpoint(data: Proxy<CheckpointData>): Promise<void> {
    const confirmedAt = new Date(
      Number(data.checkpoint_summary.data.timestamp_ms)
    );

    await asyncForEach(data.transactions, async (transaction) => {
      const createdObjects = TransactionHelper.createdObjects(transaction);
      const pairsChanged: WPO<LbPairToken>[] = [];

      forEach(createdObjects, (object) => {
        if (
          SuiObject.isObject(object) &&
          object.data.Move.type_.$kind === "Other"
        ) {
          if (isLBPair(SuiObject.structTag(object.data.Move.type_.Other))) {
            const pairData: LbPairToken = LbPairTokenStruct().parse(
              new Uint8Array(object.data.Move.contents)
            );
            pairsChanged.push(
              SuiObject.asParsed(object, pairData, ObjectChangeStatus.CREATED)
            );
          }
        }
      });

      await this.#call(
        "pairs_changed",
        pairsChanged,
        TransactionHelper.detail(transaction, confirmedAt)
      );
    });
  }

  on(eventName: Identifier, callback: PairChangeCallback): void;
  on(eventName: any, callback: WorkerCallback) {
    this.listenter[eventName as Identifier] = callback;
  }

  #call<T>(eventName: Identifier, objects: WPO<T>[], tx: TxDetail) {
    return this._call(eventName, objects, tx);
  }
}

async function main() {
  await initTypes();

  const worker = new DlmmWorker();

  worker.on("pairs_changed", async (objects, tx) => {
    console.log("pairs_changed", objects, tx);
  });

  setupScanFlow({
    concurency: 10,
    workers: [worker],
    inititalCheckpoint: 164_327_784,
  });
  // console.log(
  //   toBase58(new Uint8Array(Array.from({ length: 32 }, () => 99)))
  // );
}

main();
