import { toBase58 } from "@mysten/sui/utils";
import { map } from "../lib/js_core";
import {
  CheckpointTransaction,
  type Object,
  ObjectDigest,
  ObjectID,
  SequenceNumber,
  TransactionEffects,
  TransactionEffectsV1,
  TransactionEffectsV2,
} from "../types/checkpoint";
import SuiObject from "./object";
import { WorkerTransactionDetail } from "../types/worker";

export type ObjectRef = [ObjectID, SequenceNumber, ObjectDigest];

const OBJECT_DIGEST_DELETED = toBase58(
  new Uint8Array(Array.from({ length: 32 }, () => 99))
);
const OBJECT_DIGEST_WRAPPED = toBase58(
  new Uint8Array(Array.from({ length: 32 }, () => 88))
);

enum ObjectRemoveKind {
  Delete = "Delete",
  Wrap = "Wrap",
}

export type ObjectDetail = Object & { id: string; version: string };

export class TransactionHelper {
  static detail(
    transaction: CheckpointTransaction,
    confirmedAt: Date
  ): WorkerTransactionDetail {
    return {
      digest: this.digest(transaction.effects),
      status: this.status(transaction.effects),
      confirmedAt,
    };
  }

  static removedObjects(transaction: CheckpointTransaction) {
    const removedObjectRefs = this.allRemovedObjectRefs(transaction);
    const inputObjects = map(transaction.input_objects, (object) => ({
      ...object,
      id: SuiObject.id(object),
      version: SuiObject.version(object),
    })) as ObjectDetail[];

    const objectInputMap = arrayToMap(inputObjects, ["id"]);
    return map(removedObjectRefs, ([[objectId], _]) => {
      const object = objectInputMap[objectId];
      if (object) {
        return object;
      } else {
        throw new Error("all removed objects should show up in input objects");
      }
    });
  }

  static createdObjects(transaction: CheckpointTransaction) {
    const createdObjectRefs = this.created(transaction.effects);
    const outputObjects = map(transaction.output_objects, (object) => {
      const id = SuiObject.id(object);
      const version = SuiObject.version(object);

      return {
        ...object,
        id,
        version,
      };
    }) as ObjectDetail[];

    const objectOutputMap = arrayToMap(outputObjects, ["id", "version"]);

    return map(createdObjectRefs, ([objectId, version]) => {
      const object = objectOutputMap[`${objectId}_${version}`];
      if (object) {
        return object;
      } else {
        throw new Error(
          `created object ${objectId} should show up in output objects in tx ${this.digest(transaction.effects)}`
        );
      }
    });
  }
  
  static changedObjects(transaction: CheckpointTransaction) {
    const createdObjectRefs = this.mutated(transaction.effects);
    const outputObjects = map(transaction.output_objects, (object) => {
      const id = SuiObject.id(object);
      const version = SuiObject.version(object);

      return {
        ...object,
        id,
        version,
      };
    }) as ObjectDetail[];

    const objectOutputMap = arrayToMap(outputObjects, ["id"]);

    return map(createdObjectRefs, ([objectId]) => {
      const object = objectOutputMap[objectId];
      if (object) {
        return object;
      } else {
        throw new Error(
          `changed object ${objectId} should show up in output objects in tx ${this.digest(transaction.effects)}`
        );
      }
    });
  }

  private static allRemovedObjectRefs(transaction: CheckpointTransaction) {
    return map(
      this.deleted(transaction.effects),
      (e) => [e, ObjectRemoveKind.Delete] as [ObjectRef, ObjectRemoveKind]
    ).concat(
      map(
        this.wrapped(transaction.effects),
        (e) => [e, ObjectRemoveKind.Wrap] as [ObjectRef, ObjectRemoveKind]
      )
    );
  }

  static status(effects: TransactionEffects) {
    if (effects.$kind === "V1") {
      return effects.V1.status;
    }

    return effects.V2.status;
  }

  static digest(effects: TransactionEffects) {
    if (effects.$kind === "V1") {
      return effects.V1.transaction_digest;
    }

    return effects.V2.transaction_digest;
  }

