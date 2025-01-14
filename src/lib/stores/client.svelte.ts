import { createPublicClient, fallback, http } from 'viem'
import * as chains from 'viem/chains'

const chainsAsList = Object.values(chains)

export const getChain = (chainId: number) => {
  return chainsAsList.find((chain) => chain.id === chainId)
}

export const createClient = (chainId: number, urls: string[]) => {
  const chain = getChain(chainId)
  return createPublicClient({
    chain,
    transport: fallback(
      urls.map((url) =>
        http(url, {
          timeout: 10000,
          retryCount: 3,
          retryDelay: 1000,
          batch: {
            wait: 0,
            batchSize: 32,
          },
        }),
      ),
    ),
  })
}
