import IndexerWorker, {
  WorkerCallback,
  WorkerListenerIdentifier,
  WorkerParsedObject,
  WorkerTransactionDetail,
} from "../types/worker";
import { Proxy } from "../lib/proxy";
import { asyncForEach, forEach } from "../lib/js_core";
import { CheckpointData } from "../types/checkpoint";
import { ObjectDetail, TransactionHelper } from "../structure/checkpoint_data";
import { isLBPairStruct, LbPairTokenStruct, StructTag } from "../generator";
import SuiObject, { ObjectChangeStatus } from "../structure/object";
import { LbPairToken, LbPostion } from "../types/dlmm";
import { isDynamicFields } from "../sui/native_bcs";
import { isPositionInfo, DynamicLBPositionInfo } from "../sui/dlmm/lb_position";
import logger from "../lib/logger";
import { freemem } from "os";

type WPO<T> = WorkerParsedObject<T>;
type TxDetail = WorkerTransactionDetail;
type Identifier = WorkerListenerIdentifier;
type ChangeStatus = ObjectChangeStatus;
export type PairChangeCallback = (
  pairs: WPO<LbPairToken>[],
  tx: TxDetail
) => Promise<void>;

class DlmmWorker extends IndexerWorker {
  async processCheckpoint(data: Proxy<CheckpointData>): Promise<void> {
    const confirmedAt = new Date(
      Number(data.checkpoint_summary.data.timestamp_ms)
    );

    await asyncForEach(data.transactions, async (transaction) => {
      const transactionDetail = TransactionHelper.detail(
        transaction,
        confirmedAt
      );

      const pairsChanged: WPO<LbPairToken>[] = [];
      const positionsChanged: WPO<LbPostion>[] = [];

      let processObject = (object: ObjectDetail, status: ChangeStatus) => {
        const structTag = SuiObject.structTag(object);

        if (SuiObject.isObject(object) && structTag) {
          if (isLBPairStruct(structTag)) {
            const pairData: LbPairToken = LbPairTokenStruct().parse(
              new Uint8Array(object.data.Move.contents)
            ).fields;
            pairsChanged.push(SuiObject.asParsed(object, pairData, status));
          }

          // if (isPositionInfo(structTag)) {
          //   const positionNodeData = DynamicLBPositionInfo().parse(
          //     new Uint8Array(object.data.Move.contents)
          //   );

          //   positionsChanged.push(
          //     SuiObject.asParsed(object, positionNodeData.value.fields, status)
          //   );
          // }
        }
      };

      forEach(TransactionHelper.createdObjects(transaction), (object) =>
        processObject(object, ObjectChangeStatus.CREATED)
      );

      forEach(TransactionHelper.changedObjects(transaction), (object) =>
        processObject(object, ObjectChangeStatus.MUTATED)
      );

      processObject = free()

      if (pairsChanged.length > 0) {
        await this.#call("pairs_changed", pairsChanged, transactionDetail);
      }

      if (positionsChanged.length > 0) {
        await this.#call("positions_changed", positionsChanged, transactionDetail);
      }
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

function free(): any {
  return null;
}


export default DlmmWorker;
