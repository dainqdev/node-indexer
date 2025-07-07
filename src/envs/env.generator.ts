import env from "env-var"

export const DLMM_PACKAGE_ID = env
  .get("DLMM_PACKAGE_ID")
  .default("0x4a11ac0a882cf35df85a07c6f10517e8bb553fb90d00e33034fcd4b4707c74d2")
  .asString()