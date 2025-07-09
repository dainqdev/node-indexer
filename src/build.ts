import { writeFile } from "fs/promises";
import { generateTypescriptFromYaml } from "./generator/checkpoint.typescript";
import { buildDLMM } from "./generator/dlmm/build";
import { get_type_definitions } from "./sui/types";
import path from "path";
import { SUI_VERSION } from "./envs/env";

async function build() {
  buildCheckpointType()
    .then(() => {
      console.log("build checkpoint successfully!");
    })
    .catch((e) => {
      console.error("build checkpoint failed!", e);
    });  
    
  buildDLMM()
    .then(() => {
      console.log("build dlmm successfully!");
    })
    .catch((e) => {
      console.error("build dlmm failed!", e);
    });
}

export async function buildCheckpointType() {
  const start = performance.now();
  const yaml = await get_type_definitions(SUI_VERSION);
  const fileContent = await generateTypescriptFromYaml(yaml);
  const done = performance.now();
  console.log('init type cost:', done - start);

  await writeFile(path.join(__dirname, "types", "checkpoint.ts"), fileContent);
}


build();
