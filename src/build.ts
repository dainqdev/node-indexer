import { buildDLMM } from "./generator/dlmm/build";

async function build() {
  buildDLMM()
    .then(() => {
      console.log("build dlmm successfully!");
    })
    .catch((e) => {
      console.error("build dlmm failed!", e);
    });
}

build();
