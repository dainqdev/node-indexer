import { bcs, TypeTag } from "@mysten/sui/bcs";
import {
  isLBPositionInfoStruct,
  LBPositionInfoStruct,
  StructTag,
} from "../../generator";
import { normalizeStructTag, parseStructTag } from "@mysten/sui/utils";
import { DynamicFieldNode, isDynamicFields } from "../native_bcs";

export const isPositionInfo = (structTag: StructTag) => {
  if (!isDynamicFields(structTag) || structTag.typeParams.length !== 2) {
    return false;
  }
  const param = structTag.typeParams[1];
  if (typeof param === 'string') {
    return false;
  }

  return isLBPositionInfoStruct(param);
};

const _DynamicLBPositionInfo = DynamicFieldNode(
  bcs.Address,
  LBPositionInfoStruct()
);
export const DynamicLBPositionInfo = () => _DynamicLBPositionInfo;
