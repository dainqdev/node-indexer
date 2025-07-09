import { LbPairTokenStruct } from "../generator";

const LbPair = LbPairTokenStruct()
export type LbPairToken = typeof LbPair.$inferType