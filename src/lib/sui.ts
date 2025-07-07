import {
  JsonRpcError,
  SuiClient,
  SuiHTTPTransport,
  type SuiTransport,
  type SuiTransportRequestOptions,
  type SuiTransportSubscribeOptions,
} from "@mysten/sui/client"

export type SuiChain = {
  id: string
  rpcUrls: string[]
}

export enum SuiChainId {
  TESTNET = "sui:testnet",
  MAINNET = "sui:mainnet",
}

const suiMainnetChain: SuiChain = {
  id: SuiChainId.MAINNET,
  rpcUrls: [
    "https://wallet-rpc.mainnet.sui.io",
    "https://mainnet.suiet.app",
    "https://fullnode.mainnet.sui.io",
    "https://sui-rpc.publicnode.com",
    "https://sui-mainnet-endpoint.blockvision.org",
  ],
}

export const suiChainConfiguration: SuiChain = suiMainnetChain

export const suiClient = new SuiClient({
  transport: fallbackTransport(
    ...suiChainConfiguration.rpcUrls.map(
      (url) =>
        new SuiHTTPTransport({
          url,
        })
    )
  ),
})

export function fallbackTransport(
  ...transports_: SuiHTTPTransport[]
): SuiTransport {
  // biome-ignore lint/style/useConst: <explanation>
  let transports = transports_

  const shouldThrow = (error: Error) => {
    const throwErrors = [
      -32050, // TransientError
      -32602, // InvalidParams
      -32700, // ParseError
    ]

    return (
      error instanceof JsonRpcError &&
      typeof error.code === "number" &&
      throwErrors.includes(Number(error.code))
    )
  }

  return {
    request: <T>(input: SuiTransportRequestOptions): Promise<T> => {
      const retryRequest = async (i = 0) => {
        try {
          return await transports[i].request<T>(input)
        } catch (error) {
          if (shouldThrow(error as Error)) throw error

          // If we've reached the end of the fallbacks, throw the error.
          if (i === transports.length - 1) throw error

          console.warn(
            "[fallbackTransport] retrying to next transport %s. Error: %s",
            i + 1,
            (error as any)?.message ?? ""
          )

          return retryRequest(i + 1)
        }
      }

      return retryRequest()
    },
    subscribe: <T>(
      input: SuiTransportSubscribeOptions<T>
    ): Promise<() => Promise<boolean>> => {
      const retrySubscribe = async (i = 0) => {
        try {
          return await transports[i].subscribe<T>(input)
        } catch (error) {
          if (shouldThrow(error as Error)) throw error

          // If we've reached the end of the fallbacks, throw the error.
          if (i === transports.length - 1) throw error

          return retrySubscribe(i + 1)
        }
      }

      return retrySubscribe()
    },
  }
}
