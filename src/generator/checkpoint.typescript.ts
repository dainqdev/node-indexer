import { bcs, BcsType } from "@mysten/sui/bcs";
import { inspect } from "util";
import { format } from "prettier";

export type SuiTypesYaml = Record<string, any> | string;

type SuiTypeCheck = SuiTypesYaml;
type Option<T> = T | undefined;
type FixedArray<T, L> = T[];

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
      return true;
    default:
      return false;
  }
}

function getDefaultType(typeCheck: SuiTypeCheck) {
  switch (typeCheck) {
    case "U8":
      return "number";
    case "U16":
      return "string";
    case "U32":
      return "string";
    case "U64":
      return "string";
    case "U128":
      return "string";
    case "U256":
      return "string";
    case "Bool":
    case "bool":
    case "BOOL" as any:
      return "boolean";
    case "STR" as any:
      return "string";
    case "BYTES" as any:
      return "number[]";
    default:
      throw new Error("TYPE is not default");
  }
}

function parseSpecificType(
  name: string,
  _typeCheck: SuiTypeCheck
): string | null {
  if (name == "AccountAddress" || name == "SuiAddress" || name == "ObjectID") {
    return "string";
  }

  if (
    name == "ObjectDigest" ||
    name == "Digest" ||
    name == "CheckpointDigest"
  ) {
    return "string";
  }

  return null;
}

function getType(name: string, typeCheck: SuiTypeCheck): string {
  const address = parseSpecificType(name, typeCheck);

  if (address) {
    return address;
  }

  if (isDefaultType(typeCheck)) {
    return getDefaultType(typeCheck);
  }

  if (typeof typeCheck != "string" && "NEWTYPE" in typeCheck) {
    return getType(name, typeCheck.NEWTYPE as SuiTypeCheck);
  }

  if (typeof typeCheck != "string" && "NEWTYPESTRUCT" in typeCheck) {
    return getType(name, typeCheck.NEWTYPESTRUCT as SuiTypeCheck);
  }

  if (typeof typeCheck != "string" && "STRUCT" in typeCheck) {
    let enumStruct = ``;
    for (const field of typeCheck.STRUCT) {
      const [key, value] = exportEnumField(field);

      enumStruct += `${key}: ${getType(name, value)};`;
    }

    return `{${enumStruct}}`;
  }

  if (typeof typeCheck != "string" && "TYPENAME" in typeCheck) {
    return formatStructName(typeCheck.TYPENAME);
  }

  if (typeof typeCheck != "string" && "OPTION" in typeCheck) {
    return `Option<${getType(name, typeCheck.OPTION as SuiTypeCheck)}>`;
  }

  if (typeof typeCheck != "string" && "MAP" in typeCheck) {
    const { KEY, VALUE } = typeCheck.MAP as {
      KEY: SuiTypeCheck;
      VALUE: SuiTypeCheck;
    };
    return `Map<${getType(name, KEY)}, ${getType(name, VALUE)}>`;
  }

  if (typeof typeCheck != "string" && "SEQ" in typeCheck) {
    return `${getType(name, typeCheck.SEQ as SuiTypeCheck)}[]`;
  }

  if (typeof typeCheck != "string" && "TUPLE" in typeCheck) {
    const enumStructs = [] as string[];
    for (const index in typeCheck.TUPLE) {
      const field = typeCheck.TUPLE[index] as SuiTypeCheck;

      enumStructs.push(getType(name, field));
    }

    return `[${enumStructs.join(", ")}]`;
  }

  if (typeof typeCheck != "string" && "TUPLEARRAY" in typeCheck) {
    const type = typeCheck.TUPLEARRAY.CONTENT as SuiTypeCheck;
    return `FixedArray<${getType(name, type)}, ${typeCheck.TUPLEARRAY.SIZE}>`;
  }

  if (typeof typeCheck != "string" && "ENUM" in typeCheck) {
    let enumStruct = [] as string[];

    for (const index of Object.keys(typeCheck.ENUM)) {
      const field = typeCheck.ENUM[index];
      const [key, value] = exportEnumField(field);

      enumStruct.push(`{
        ${key}: ${value !== "UNIT" ? getType(name, value) : "boolean"};
        $kind: '${key}';
      }`);
    }

    return enumStruct.join(" | ");
  }

  throw new Error(
    `No case with ${inspect(typeCheck, { depth: null, colors: true })}`
  );
}

function exportEnumField(type: SuiTypeCheck) {
  const keys = Object.keys(type);
  return [keys[0], type[keys[0] as keyof SuiTypeCheck]] as const;
}

export async function generateTypescriptFromYaml(yaml: SuiTypesYaml) {
  const types = Object.keys(yaml);
  let contents = `type Option<T> = T | undefined;type FixedArray<T, L> = T[]\n`;
  for (const type of types) {
    const typeStruct = getType(
      type,
      yaml[type as keyof SuiTypesYaml] as SuiTypeCheck
    );
    contents += `export type ${formatStructName(type)} = ${typeStruct}\n`;
  }
  return await format(contents, {
    parser: "typescript",
    tabWidth: 2,
    semi: true,
  });
}

function formatStructName(value: string) {
  return `${replaceAll(
    replaceAll(replaceAll(replaceAll(value, "::", "__"), "<", "$_"), ">", "_$"),
    ", ",
    "_$_"
  )}`;
}

function replaceAll(value: string, key: string, replacement: string) {
  while (value.includes(key)) {
    value = value.replace(key, replacement);
  }

  return value;
}
