import { CheckpointDataStruct, AddLiquidityEvent } from "../generator";
import { Retry } from "../lib/retry";
import { CheckpointData } from "../types/checkpoint";

//162687969
export class Checkpoint {
  static async getCheckpoint(sequence_number: number) {
    const response = await this.getInternalheckpoint(sequence_number);
    return Checkpoint.from(new Uint8Array(response.slice(1)));
  }

  @Retry({ delay: 100, maxAttempts: 1000 })
  private static async getInternalheckpoint(sequence_number: number) {
    return await fetch(
      `https://checkpoints.mainnet.sui.io/${sequence_number}.chk`,
      {
        cache: "no-store"
      }
    ).then((res) => {
      if (res.status >= 400) {
        throw new Error(`Not found checkpoint ${sequence_number}`)
      } else {
        return res.arrayBuffer()
      }
    });
  }

  static from(bytes: Uint8Array) {
    const parser = CheckpointDataStruct();
    if (!parser) {
      throw new Error("Cannot find checkpoint parser");
    }

    return parser.parse(bytes) as CheckpointData;
  }

  static allObjectsChange() {
    AddLiquidityEvent
  }
}
