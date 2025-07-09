import { LbPairTokenStruct, LBPositionInfoStruct } from "../generator";

const LbPair = LbPairTokenStruct()
const LbPostion = LBPositionInfoStruct()

export type LbPairToken = (typeof LbPair.$inferType)['fields']
export type LbPostion = (typeof LbPostion.$inferType)['fields']