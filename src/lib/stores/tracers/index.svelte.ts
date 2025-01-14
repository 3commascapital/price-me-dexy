import {
  findAllTransfers,
  tokenFetches,
  traceCall,
  validate,
  type QuoteOptions,
  type Quoter,
  type Trace,
  type TracerOptions,
  type Transfer,
} from '../trace.svelte'
import * as piteas from './piteas'
import * as nineX from './9x'
import _ from 'lodash'
import type { Token } from '../token.svelte'
import { formatUnits, getAddress, type Block, type Hex } from 'viem'

type Key = '9x' | 'piteas'
export const quoters: Record<Key, Quoter> = {
  piteas: piteas.quoter,
  '9x': nineX.quoter,
}

export type Entry = {
  block: Block
  minOut: string
  value: string
  cost: bigint
  symbol: string
  column: number
  loading: boolean
  error: string | null
  id: string
}

export const entriesByColumn = $state<Record<Key, Entry[]>>({
  '9x': [],
  piteas: [],
})

const freshEntry = (block: Block): Entry => {
  return {
    block,
    minOut: '0',
    id: _.uniqueId(),
    value: '',
    cost: 0n,
    symbol: '',
    column: 0,
    loading: true,
    error: null,
  }
}

export const getQuotes = _.debounce(async (quoteOptions: QuoteOptions, cancelled: () => boolean) => {
  if (!validate(quoteOptions)) {
    return
  }
  if (cancelled()) {
    return
  }
  const entries = Object.entries(quoters)
  const freshEntries = entries.map(([key]) => {
    const entries = entriesByColumn[key as Key] || []
    const e = freshEntry(quoteOptions.block!)
    entriesByColumn[key as Key] = [e, ...entries.slice(0, 1024)]
    return e
  })
  const quotes = await Promise.all(entries.map(([, q]) => q(quoteOptions)))
  // separate this way so that we stack requests for traces onto one request,
  // minimizing the number of requests for rpc providersto handle
  if (cancelled()) {
    return
  }
  return await Promise.all(
    quotes.map(async (tracerOptions, i) => {
      if (!tracerOptions) {
        return null
      }
      const key = entries[i][0] as Key
      const entry = freshEntries[i]
      const res = await execute(key, quoteOptions, tracerOptions!, cancelled)
      const { situation, ...result } = res
      const existing = entriesByColumn[key] || []
      const index = existing.findIndex((val) => val.id === entry.id)
      if (index === -1) {
        return null
      }
      const minOut = formatUnits(tracerOptions.minOut, quoteOptions.outputToken!.decimals)
      const e = sanitizeEntries(
        {
          ...entry,
          minOut,
        },
        res as TraceResult,
        cancelled,
        situation === 'error' ? situation : null,
      )
      const list = $state(
        [
          ...existing.slice(0, index), //
          e,
          ...existing.slice(index + 1),
        ].slice(0, 1024),
      )
      entriesByColumn[key] = list
      return result
    }),
  )
}, 1_000)

const sanitizeEntries = (cell: Entry, result: TraceResult, cancelled: () => boolean, error?: string | null) => {
  const { names, transfers, tokenOut } = result
  if (cancelled()) {
    return Object.assign({}, cell, {
      loading: false,
      error: 'Cancelled',
    })
  }
  if (error) {
    return Object.assign({}, cell, {
      loading: false,
      error,
    })
  }
  const { decimals, address: tokenOutAddress } = tokenOut
  const amountOut = transfers.reduce((total, transfer) => {
    return names.get(getAddress(transfer.to)) === 'User' && getAddress(transfer.token) === tokenOutAddress
      ? total + transfer.value
      : total
  }, 0n)
  return Object.assign({}, cell, {
    value: formatUnits(amountOut, decimals),
    cost: BigInt(result.trace.gasUsed),
    symbol: result.names.get(getAddress(tokenOutAddress)) || '',
    loading: false,
    error: null,
  })
}

type TraceResult = {
  key: string
  names: Map<Hex, string>
  tokens: Map<Hex, Token | null>
  transfers: Transfer[]
  trace: Trace
  tokenIn: Token
  tokenOut: Token
  situation: string
}

const execute = async (
  key: string,
  quoteOptions: QuoteOptions,
  tracerOptions: TracerOptions,
  cancelled: () => boolean,
): Promise<
  | TraceResult
  | {
      key: string
      situation: string
    }
> => {
  if (!tracerOptions) {
    return {
      key,
      situation: 'error',
    }
  }
  const [callTrace, ...tokenData] = await Promise.all([
    traceCall(quoteOptions.client, quoteOptions.block!, tracerOptions.inputs),
    ...tokenFetches(quoteOptions.client, tracerOptions.tokens),
  ])
  if (cancelled()) {
    return {
      key,
      situation: 'cancelled',
    }
  }
  const transfers = findAllTransfers(tracerOptions.names, callTrace)
  tokenData.forEach((token) => {
    if (!token) {
      return
    }
    tracerOptions.tokens.set(token.address, token)
  })
  return {
    situation: 'success',
    tokenIn: quoteOptions.inputToken!,
    tokenOut: quoteOptions.outputToken!,
    key,
    names: tracerOptions.names,
    tokens: tracerOptions.tokens,
    transfers,
    trace: callTrace,
  }
}