  private static created(effects: TransactionEffects) {
    if (effects.$kind === "V1") {
      return this.createdV1(effects.V1);
    } else {
      return this.createdV2(effects.V2);
    }
  }  
  
  private static mutated(effects: TransactionEffects) {
    if (effects.$kind === "V1") {
      return this.mutatedV1(effects.V1);
    } else {
      return this.mutatedV2(effects.V2);
    }
  }

  private static deleted(effects: TransactionEffects) {
    if (effects.$kind === "V1") {
      return this.deletedV1(effects.V1);
    } else {
      return this.deletedV2(effects.V2);
    }
  }

  private static wrapped(effects: TransactionEffects) {
    if (effects.$kind === "V1") {
      return this.wrappedV1(effects.V1);
    } else {
      return this.wrappedV2(effects.V2);
    }
  }

  private static createdV1(effects: TransactionEffectsV1): ObjectRef[] {
    return effects.created.map((v) => v[0]);
  }
  
  private static mutatedV1(effects: TransactionEffectsV1): ObjectRef[] {
    return effects.created.map((v) => v[0]);
  }

  private static deletedV1(effects: TransactionEffectsV1): ObjectRef[] {
    return effects.deleted;
  }

  private static createdV2(effects: TransactionEffectsV2): ObjectRef[] {
    return map(
      effects.changed_objects,
      ([id, { id_operation, input_state, output_state }]) => {
        if (
          input_state.$kind == "NotExist" &&
          output_state.$kind === "ObjectWrite" &&
          id_operation.$kind === "Created"
        ) {
          return [id, effects.lamport_version, output_state.ObjectWrite[0]];
        }

        if (
          input_state.$kind == "NotExist" &&
          output_state.$kind === "PackageWrite" &&
          id_operation.$kind === "Created"
        ) {
          return [id, output_state.PackageWrite[0], output_state.PackageWrite[1]];
        }

        return null;
      }
    ).filter((t) => !!t) as ObjectRef[];
  }

  private static mutatedV2(effects: TransactionEffectsV2): ObjectRef[] {
    return map(
      effects.changed_objects,
      ([id, { input_state, output_state }]) => {
        if (
          input_state.$kind == "Exist" &&
          output_state.$kind === "ObjectWrite"
        ) {
          return [id, effects.lamport_version, output_state.ObjectWrite[0]];
        }

        if (
          input_state.$kind == "Exist" &&
          output_state.$kind === "PackageWrite"
        ) {
          return [id, output_state.PackageWrite[0], output_state.PackageWrite[1]];
        }

        return null;
      }
    ).filter((t) => !!t) as ObjectRef[];
  }

  private static deletedV2(effects: TransactionEffectsV2): ObjectRef[] {
    return map(
      effects.changed_objects,
      ([id, { id_operation, input_state, output_state }]) => {
        if (
          input_state.$kind == "Exist" &&
          output_state.$kind === "NotExist" &&
          id_operation.$kind === "Deleted"
        ) {
          return [id, effects.lamport_version, OBJECT_DIGEST_DELETED];
        }

        return null;
      }
    ).filter((t) => !!t) as ObjectRef[];
  }

  private static wrappedV1(effects: TransactionEffectsV1): ObjectRef[] {
    return effects.wrapped;
  }

  private static wrappedV2(effects: TransactionEffectsV2): ObjectRef[] {
    return map(
      effects.changed_objects,
      ([id, { id_operation, input_state, output_state }]) => {
        if (
          input_state.$kind == "Exist" &&
          output_state.$kind === "NotExist" &&
          id_operation.$kind === "None"
        ) {
          return [id, effects.lamport_version, OBJECT_DIGEST_WRAPPED];
        }

        return null;
      }
    ).filter((t) => !!t) as ObjectRef[];
  }
}

function arrayToMap<T extends Record<string, any>, K extends keyof T>(
  arr: T[],
  key: K[]
) {
  return arr.reduce(
    (p, v) => ((p[key.map((k) => v[k]).join("_")] = v), p),
    {} as Record<string, T>
  );
}
