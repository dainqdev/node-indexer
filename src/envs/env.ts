import env from "env-var"

export const DATABASE_URL = env.get("DATABASE_URL").required().asString()
export const ENCRYPTION_KEY = env.get("ENCRYPTION_KEY").required().asString()

export const PG_DISABLE_SSL = env.get("PG_DISABLE_SSL").asBool()
export const PG_MAX_CONNECTIONS = env
  .get("PG_MAX_CONNECTIONS")
  .default(20)
  .asIntPositive()
export const PG_CONNECTION_TIMEOUT = env
  .get("PG_CONNECTION_TIMEOUT")
  .default(10000)
  .asIntPositive()

/* Redis */
