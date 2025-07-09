import * as env from "../../envs/env.generator";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { StructBuilder } from "./struct_builder";
import { parseStructTag } from "@mysten/sui/utils";

export async function buildDLMM() {
  const package_id = env.DLMM_PACKAGE_ID;
  const res = await StructBuilder.getPackage(package_id);
  let fileContent = `import { normalizeStructTag, parseStructTag } from "@mysten/sui/utils";import { bcs, BcsType } from "@mysten/sui/bcs";export const CoinStruct = bcs.struct("Coin", { value: bcs.u64() });type StructTag = ReturnType<typeof parseStructTag>;`;
  // console.log('res', inspect(res, { depth: 100, colors: true }));

  for (const moduleName of Object.keys(res)) {
    for (const structName of Object.keys(res[moduleName].structs)) {
      const type = await StructBuilder.generateType(
        parseStructTag(`${package_id}::${moduleName}::${structName}`),
        res[moduleName].structs[structName]
      );

      fileContent += `export const ${
        structName.endsWith("Struct") || structName.endsWith("Event")
          ? structName
          : `${structName}Struct`
      } = ${type};`;
    }
  }

  await writeFile(path.join(__dirname, "dlmm.bcs.ts"), fileContent);
}
