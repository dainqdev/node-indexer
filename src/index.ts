import { inspect } from "node:util";
import logger from "./lib/logger";
import { MemoryMonitor } from "./monitor";
import setup_single_flow from "./single_flow";
import { Checkpoint } from "./sui/checkpoint";
import { initTypes } from "./sui/types";
import { Object, PackageObjectData } from "./types/sui";
import SuiObject, { PackageObject } from "./structure/object";
import { suiClient } from "./lib/sui";
import { CoinStruct, LBPairStruct } from "./generator/dlmm/dlmm.bcs";
import { bcs } from "@mysten/sui/bcs";

async function main() {
  await initTypes();
  // const monitor = new MemoryMonitor();
  // setTimeout(() => {
  //   monitor.check()
  // }, 1000)
  setup_single_flow(10, 100);
}

main();
