import { normalizeStructTag, parseStructTag } from "@mysten/sui/utils";
import { suiClient } from "../../lib/sui";
import {
  SuiMoveNormalizedModules,
  SuiMoveNormalizedStruct,
  SuiMoveNormalizedType,
  SuiMoveStructTypeParameter,
} from "@mysten/sui/client";
import { bcs, BcsType } from "@mysten/sui/bcs";
import { inspect } from "util";

type StructTag = ReturnType<typeof parseStructTag>;

export class StructBuilder {
  static structCache: Record<string, string> = {};
  static packageCache: Record<string, SuiMoveNormalizedModules> = {};

  static async getPackage(packageId: string) {
    console.log('packageId', packageId);
    
    if (this.packageCache[packageId]) {
      return this.packageCache[packageId];
    }

    const oldPackageId = packageId;
    const packageData = await suiClient.getObject({
      id: packageId,
      options: {
        showPreviousTransaction: true,
      },
    });

    if (!packageData.data?.previousTransaction) {
      throw new Error(`Cannot find package ${packageId}`);
    }
    const deployTx = await suiClient.getTransactionBlock({
      digest: packageData.data?.previousTransaction,
      options: {
        showObjectChanges: true,
      },
    });

    let upgradeCapId: string | null = null;

    for (const object of deployTx.objectChanges ?? []) {
      if (
        "objectType" in object &&
        object.objectType.endsWith("package::UpgradeCap")
      ) {
        upgradeCapId = object.objectId;
      }
    }

    if (upgradeCapId) {
      const upgradeCapData = await suiClient.getObject({
        id: upgradeCapId,
        options: {
          showContent: true,
        },
      });

      if (upgradeCapData.data?.content?.dataType === "moveObject") {
        packageId = (
          upgradeCapData.data?.content as unknown as {
            fields: {
              id: {
                id: string;
              };
              package: string;
              policy: number;
              version: string;
            };
          }
        ).fields.package;
      }
    }
    const res = await suiClient.getNormalizedMoveModulesByPackage({
      package: packageId,
    });
    this.packageCache[packageId] = res;
    this.packageCache[oldPackageId] = res;

    return res;
  }

  static async generateType(
    type: StructTag,
    content?: SuiMoveNormalizedStruct,
  ) {
    const typeStr = normalizeStructTag({ ...type, typeParams: [] });

    if (this.structCache[typeStr]) {
      return Promise.resolve(this.structCache[typeStr]);
    }
    let skipParams = false;
    if (!content) {
      content = await this.getStruct(type);
    } else {
      skipParams = true;
    }
    // console.log("struct", typeStr, type);

    if (skipParams) {
      let fields = ''
      for (const field of content.fields) {
        fields += `${field.name}: ${await getType(field.type)},`;
      }

      const generated = `(${content.typeParameters.map(
        (_, index) => `arg${index}: BcsType<any>`
      )}) => bcs.struct("${type.name}", {
        fields: bcs.struct("${type.name}Fields", {
          ${fields}
        })
      })`;
  
      return removeBreakline(generated);
    }

    const args: string[] = [];

    for (const typeParam of type.typeParams) {
      args.push(
        await getType(typeParam as SuiMoveNormalizedType)
      );
    }

    let fields = ''
    for (const field of content.fields) {
      fields += `${field.name}: ${await getType(field.type)},`;
    }

    const generated = `((${content.typeParameters.map(
      (_, index) => `arg${index}: BcsType<any>`
    )}) => bcs.struct("${type.name}", {
      fields: bcs.struct("${type.name}Fields", {
        ${fields}
      })
    }))(${args.map((arg) => arg)})`;

    return removeBreakline(generated);
  }

  static async getStruct(type: StructTag) {
    const module = (await this.getPackage(type.address))[type.module];

    const struct = module.structs[type.name];

    return struct;
  }
}

function isDefaultType(typeCheck: SuiMoveNormalizedType): boolean {
  switch (typeCheck) {
    case "U8":
    case "U16":
    case "U32":
    case "U64":
    case "U128":
    case "U256":
    case "Bool":
    case "Address":
      return true;
    default:
      return false;
  }
}

function getDefaultType(typeCheck: SuiMoveNormalizedType) {
  switch (typeCheck) {
    case "U8":
      return "bcs.u8()";
    case "U16":
      return "bcs.u16()";
    case "U32":
      return "bcs.u32()";
    case "U64":
      return "bcs.u64()";
    case "U128":
      return "bcs.u128()";
    case "U256":
      return "bcs.u256()";
    case "Bool":
      return "bcs.bool()";
    case "Address":
      return "bcs.Address";
    default:
      throw new Error("TYPE is not default");
  }
}

function parseSpecificType(typeCheck: SuiMoveNormalizedType): string | null {
  if (typeof typeCheck !== "object" || !("Struct" in typeCheck)) {
    return null;
  }
  const address = typeCheck.Struct.address;
  const module = typeCheck.Struct.module;
  const name = typeCheck.Struct.name;

  if (address == "0x2" &&
    module == "object" &&
    (name == "UID")) {
      return `bcs.struct('0x2::object::ID', {
        id: bcs.Address
      })`
    }

  if (
    address == "0x2" &&
    module == "object" &&
    (name == "ID")
  ) {
    return "bcs.Address";
  }

  return null;
}

async function getType(typeCheck: SuiMoveNormalizedType): Promise<string> {
  const address = parseSpecificType(typeCheck);

  if (address) {
    return address;
  }

  if (isDefaultType(typeCheck)) {
    return getDefaultType(typeCheck);
  }

  if (typeof typeCheck == "object" && "Vector" in typeCheck) {
    return `bcs.vector(${await getType(typeCheck.Vector)})`;
  }

  if (typeof typeCheck == "object" && "TypeParameter" in typeCheck) {
    return `arg${typeCheck.TypeParameter}`;
  }

  if (typeof typeCheck == "object" && "Struct" in typeCheck) {
    return await StructBuilder.generateType({
      ...typeCheck.Struct,
      typeParams: typeCheck.Struct.typeArguments,
    } as StructTag);
  }

  throw new Error(
    `No case with ${inspect(typeCheck, { depth: null, colors: true })}`
  );
}

function removeBreakline(value: string) {
  while (value.includes("\n")) {
    value = value.replace("\n", "")
  }

  return value
}