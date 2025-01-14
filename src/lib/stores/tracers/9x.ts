import { zeroAddress, type Hex, getAddress } from 'viem'
import type { QuoteOptions, Quoter } from '../trace.svelte'
import type { Token } from '../token.svelte'

const eee = getAddress('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')

const mappings = {
  [369]: {
    [zeroAddress]: eee,
  },
} as Record<number, Record<Hex, Hex>>

export type Order = {
  type: number
  source: string
  makerToken: Hex
  takerToken: Hex
  makerAmount: string // int
  takerAmount: string // int
  fillData: {
    tokenAddressPath?: Hex[]
    assets?: Hex[]
    router?: Hex
    vault?: Hex
  }
  fill: {
    input: string // int
    output: string // int
    adjustedOutput: string // int
    gas: number
  }
}

export type Source = {
  name: string
  proportion: string // decimal out of 1
}

export type NineXQuote = {
  chainId: number
  price: string // decimal
  guaranteedPrice: string // decimal
  to: Hex
  data: Hex
  value: Hex
  estimatedGas: Hex
  gasPrice: string
  protocolFee: string // int
  minimumProtocolFee: string // int
  buyTokenAddress: Hex
  sellTokenAddress: Hex
  buyAmount: string // int
  sellAmount: string // int
  allowanceTarget: Hex
  decodedUniqueId: string
  sellTokenToEthRate: string // decimal
  buyTokenToEthRate: string // decimal
  expectedSlippage: null
  orders: Order[]
  sources: Source[]
}

export const quoter: Quoter = async (quoteOptions: QuoteOptions) => {
  const url = new URL('https://api.9mm.pro/swap/v1/quote')
  const chainId = quoteOptions.client.chain!.id as unknown as keyof typeof mappings
  const inputTokenAddress =
    mappings[chainId][quoteOptions.inputToken!.address as Hex] || quoteOptions.inputToken!.address
  url.searchParams.set('sellToken', inputTokenAddress)
  url.searchParams.set('sellAmount', quoteOptions.amount!.toString())
  url.searchParams.set('buyToken', quoteOptions.outputToken!.address)
  url.searchParams.set('slippagePercentage', quoteOptions.allowedSlippage.toString())
  url.searchParams.set('includedSources', '')
  const response = await fetch(url.toString())
  const data = (await response.json()) as NineXQuote
  const names = new Map<Hex, string>([
    [getAddress(quoteOptions.from!), 'User'],
    [getAddress(data.to), '9x'],
    [getAddress(quoteOptions.inputToken!.address), quoteOptions.inputToken!.symbol],
    [getAddress(quoteOptions.outputToken!.address), quoteOptions.outputToken!.symbol],
  ])
  const tokens = new Map<Hex, Token | null>([
    [quoteOptions.inputToken!.address, quoteOptions.inputToken!],
    [quoteOptions.outputToken!.address, quoteOptions.outputToken!],
  ])
  data.orders.forEach((order) => {
    const router = getAddress(order.fillData.router || order.fillData.vault)
    names.set(getAddress(order.fillData.router), order.source)
    if (order.makerToken) {
      const addr = getAddress(order.makerToken)
      tokens.set(addr, tokens.get(addr) ?? null)
    }
    if (order.takerToken) {
      const addr = getAddress(order.takerToken)
      tokens.set(addr, tokens.get(addr) ?? null)
    }
    ;(order.fillData.tokenAddressPath || order.fillData.assets || []).forEach((address) => {
      const addr = getAddress(address)
      tokens.set(addr, tokens.get(addr) ?? null)
    })
  })

  const value = data.sellTokenAddress.toLowerCase() === eee.toLowerCase() ? quoteOptions.amount! : BigInt(0)
  return {
    names,
    tokens,
    inputs: {
      from: quoteOptions.from!,
      to: data.to,
      data: data.data,
      value,
    },
  }
}
