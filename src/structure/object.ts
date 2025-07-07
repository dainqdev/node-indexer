import { bcs } from "@mysten/sui/bcs";
import { MoveObjectData, Object, ObjectData, ObjectKind, Owner, PackageObjectData } from "../types/sui";

export type StructObject = {
  data: {
    Move: MoveObjectData
    $kind: ObjectKind.Move
  };
  owner: Owner;
  previous_transaction: string;
  storage_rebate: string;
}

export type PackageObject = {
  data: {
    Package: PackageObjectData
    $kind: ObjectKind.Package
  };
  owner: Owner;
  previous_transaction: string;
  storage_rebate: string;
}

export type SuiObjectArgs<T> = Omit<Object, 'data'> & { data: T }

class SuiObject {
  static id(object: &Object) {
    if (SuiObject.isObject(object)) {
      const addrBytes = object.data.Move.contents.slice(0, 32);
      return bcs.Address.parse(new Uint8Array(addrBytes))
    } else if (SuiObject.isPackage(object)) {
      return object.data.Package.id;
    }
  }

  public static isObject(self: &Object): self is StructObject {
    return self.data.$kind === ObjectKind.Move;
  }

  public static isPackage(self: &Object): self is PackageObject {
    return self.data.$kind === ObjectKind.Package;
  }
}

export default SuiObject