import { bcs, TypeTag } from "@mysten/sui/bcs";
import { Data, MoveObject, MovePackage, Object, Owner, StructTag as CheckpointStructTag, TypeTag as CheckpointTypeTag, } from "../types/checkpoint";
import { StructTag } from "../generator";
import { WorkerParsedObject } from "../types/worker";
import { convertStructTag } from "../lib/struct_tag";

export enum ObjectChangeStatus {
  CREATED = "CREATED",
  MUTATED = "MUTATED",
  REMOVED = "REMOVED"
}

export type StructObject = {
  data: {
    Move: MoveObject
    $kind: "Move"
  };
  owner: Owner;
  previous_transaction: string;
  storage_rebate: string;
}

export type PackageObject = {
  data: {
    Package: MovePackage
    $kind: "Package"
  };
  owner: Owner;
  previous_transaction: string;
  storage_rebate: string;
}

export type SuiObjectArgs<T> = Omit<Object, 'data'> & { data: T }

class SuiObject {
  static id(object: &Object) {
    if (object.data.$kind === 'Move') {
      const addrBytes = object.data.Move.contents.slice(0, 32);
      return bcs.Address.parse(new Uint8Array(addrBytes))
    } 

    return object.data.Package.id;
  }  
  
  static version(object: &Object) {
    if (object.data.$kind === 'Move') {
      return object.data.Move.version
    } 

    return object.data.Package.version;
  }

  static structTag(object: &Object): StructTag | null {
    if (object.data.$kind !== 'Move' || object.data.Move.type_.$kind !== 'Other') {
      return null;
    }

    return convertStructTag(object.data.Move.type_.Other)
  }

  public static asParsed<T>(object: &Object, contents: T, status: ObjectChangeStatus): WorkerParsedObject<T> {
    return {
      id: SuiObject.id(object),
      version: SuiObject.version(object),
      contents,
      status
    }
  }

  public static isObject(self: &Object): self is StructObject {
    return self.data.$kind === "Move";
  }

  public static isPackage(self: &Object): self is PackageObject {
    return self.data.$kind === "Package";
  }
}

export default SuiObject