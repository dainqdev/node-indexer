import { CoinStruct, LBPairStruct, PairsStruct } from './dlmm.bcs'

export * from './dlmm.bcs'

export type CoinStructType = typeof CoinStruct.$inferType;
const _LbPairTokenStruct = LBPairStruct(CoinStruct, CoinStruct)
export const LbPairTokenStruct = () => _LbPairTokenStruct