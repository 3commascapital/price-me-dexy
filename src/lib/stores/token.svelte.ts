import type { Hex } from "viem"

export type Token = {
  address: Hex
  symbol: string
  decimals: number
}

const defaultInputToken: Token = {
  address: '0x0000000000000000000000000000000000000000',
  symbol: 'PLS',
  decimals: 18,
}

const defaultOutputToken: Token = {
  address: '0xefD766cCb38EaF1dfd701853BFCe31359239F305',
  symbol: 'DAI',
  decimals: 18,
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
