import { getAddress, zeroAddress, type Hex } from 'viem'
import type { QuoteOptions, Quoter } from '../trace.svelte'
import type { Token } from '../token.svelte'

export type PiteasQuotePath = Token[]

export type PiteasSubswap = {
  address: Hex
  exchange: string
  percent: number
}

export type PiteasQuoteSwap = {
  percent: number
  subswaps: PiteasSubswap[]
}

export type PiteasQuoteResponse = {
  srcToken: {
    address: Hex
    symbol: string
    decimals: number
    chainId: number
  }
  destToken: {
    address: Hex
    symbol: string
    decimals: number
    chainId: number
  }
  srcAmount: Hex
  destAmount: Hex
  gasUseEstimate: number
  gasUseEstimateUSD: number
  methodParameters: {
    calldata: Hex
    value: Hex
  }
  route: {
    paths: PiteasQuotePath[]
    swaps: PiteasQuoteSwap[]
  }
}

const zeroToToken: Record<number, string> = {
  369: 'PLS',
}

export const quoter: Quoter = async (quoteOptions: QuoteOptions) => {
  const url = new URL('https://sdk.piteas.io/quote')
  let inputAddress = quoteOptions.inputToken!.address as string
  if (inputAddress === zeroAddress) {
    inputAddress = zeroToToken[quoteOptions.client.chain!.id]
  }
  url.searchParams.set('tokenInAddress', inputAddress)
  url.searchParams.set('tokenOutAddress', quoteOptions.outputToken!.address)
  url.searchParams.set('amount', quoteOptions.amount!.toString())
  url.searchParams.set('allowedSlippage', quoteOptions.allowedSlippage.toString())
  const response = await fetch(url, {
    credentials: 'omit',
    // mode: 'no-cors',
  })
  const data = (await response.json()) as PiteasQuoteResponse
  const tokens = new Map<Hex, Token | null>()
  const names = new Map<Hex, string>()
  data.route.paths.forEach((path) => {
    path.forEach((token) => {
      const addr = getAddress(token.address)
      tokens.set(addr, tokens.get(addr) || null)
    })
  })
  const piteas = '0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6'
  names.set(getAddress(quoteOptions.from!), 'User')
  names.set(getAddress(piteas), 'Piteas')
  names.set(getAddress(quoteOptions.inputToken!.address), quoteOptions.inputToken!.symbol)
  names.set(getAddress(quoteOptions.outputToken!.address), quoteOptions.outputToken!.symbol)
  return {
    names,
    tokens,
    inputs: {
      from: quoteOptions.from!,
      to: piteas,
      data: data.methodParameters.calldata,
      value: BigInt(data.methodParameters.value),
    },
  }
}
