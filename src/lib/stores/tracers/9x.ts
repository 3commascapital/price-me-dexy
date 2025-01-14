import { zeroAddress, type Hex, getAddress, parseAbi, decodeFunctionData } from 'viem'
import type { QuoteOptions, Quoter } from '../trace.svelte'
import type { Token } from '../token.svelte'
import { noop } from 'lodash'

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

const abi = parseAbi([
  `function transformERC20(address inputToken,address outputToken,uint256 inputTokenAmount,uint256 minOutputTokenAmount,(uint32,bytes)[] transformations) public returns (uint256 outputTokenAmount)`,
])

export const quoter: Quoter = async (quoteOptions: QuoteOptions) => {
  const url = new URL('https://api.9mm.pro/swap/v1/quote')
  const chainId = quoteOptions.client.chain!.id as unknown as keyof typeof mappings
  const inputTokenAddress =
    mappings[chainId][quoteOptions.inputToken!.address as Hex] || quoteOptions.inputToken!.address
  url.searchParams.set('sellToken', inputTokenAddress)
  url.searchParams.set('sellAmount', quoteOptions.amount!.toString())
  url.searchParams.set('buyToken', quoteOptions.outputToken!.address)
  url.searchParams.set('slippagePercentage', (quoteOptions.allowedSlippage / 100).toString())
  url.searchParams.set('includedSources', '')
  const response = await fetch(url.toString())
  const data = (await response.json()) as NineXQuote
  const { inputToken, outputToken } = quoteOptions
  const names = new Map<Hex, string>([
    [getAddress(quoteOptions.from!), 'User'],
    [getAddress(data.to), '9x'],
    [getAddress(inputToken!.address), inputToken!.symbol],
    [getAddress(outputToken!.address), outputToken!.symbol],
  ])
  const tokens = new Map<Hex, Token | null>([
    [inputToken!.address, inputToken!],
    [outputToken!.address, outputToken!],
  ])
  data.orders.forEach((order) => {
    const r = order.fillData.router || order.fillData.vault
    if (r) {
      const router = getAddress(r)
      names.set(router, names.get(router) || order.source)
    }
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
  let minOut = 0n
  try {
    const { functionName, args } = decodeFunctionData({ abi, data: data.data })
    if (functionName === 'transformERC20') {
      const [, , , minOutputTokenAmount, ,] = args
      minOut = minOutputTokenAmount
    }
  } catch (err) {
    console.log(err)
    noop.call(err)
  }
  return {
    names,
    tokens,
    minOut,
    inputs: {
      from: quoteOptions.from!,
      to: data.to,
      data: data.data,
      value,
    },
  }
}
