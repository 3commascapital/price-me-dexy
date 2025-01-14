import {
  formatTransactionRequest,
  type Block,
  type BlockTag,
  type CallParameters,
  type Hex,
  type PublicClient,
} from 'viem'
import { chainIdStore } from './chain.svelte'
import { createClient } from './client.svelte'
import { rpcUrlsStore } from './rpc.svelte'

export type MinimalBlock = Block

export type Blocks = {
  latest: MinimalBlock | null
  finalized: MinimalBlock | null
}

let blocks = $state<Blocks>({
  latest: null,
  finalized: null,
})

export const blocksStore = {
  get value() {
    return blocks
  },
  set value(value: Blocks) {
    blocks = value
  },
}

let intervalDistance = $state(3_000)

export const intervalDistanceStore = {
  get value() {
    return intervalDistance
  },
  set value(value: number) {
    intervalDistance = value
  },
}

const chainId = $derived(chainIdStore.value)
const cId = $derived(chainId as keyof typeof rpcUrlsStore.value)
const client = $derived(createClient(chainId, rpcUrlsStore.value[cId]))

export const extendClient = (client: PublicClient) => {
  return client.extend((client) => ({
    async traceCall(args: CallParameters, block: Hex | BlockTag) {
      return client.request({
        // @ts-expect-error unexpected-type
        method: 'debug_traceCall',
        params: [
          formatTransactionRequest(args),
          block,
          {
            // @ts-expect-error unexpected-type
            tracer: 'callTracer' as const,
            timeout: '5s',
          },
        ],
      })
    },
  }))
}

export const clientStore = {
  get value() {
    return client
  },
}
