import { bcs, BcsType } from "@mysten/sui/bcs";
import { StructTag } from "../generator";
import { normalizeSuiAddress } from "@mysten/sui/utils";

export type DynamicFieldNode<K, V> = {
  id: {
    id: string;
  };
  name: K;
  value: V;
};

export const DynamicFieldNode = <
  K extends BcsType<any>,
  V extends BcsType<any>,
>(
  key: K,
  value: V
) => {
  return bcs.struct("DynamicFieldNode", {
    id: bcs.struct("UID", {
      id: bcs.Address,
    }),
    name: key,
    value,
  });
};

export const isDynamicFields = (structTag: StructTag) => {
  return (
    normalizeSuiAddress(structTag.address) ===
      "0x0000000000000000000000000000000000000000000000000000000000000002" &&
    structTag.module === "dynamic_field" &&
    structTag.name === "Field"
  );
};
