import { bcs, BcsType } from '@mysten/sui/bcs';
import { inspect } from 'util';

export type SuiTypesYaml = Record<string, any> | string;

let ALL_TYPE: {
  version: string;
  types: Record<string, BcsType<any>>
};

type SuiTypeCheck = SuiTypesYaml

function isDefaultType(typeCheck: SuiTypeCheck): typeCheck is string {
  switch (typeCheck) {
    case "U8":
    case "U16":
    case "U32":
    case "U64":
    case "U128":
    case "U256":
    case "Bool":
    case "bool":
    case "BOOL" as any:
    case "STR" as any:
    case "BYTES" as any:
      return true
    default:
      return false;
  }
}

function getDefaultType(typeCheck: SuiTypeCheck) {
  switch (typeCheck) {
    case "U8":
      return bcs.u8();
    case "U16":
      return bcs.u16();
    case "U32":
      return bcs.u32();
    case "U64":
      return bcs.u64();
    case "U128":
      return bcs.u128();
    case "U256":
      return bcs.u256();
    case "Bool":
    case "bool":
    case "BOOL" as any:
      return bcs.bool();
    case "STR" as any:
      return bcs.string();
    case "BYTES" as any:
      return bcs.vector(bcs.u8());
    default:
      throw new Error("TYPE is not default")
  }
}

function parseSpecificType(name: string, _typeCheck: SuiTypeCheck): BcsType<any> | null {
  if (name == "AccountAddress" || name == "SuiAddress" || name == "ObjectID") {
    return bcs.Address;
  }  
  
  if (name == "ObjectDigest" || name == "Digest" || name == "CheckpointDigest") {
    return bcs.ObjectDigest;
  }  

  return null
}

function getType(name: string, typeCheck: SuiTypeCheck, saved: Record<string, BcsType<any>>): BcsType<any> {
  const address = parseSpecificType(name, typeCheck);

  if (address) {
    return address;
  }
  
  if (isDefaultType(typeCheck)) {
    return getDefaultType(typeCheck);
  }

  if (typeof typeCheck != 'string' && "NEWTYPE" in typeCheck) {
    return getType(name, typeCheck.NEWTYPE as SuiTypeCheck, saved)
  }

  if (typeof typeCheck != 'string' && "NEWTYPESTRUCT" in typeCheck) {
    return getType(name, typeCheck.NEWTYPESTRUCT as SuiTypeCheck, saved)
  }

  if (typeof typeCheck != 'string' && "STRUCT" in typeCheck) {
    const enumStruct = {} as Record<string, BcsType<any>>;
    for (const field of typeCheck.STRUCT) {
      const [key, value] = exportEnumField(field);
      
      enumStruct[key] = getType(name, value, saved)
    }

    return bcs.struct(name, enumStruct)
  }

  if (typeof typeCheck != 'string' && "TYPENAME" in typeCheck) {
    return bcs.lazy(() => saved[typeCheck.TYPENAME])
  }

  if (typeof typeCheck != 'string' && "OPTION" in typeCheck) {
    return bcs.option(getType(name, typeCheck.OPTION as SuiTypeCheck, saved))
  }

  if (typeof typeCheck != 'string' && "MAP" in typeCheck) {
    const { KEY, VALUE } = typeCheck.MAP as {
      KEY: SuiTypeCheck
      VALUE: SuiTypeCheck
    };
    return bcs.map(getType(name, KEY, saved), getType(name, VALUE, saved))
  }

  if (typeof typeCheck != 'string' && "SEQ" in typeCheck) {
    return bcs.vector(getType(name, typeCheck.SEQ as SuiTypeCheck, saved))
  }

  if (typeof typeCheck != 'string' && "TUPLE" in typeCheck) {
    const enumStructs = [] as BcsType<any>[];
    for (const index in typeCheck.TUPLE) {
      const field = typeCheck.TUPLE[index] as SuiTypeCheck;
      
      enumStructs.push(getType(name, field, saved))
    }

    return bcs.tuple(enumStructs)
  }

  if (typeof typeCheck != 'string' && "TUPLEARRAY" in typeCheck) {
    const type = typeCheck.TUPLEARRAY.CONTENT as SuiTypeCheck
    return bcs.fixedArray(typeCheck.TUPLEARRAY.SIZE, getType(name, type, saved))
  }

  if (typeof typeCheck != 'string' && "ENUM" in typeCheck) {
    const enumStruct = {} as Record<string, BcsType<any> | null>;
    for (const field of Object.keys(typeCheck.ENUM)) {
      const [key, value] = exportEnumField(typeCheck.ENUM[field as keyof typeof typeCheck.ENUM]);
      enumStruct[key] = value !== 'UNIT' ? getType(name, value, saved) : null
    }
    return bcs.enum(name, enumStruct)
  }

  throw new Error(`No case with ${inspect(typeCheck, { depth: null, colors: true })}`)
}

function exportEnumField(type: SuiTypeCheck) {
  const keys = Object.keys(type);
  return [keys[0], type[keys[0] as keyof SuiTypeCheck]] as const
}

export function loadTypesFromYaml(version: string, yaml: SuiTypesYaml) {
  const types = Object.keys(yaml);
  const new_record: Record<string, BcsType<any>> = {};
  for (const type of types) {
    const typeStruct = getType(type, yaml[type as keyof SuiTypesYaml] as SuiTypeCheck, new_record)
    new_record[type] = typeStruct;
  }

  ALL_TYPE = {
    version: version,
    types: new_record
  };
  return new_record;
}

export function CheckpointDataStruct() {
  return ALL_TYPE.types['CheckpointData']
}