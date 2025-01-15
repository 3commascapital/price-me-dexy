import type { Hex } from 'viem'

export type Token = {
  address: Hex
  symbol: string
  name: string
  decimals: number
  chainId: number
}

export const defaultInputToken: Token = {
  address: '0x0000000000000000000000000000000000000000',
  symbol: 'PLS',
  name: 'Pulse',
  decimals: 18,
  chainId: 369,
}

export const defaultOutputToken: Token = {
  address: '0xefD766cCb38EaF1dfd701853BFCe31359239F305',
  symbol: 'DAI',
  name: 'Dai From Ethereum',
  decimals: 18,
  chainId: 369,
}

let inputToken = $state(defaultInputToken)
export const inputTokenStore = {
  get value() {
    return inputToken
  },
  set value(value: Token) {
    inputToken = value
  },
}
let outputToken = $state(defaultOutputToken)
export const outputTokenStore = {
  get value() {
    return outputToken
  },
  set value(value: Token) {
    outputToken = value
  },
}
