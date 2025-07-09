import { Proxy } from "../lib/proxy";
import { ObjectChangeStatus } from "../structure/object";
import { CheckpointData, ExecutionStatus } from "./checkpoint";

type RecordPartial<K extends keyof any, T> = {
  [P in K]?: T;
};

export type WorkerListenerIdentifier = "pairs_changed";

export interface WorkerParsedObject<T> {
  id: string;
  version: string;
  contents: T;
  status: ObjectChangeStatus;
}

export interface WorkerTransactionDetail {
  digest: string;
  status: ExecutionStatus;
  confirmedAt: Date;
}

export type WorkerCallback = (
  object: WorkerParsedObject<any>[],
  tx: WorkerTransactionDetail
) => Promise<void>;

export default abstract class IndexerWorker {
  protected listenter: RecordPartial<WorkerListenerIdentifier, WorkerCallback> =
    {};

  protected _on<T>(
    eventName: WorkerListenerIdentifier,
    callback: (object: WorkerParsedObject<T>[]) => Promise<void>
  ) {
    this.listenter[eventName] = callback;
  }

  protected _call<T>(
    eventName: WorkerListenerIdentifier,
    objects: WorkerParsedObject<T>[],
    tx: WorkerTransactionDetail
  ) {
    return this.listenter[eventName]?.(objects, tx);
  }

  abstract processCheckpoint(data: Proxy<CheckpointData>): Promise<void>;
}
