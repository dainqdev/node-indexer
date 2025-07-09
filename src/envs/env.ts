import env from "env-var"

export const SUI_VERSION = env.get("CHECKPOINT_VERSION").default("mainnet-v1.50.1").asString();

/* Redis */
